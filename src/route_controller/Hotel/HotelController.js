const Hotel = require("../../models/hotel");
const User = require("../../models/user");
const asyncHandler = require("../../middlewares/asyncHandler");
const { calculateAvgRatingHotel } = require("../Feedback/FeedbackController");
require("../../models/hotelFacility");
const Reservation = require("../../models/reservation");
const HotelFacility = require("../../models/hotelFacility"); 
const HotelService = require("../../models/hotelService");
const hotelFacility = require("../../models/hotelFacility");
// exports.getAllHotels = asyncHandler(async (req, res) => {
//     const {page= 1, limit= 5}= req.query;

//     const query = {};

//     // 📄 Pagination
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const skip = (pageNum - 1) * limitNum;

//     const hotels = await Hotel.find()
//         .skip(skip)
//         .limit(limitNum)
//         .populate("services")
//         .populate("facilities");

//   if (hotels.length === 0) {
//     return res.status(404).json({
//       error: true,
//       message: "No hotels found",
//     });
//   }

//   return res.status(200).json({
//     error: false,
//     hotels,
//     message: "Get all hotels success",
//   });
// });

exports.getAllHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find().populate("services").populate("facilities");

  if (hotels.length === 0) {
    return res.status(404).json({
      error: true,
      message: "No hotels found",
    });
  }

  return res.status(200).json({
    error: false,
    hotels,
    message: "Get all hotels success",
  });
});

exports.getHotelsByIds = asyncHandler(async (req, res) => {
  const { ids, params } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({
      error: true,
      message: "No hotel ids provided or invalid format",
    });
  }

  const { star, address, district } = params || {};
  let query = {
    _id: { $in: ids },
  };

  if (star) {
    if (star === "0") {
    } else if (/^\d$/.test(star) && Number(star) >= 1 && Number(star) <= 5) {
      // Nếu star là một số từ 1 đến 5
      query.star = Number(star);
    }
  }

  // Thêm điều kiện $and nếu có address hoặc district
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

  // Tìm kiếm theo query đã build
  const listHotels = await Hotel.find(query)
    .populate("services")
    .populate("facilities");

  // Tính trung bình rating
  const finalHotelTemps = await Promise.all(
    listHotels.map(async (hotel) => {
      const { avgValueRating, totalFeedbacks } = await calculateAvgRatingHotel(
        hotel._id
      );
      return {
        avgValueRating,
        totalFeedbacks,
        hotel,
      };
    })
  );

  return res.status(200).json({
    error: false,
    hotels: finalHotelTemps,
    message: "Get filtered hotels success",
  });
});

exports.getHotelsByOwnerId = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      error: true,
      message: "No owner provided",
    });
  }

  // Tìm kiếm theo query đã build
  const hotel = await Hotel.find({ owner: id });

  console.log("hotel: ", hotel);

  return res.status(200).json({
    error: false,
    hotels: hotel,
    message: "Get filtered hotels success",
  });
});

exports.removeFavoriteHotel = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Lấy từ token
  const { hotelId } = req.body;

  if (!userId || !hotelId) {
    return res.status(400).json({
      error: true,
      message: "Missing userId or hotelId",
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      error: true,
      message: "User not found",
    });
  }

  user.favorites = user.favorites.filter(
    (favId) => favId.toString() !== hotelId
  );

  await user.save();

  return res.status(200).json({
    error: false,
    message: "Removed hotel from favorites successfully",
    favorites: user.favorites,
  });
});

exports.addFavoriteHotel = asyncHandler(async (req, res) => {
  const userId = req.user._id; // lấy từ token
  const { hotelId } = req.body;

  if (!hotelId) {
    return res.status(400).json({
      error: true,
      message: "Missing hotelId",
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      error: true,
      message: "User not found",
    });
  }

  const hotelExists = await Hotel.findById(hotelId);
  if (!hotelExists) {
    return res.status(404).json({
      error: true,
      message: "Hotel not found",
    });
  }

  if (user.favorites.includes(hotelId)) {
    return res.status(409).json({
      error: true,
      message: "Hotel is already in favorites",
    });
  }

  user.favorites.push(hotelId);
  await user.save();

  return res.status(200).json({
    error: false,
    message: "Added hotel to favorites successfully",
    favorites: user.favorites,
  });
});

