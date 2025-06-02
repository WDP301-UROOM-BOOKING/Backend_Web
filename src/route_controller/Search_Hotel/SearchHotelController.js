const Hotel = require("../../models/hotel");
const Room = require("../../models/room");
const Reservation = require("../../models/reservation");
const HotelService = require("../../models/hotelService");
const { HOTEL } = require("../../utils/constantMessage");
const { calculateAvgRatingHotel } = require("../Feedback/FeedbackController");
const Facility = require("../../models/hotelFacility");
const User = require("../../models/user");

exports.searchAndFilterHotels = async (req, res) => {
  try {
    const {
      hotelName,
      address,
      checkinDate,
      checkoutDate,
      star,
      district,
      numberOfPeople,
      serviceNames,
      selectedFacilities,
      page = 1,
      limit = 3,
    } = req.query;

    let user = null;
    if (req.user && req.user._id) {
      user = await User.findById(req.user._id);
      if (!user) {
        console.warn("User from token not found, proceeding without user.");
      }
    }

    let query = { adminStatus: "APPROVED", ownerStatus: "ACTIVE" };

    if (selectedFacilities !== "") {
      const facilityArray = selectedFacilities.split(",").map((f) => f.trim());
      const facilities = await Facility.find({
        name: {
          $in: facilityArray.map((name) => new RegExp(`^${name}$`, "i")),
        },
      });
      if (facilities.length > 0) {
        const facilityIds = facilities.map((f) => f._id);
        query.facilities = { $in: facilityIds };
      } else {
        return res.status(200).json({
          error: false,
          hotels: [],
          totalPages: 0,
          currentPage: Number(page),
          message: "Không tìm thấy khách sạn với các tiện nghi đã chọn",
        });
      }
    }

    if (hotelName) {
      query.hotelName = { $regex: hotelName, $options: "i" };
    }

    const andConditions = [];

    if (address) {
      andConditions.push({ address: { $regex: address, $options: "i" } });
    }

    if (district) {
      andConditions.push({ address: { $regex: district, $options: "i" } });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    if (star) {
      if (star === 0) {
        // Không lọc theo star
      } else if (/^\d$/.test(star) && Number(star) >= 1 && Number(star) <= 5) {
        query.star = Number(star);
      }
    }

    if (serviceNames) {
      const serviceArray = serviceNames.split(",");
      const services = await HotelService.find({
        name: { $in: serviceArray.map((name) => new RegExp(`^${name}$`, "i")) },
      });
      query.services = { $in: services.map((s) => s._id) };
    }

    const allHotels = await Hotel.find(query)
      .populate("services")
      .populate("facilities");

    const hotelsWithRooms = await Promise.all(
      allHotels.map(async (hotel) => {
        const rooms = await Room.find({ hotel: hotel._id });
        return { hotel, rooms };
      })
    );

    let finalHotels = [];

    if (checkinDate && checkoutDate) {
      let finalHotelTemps = await Promise.all(
        hotelsWithRooms.map(async ({ hotel, rooms }) => {
          const selectedCheckIn = new Date(checkinDate);
          const selectedCheckOut = new Date(checkoutDate);
          const overlappingReservations = await Reservation.find({
            hotel: hotel._id,
            status: { $nin: ["CANCELLED", "COMPLETED"] },
            $and: [
              { checkInDate: { $lt: selectedCheckOut } },
              { checkOutDate: { $gt: selectedCheckIn } },
            ],
          }).populate("rooms.room");

          const allRooms = await Room.find({ hotel: hotel._id });

          // Calculate total booked quantity per room
          const roomBookedQuantities = {};
          const roomDateRanges = {}; // để lưu khoảng ngày của roomId

          overlappingReservations.forEach((res) => {
            const resCheckIn = new Date(res.checkInDate);
            const resCheckOut = new Date(res.checkOutDate);

            res.rooms.forEach((roomItem) => {
              const roomId = roomItem.room._id.toString();
              const quantity = roomItem.quantity;

              const currentRange = roomDateRanges[roomId];
              const currentQuantity = roomBookedQuantities[roomId] || 0;

              if (currentRange && resCheckIn <= currentRange.checkOut) {
                // nằm trong khoảng → cộng dồn
                roomBookedQuantities[roomId] = currentQuantity + quantity;
              } else {
                // ngoài khoảng → lấy max
                if (quantity > currentQuantity) {
                  roomBookedQuantities[roomId] = quantity;
                  roomDateRanges[roomId] = {
                    checkIn: resCheckIn,
                    checkOut: resCheckOut,
                  };
                }
              }
            });
          });

          const { avgValueRating, totalFeedbacks } =
            await calculateAvgRatingHotel(hotel._id);

          const availableRooms = allRooms
            .map((room) => {
              const booked = roomBookedQuantities[room._id.toString()] || 0;
              const available = room.quantity - booked;
              return {
                ...room.toObject(),
                availableQuantity: available,
              };
            })
            .filter((room) => room.availableQuantity > 0);

          const totalCapacity = availableRooms.reduce(
            (sum, room) => sum + room.capacity * room.availableQuantity,
            0
          );

          const isFavorite = user
            ? user.favorites.includes(hotel._id.toString())
            : false;

          return {
            isFavorite,
            avgValueRating,
            totalFeedbacks,
            hotel,
            availableRooms,
            totalCapacity,
          };
        })
      );
      finalHotels = finalHotelTemps.filter(
        ({ totalCapacity }) => totalCapacity >= Number(numberOfPeople)
      );
    } else {
      finalHotels = await Promise.all(
        hotelsWithRooms.map(async ({ hotel, rooms }) => {
          const { avgValueRating, totalFeedbacks } =
            await calculateAvgRatingHotel(hotel._id);

          const totalCapacity = rooms.reduce(
            (sum, room) => sum + room.capacity,
            0
          );

          const isFavorite = user
            ? user.favorites.includes(hotel._id.toString())
            : false;

          return {
            isFavorite,
            avgValueRating,
            totalFeedbacks,
            hotel,
            availableRooms: rooms,
            totalCapacity,
          };
        })
      );

      finalHotels = finalHotels.filter(
        ({ totalCapacity }) => totalCapacity >= Number(numberOfPeople)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedHotels = finalHotels.slice(startIndex, endIndex);

    return res.status(200).json({
      error: false,
      hotels: paginatedHotels,
      totalPages: Math.ceil(finalHotels.length / limit),
      currentPage: Number(page),
      message: HOTEL.SUCCESS,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: true,
      message: error.message || "Internal server error",
    });
  }
};
