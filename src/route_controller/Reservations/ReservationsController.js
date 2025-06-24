const Reservation = require("../../models/reservation");
const RefundingReservation = require("../../models/refundingReservation");

const cron = require("node-cron");
const asyncHandler = require("../../middlewares/asyncHandler");
const roomAvailability = require("../../models/roomAvailability");

exports.getReservationsByUserId = async (req, res) => {
  try {
    const userId = Number(req.user._id);

    const reservations = await Reservation.find({ user: userId })
      .populate("hotel")
      .populate("rooms.room")
      .sort({ createdAt: -1 });

    if (reservations.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Bạn chưa có đơn đặt phòng nào.",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Lấy danh sách đơn đặt phòng thành công.",
      data: reservations,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đặt phòng theo user:", error);
    return res.status(500).json({
      error: true,
      message: "Lỗi server khi lấy danh sách đặt phòng người dùng.",
    });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const reservation = await Reservation.findById(reservationId)
      .populate("hotel")
      .populate("rooms.room")
      .populate("services.service")

    if (!reservation) {
      return res.status(404).json({
        error: true,
        message: "Không tìm thấy đơn đặt phòng.",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Lấy thông tin đơn đặt phòng thành công.",
      data: reservation,
    });
  } catch (error) {
    console.error("Lỗi khi lấy đơn đặt phòng theo ID:", error);
    return res.status(500).json({
      error: true,
      message: "Lỗi server khi lấy thông tin đơn đặt phòng.",
    });
  }
};

exports.getReservationDetailById = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  if (!reservationId) {
    return res.status(400).json({
      message: RESERVATION.INVALID_STATUS,
    });
  }

  try {
    const reservation = await Reservation.findById(reservationId)
      .populate("user", "name email phoneNumber") // Chỉ lấy các trường cần thiết
      .populate("hotel", "hotelName address rating star pricePerNight") // Chỉ lấy các trường cần thiết
      .populate("rooms.room", "name type price"); // Populate chi tiết phòng đặt

    if (!reservation) {
      return res.status(404).json({ message: RESERVATION.NOT_FOUND });
    }

    return res.status(200).json({
      reservation,
      message: "Get detail reservation successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

const autoUpdateNotPaidReservation = asyncHandler(async () => {
  const reservations = await Reservation.find({ status: "NOT PAID" });

  const now = new Date();

  for (const r of reservations) {
    const createdAt = new Date(r.createdAt); // assuming you have timestamps enabled
    const diffInMinutes = (now - createdAt) / (1000 * 60); // convert ms to minutes

    if (diffInMinutes >= 5 && r.status === "NOT PAID") {
      r.status = "CANCELLED";
      await r.save();
      console.log(
        `Reservation ${r._id} đã bị hủy do quá 5 phút chưa thanh toán.`
      );
    }
  }

  // 2. Xử lý đơn PENDING mà quá thời gian check-in
  const pendingReservations = await Reservation.find({
    status: "PENDING",
  }).populate("user");

  for (const r of pendingReservations) {
    try {
      const checkinDeadline = new Date(r.checkInDate);
      checkinDeadline.setHours(24, 0, 0, 0); // Đặt thời gian là 12:00 PM ngày check-in

      if (now > checkinDeadline) {
        r.status = "CANCELLED";
        await r.save();

        await RefundingReservation.create({
          user: r.user._id,
          reservation: r._id,
          refundAmount: r.totalPrice,
          status: "WAITING_FOR_BANK_INFO",
        });

        try {
          const result = await roomAvailability.deleteMany({
            reservation: r._id,
          });
          console.log(
            `Đã xóa ${result.deletedCount} bản ghi RoomAvailability với reservationId = ${r._id}`
          );
        } catch (error) {
          console.error(
            "Lỗi khi xóa RoomAvailability theo reservationId:",
            error
          );
        }

        console.log(
          `Reservation ${r._id} đã bị hủy do quá 12h trưa ngày check-in.`
        );
      }
    } catch (error) {
      console.error(`Lỗi khi xử lý reservation ${r._id}:`, error);
    }
  }

  const bookedReservations = await Reservation.find({ status: "BOOKED" });
  for (const r of bookedReservations) {
    const checkinDate = new Date(r.checkInDate); // đảm bảo checkinDate là ngày giờ
    const checkoutDate = new Date(r.checkOutDate); // đảm bảo checkinDate là ngày giờ

    if (now > checkinDate && now < checkoutDate) {
      r.status = "CHECKED IN";
      await r.save();
      console.log(
        `Reservation ${r._id} đã được chuyển sang trạng thái CHECKED IN.`
      );
    }
  }

  const checkedInReservations = await Reservation.find({
    status: "CHECKED IN",
  });
  for (const r of checkedInReservations) {
    const checkinDate = new Date(r.checkInDate); // đảm bảo checkinDate là ngày giờ
    const checkoutDate = new Date(r.checkOutDate); // đảm bảo checkinDate là ngày giờ

    if (now > checkinDate && now > checkoutDate) {
      r.status = "CHECKED OUT";
      await r.save();
      console.log(
        `Reservation ${r._id} đã được chuyển sang trạng thái CHECKED OUT.`
      );
    }
  }
});

// setinterval auto run after each minutes
cron.schedule(
  "*/1 * * * *",
  () => {
    // autoUpdateReservationStatus();
    autoUpdateNotPaidReservation();
    console.log(`Đã xóa not paid reservation sau 5 phút`);
  },
  {
    timezone: "Asia/Ho_Chi_Minh",
  }
);

exports.updateReservationById = async (req, res) => {
  try {
    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("hotel")
      .populate("rooms.room");
    updated.up;
    if (!updated)
      return res
        .status(404)
        .json({ error: true, message: "Không tìm thấy đơn đặt phòng." });

    res
      .status(200)
      .json({ error: false, message: "Cập nhật thành công.", data: updated });
  } catch (err) {
    console.error("Lỗi cập nhật:", err);
    res.status(500).json({ error: true, message: "Lỗi server." });
  }
};