exports.getHotelDetails = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  let user = null;
  if (req.user && req.user._id) {
    user = await User.findById(req.user._id);
    if (!user) {
      console.warn("User from token not found, proceeding without user.");
    }
  }

  if (!hotelId) {
    return res.status(400).json({
      error: true,
      message: "Hotel ID is required",
    });
  }

  const hotel = await Hotel.findById(hotelId)
    .populate("owner")
    .populate("services")
    .populate("facilities");

  if (!hotel) {
    return res.status(404).json({
      error: true,
      message: "Hotel not found",
    });
  }
  let isFavorite = false;
  if (user) {
    isFavorite = user ? user.favorites.includes(hotel._id.toString()) : false;
  }

  return res.status(200).json({
    error: false,
    isFavorite,
    hotel,
    message: "Get hotel details success",
  });
});
exports.getTop3HotelsThisMonth = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setMonth(startOfMonth.getMonth() - 2);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(1);
    endOfMonth.setHours(0, 0, 0, 0);

    const topHotels = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lt: endOfMonth },
          status: { $in: ["COMPLETED", "CHECKED IN", "CHECKED OUT"] },
        },
      },
      {
        $group: {
          _id: "$hotel",
          totalBookings: { $sum: 1 },
        },
      },
      {
        $sort: { totalBookings: -1 },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: "hotels",
          localField: "_id",
          foreignField: "_id",
          as: "hotelInfo",
        },
      },
      {
        $unwind: "$hotelInfo",
      },
      {
        $project: {
          _id: 0,
          hotelId: "$_id",
          totalBookings: 1,
          hotelName: "$hotelInfo.hotelName",
          address: "$hotelInfo.address",
          rating: "$hotelInfo.rating",
          star: "$hotelInfo.star",
          pricePerNight: "$hotelInfo.pricePerNight",
          images: "$hotelInfo.images",
        },
      },
    ]);

    return res.status(200).json(topHotels);
  } catch (error) {
    console.error("Error getting top 3 hotels:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.getHotelsByOwner = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  if (!ownerId) {
    return res.status(400).json({
      error: true,
      message: "User ID is missing from token",
    });
  }

  const hotels = await Hotel.find({ owner: ownerId })
    .populate("services")
    .populate("facilities");

  if (!hotels || hotels.length === 0) {
    return res.status(404).json({
      error: true,
      message: "No hotels found for this owner",
    });
  }

  return res.status(200).json({
    error: false,
    hotels,
    message: "Get hotels by owner successfully",
  });
});



