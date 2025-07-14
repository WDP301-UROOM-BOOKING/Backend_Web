const mongoose = require("mongoose");
const MonthlyPayment = require("./src/models/monthlyPayment");
const Reservation = require("./src/models/reservation");    
const Hotel = require("./src/models/hotel");
const Room = require("./src/models/room");
require("dotenv").config();

const uri = process.env.MONGODB_URI_DEVELOPMENT;

async function seedMonthlyPayments() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Lấy ngày đầu tháng hiện tại
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);

    // Lấy tất cả reservation trước tháng hiện tại
    const completedReservations = await Reservation.find({
      status: { $in: ["COMPLETED", "CHECKED OUT", "BOOKED", "PENDING", "CHECKED IN", "OFFINE"] },
      createdAt: { $lt: startOfCurrentMonth } // Chỉ lấy trước tháng hiện tại
    }).populate("rooms.room");

    console.log(`Lấy reservations trước tháng ${currentMonth + 1}/${currentYear}`);
    console.log("Số lượng reservations: ", completedReservations.length);

    // Gom nhóm theo hotel, month, year
    const monthlyMap = {};
    completedReservations.forEach((reservation) => {
      const date = new Date(reservation.createdAt);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hotel = reservation.hotel.toString();
      const key = `${hotel}-${year}-${month}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          hotel: reservation.hotel,
          year,
          month,
          amount: 0,
          paymentCount: 0,
          accountHolderName: "Le Kim Hoang Nguyen",
          accountNumber: "123456789",
          bankName: "Vietcombank",
          branchName: "Vietcombank Branch",
        };
      }
      monthlyMap[key].amount += reservation.totalPrice || 0;
      monthlyMap[key].paymentCount += 1;
    });

    // Chuyển thành mảng và insert vào monthlyPayments
    const monthlyDocs = Object.values(monthlyMap);
    if (monthlyDocs.length > 0) {
      await MonthlyPayment.insertMany(monthlyDocs);
      console.log("Đã tạo monthly payments:", monthlyDocs.length);
      console.log("Chi tiết theo tháng:");
      monthlyDocs.forEach(doc => {
        console.log(`- Tháng ${doc.month}/${doc.year}: ${doc.paymentCount} reservations, tổng ${doc.amount.toLocaleString('vi-VN')}đ`);
      });
    } else {
      console.log("Không tìm thấy reservations trước tháng hiện tại.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Lỗi:", err);
    process.exit(1);
  }
}

seedMonthlyPayments();