exports.updateHotelInfo = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const updateData = req.body;

  if (!hotelId) {
    return res.status(400).json({
      error: true,
      message: "Hotel ID is required",
    });
  }

  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    return res.status(404).json({
      error: true,
      message: "Hotel not found",
    });
  }

  const allFacilities = await HotelFacility.find({});
  const nameToIdMap = {};
  allFacilities.forEach(facility => {
    nameToIdMap[facility.name] = facility._id;
  });


  if (updateData.facilities && Array.isArray(updateData.facilities)) {
    hotel.facilities = updateData.facilities
      .map(name => nameToIdMap[name])
      .filter(id => id); 
  }

  const updatableFields = [
    "hotelName",
    "description",
    "address",
    "phoneNumber",
    "services",
    "rating",
    "star",
    "pricePerNight",
    "images",
    "businessDocuments",
    "adminStatus",
    "ownerStatus",
    "checkInStart",
    "checkInEnd",
    "checkOutStart",
    "checkOutEnd",
    "email",
  ];

  updatableFields.forEach(field => {
    if (updateData[field] !== undefined) {
      hotel[field] = updateData[field];
    }
  });

  if (updateData.adminStatus) {
    hotel.decisionDate = new Date();
  }

  try {
    await hotel.save();
    return res.status(200).json({
      error: false,
      message: "Hotel updated successfully",
      hotel,
    });
  } catch (error) {
    console.error("Error saving hotel:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to update hotel",
    });
  }
});
exports.updateHotelServiceStatus = async (req, res) => {
  console.log('1')
  try {
    const { hotelId } = req.params;
    const { serviceId, statusActive } = req.body;

    console.log("body: ", req.body)
    if (!["ACTIVE", "NONACTIVE"].includes(statusActive)) {
      return res.status(400).json({ message: "Invalid statusActive value" });
    }

    console.log("2")
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    console.log("3")

    const isServiceInHotel = hotel.services.includes(serviceId);
    if (!isServiceInHotel) {
      return res.status(400).json({ message: "Service does not belong to this hotel" });
    }
    console.log("4")

    const updatedService = await HotelService.findByIdAndUpdate(
      serviceId,
      { statusActive },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "HotelService not found" });
    }

    console.log("5")

    res.status(200).json({
      message: "Service status updated successfully",
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createHotelService = async (req, res) => {
  try {
    const { hotelId, name, description, type, price } = req.body;
    let { statusActive } = req.body;

    if (!hotelId) {
      return res.status(400).json({ message: "Thiếu hotelId" });
    }


    if (!statusActive) {
      statusActive = "ACTIVE";
    }

    const newService = await HotelService.create({
      hotelId,
      name,
      description,
      type,
      price,
      statusActive,
    });

  
    await Hotel.findByIdAndUpdate(hotelId, {
      $push: { services: newService._id },
    });

    res.status(201).json({ message: "Tạo dịch vụ thành công", service: newService });
  } catch (error) {
    console.error("Lỗi tạo dịch vụ khách sạn:", error);
    res.status(500).json({ message: "Tạo dịch vụ thất bại", error: error.message });
  }
};


exports.changeStatusHotelInfo = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const {ownerStatus} = req.body;

  console.log("ownerStatus: ", ownerStatus)
  if (!hotelId) {
    return res.status(400).json({
      error: true,
      message: "Hotel ID is required",
    });
  }

  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    return res.status(404).json({
      error: true,
      message: "Hotel not found",
    });
  }

  if (ownerStatus) {
    hotel.ownerStatus = "NONACTIVE";
  }else{
    hotel.ownerStatus = "ACTIVE";
  }

  try {
    await hotel.save();
    return res.status(200).json({
      error: false,
      message: "Hotel updated successfully",
      hotel,
    });
  } catch (error) {
    console.error("Error saving hotel:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to update hotel",
    });
  }
});

exports.createHotel= asyncHandler(async (req, res) => {

  const { hotelName, description, address, phoneNumber, email, services, facilities, rating, star, pricePerNight, images, businessDocuments, checkInStart, checkInEnd, checkOutStart, checkOutEnd } = req.body;
  const owner = req.user._id;

  const allFacilities = await hotelFacility.find({});
  const nameToIdMap = {};
  allFacilities.forEach(facility => {
    nameToIdMap[facility.name] = facility._id;
  });

  let facilitiesId= []
  if (facilities && Array.isArray(facilities)) {
    facilitiesId = facilities
      .map(name => nameToIdMap[name])
      .filter(id => id); 
  }
  console.log("facilitiesId: ", facilitiesId)

  const newHotel = new Hotel({
    hotelName,
    description,
    address,
    phoneNumber: phoneNumber,
    email: email,
    services,
    facilities: facilitiesId,
    pricePerNight: 0,
    rating: 0,
    star,
    images,
    businessDocuments,
    owner,
    checkInStart,
    checkInEnd,
    checkOutStart,
    checkOutEnd 
  });
  console.log("2")

  try {
    const savedHotel = await newHotel.save();
      const user = await User.findById(owner);
      user.ownedHotels.push(savedHotel._id);
      await user.save(); 
    return res.status(201).json({
      error: false,
      message: "Hotel created successfully",
      hotel: savedHotel,
    });
  } catch (error) {
    console.error("Error creating hotel:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to create hotel",
    });
  }
});