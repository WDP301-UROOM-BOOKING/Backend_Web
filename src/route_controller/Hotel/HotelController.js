const Hotel = require("../../models/hotel");
const User = require("../../models/user");
const asyncHandler = require("../../middlewares/asyncHandler");
const { calculateAvgRatingHotel } = require("../Feedback/FeedbackController");
require("../../models/hotelFacility");
const Reservation = require("../../models/reservation");
const HotelFacility = require("../../models/hotelFacility"); 
const HotelService = require("../../models/hotelService");
const hotelFacility = require("../../models/hotelFacility");
const cloudinary = require("../../config/cloudinaryConfig"); // Đảm bảo path đúng
const Room = require("../../models/room");
const RoomFacility = require("../../models/roomFacility");
const Bed = require("../../models/bed");


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
// remove favorite hotel
exports.removeFavoriteHotel = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Lấy từ token
  const { hotelId } = req.body;
// check userId and hotelId
  if (!userId || !hotelId) {
    return res.status(400).json({
      error: true,
      message: "Missing userId or hotelId",
    });
  }
// check user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      error: true,
      message: "User not found",
    });
  }
// remove hotelId from favorites, compare by toString()
  user.favorites = user.favorites.filter(
    (favId) => favId.toString() !== hotelId
  );
// save user
  await user.save();

  return res.status(200).json({
    error: false,
    message: "Removed hotel from favorites successfully",
    favorites: user.favorites,
  });
});
//add favorite hotel
exports.addFavoriteHotel = asyncHandler(async (req, res) => {
  const userId = req.user._id; // lấy từ token
  const { hotelId } = req.body;
// check hotelId
  if (!hotelId) {
    return res.status(400).json({
      error: true,
      message: "Missing hotelId",
    });
  }
// check user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      error: true,
      message: "User not found",
    });
  }
// check hotel exists by hotelId
  const hotelExists = await Hotel.findById(hotelId);
  if (!hotelExists) {
    return res.status(404).json({
      error: true,
      message: "Hotel not found",
    });
  }
// check hotelId is in favorites of user
  if (user.favorites.includes(hotelId)) {
    return res.status(409).json({
      error: true,
      message: "Hotel is already in favorites",
    });
  }
// add hotelId to favorites
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
    .populate({
      path: "services",
      match: { statusActive: "ACTIVE" }
    })
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
// top 3 hotel in month
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
//  Lọc các khách sạn có  các trạng thái COMPLETED checked in checkout trong tháng
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
    console.log("body: ", req.body)
    if (!hotelId) {
      return res.status(400).json({ message: "Thiếu hotelId" });
    }


    if (!statusActive) {
      statusActive = "NONACTIVE";
    }

    const newService = await HotelService.create({
      hotelId,
      name,
      description,
      type,
      price,
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
// Top 5 hotels by location
exports.getTop5HotelsByLocation = asyncHandler(async (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({
      error: true,
      message: "Location is required",
    });
  }

  // Find hotels by address matching the location
  // Use regex to allow for partial matches and case-insensitive search
  const hotels = await Hotel.find({
    address: { $regex: location, $options: "i" },
  })
    .sort({ rating: -1 }) // Sort by rating in descending order
    .limit(5)
    .populate("services")
    .populate("facilities");

  if (!hotels || hotels.length === 0) {
    return res.status(404).json({
      error: true,
      message: "No hotels found for this location",
    });
  }

  return res.status(200).json({
    error: false,
    hotels,
    message: "Get top 5 hotels by location success",
  });
});
exports.createHotel= asyncHandler(async (req, res) => {

  const { hotelName, description, address, phoneNumber, email, services, facilities, rating, star, pricePerNight, images, businessDocuments, checkInStart, checkInEnd, checkOutStart, checkOutEnd } = req.body.createHotel;
  const { createRoomList, createService } = req.body;
  
  console.log("createHotel: ", req.body.createHotel)
  console.log("createRoomList: ", req.body.createRoomList)
  console.log("createService: ", req.body.createService)
  
  const owner = req.user._id;

  // Map facility names to IDs
  const allFacilities = await hotelFacility.find({});
  const nameToIdMap = {};
  allFacilities.forEach(facility => {
    nameToIdMap[facility.name] = facility._id;
  });

  let facilitiesId = []
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
    services: [], // Will be populated after creating services
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

  try {
    // Save hotel first
    const savedHotel = await newHotel.save();
    
    // Update user's owned hotels
    const user = await User.findById(owner);
    user.ownedHotels.push(savedHotel._id);
    await user.save();

    // Create hotel services
    const createdServices = [];
    if (createService && Array.isArray(createService) && createService.length > 0) {
      for (const serviceData of createService) {
        const newService = new HotelService({
          name: serviceData.name,
          description: serviceData.description,
          type: serviceData.type,
          price: serviceData.price,
          statusActive: "NONACTIVE" // Default status
        });
        
        const savedService = await newService.save();
        createdServices.push(savedService._id);
      }
      
      // Update hotel with created services
      savedHotel.services = createdServices;
      await savedHotel.save();
    }

    // Create rooms
    const createdRooms = [];
    if (createRoomList && Array.isArray(createRoomList) && createRoomList.length > 0) {
      // Get room facilities mapping
      const allRoomFacilities = await RoomFacility.find({});
      const roomFacilityNameToIdMap = {};
      allRoomFacilities.forEach(facility => {
        roomFacilityNameToIdMap[facility.name] = facility._id;
      });

      // Get bed mapping
      const allBeds = await Bed.find({});
      const bedNameToIdMap = {};
      allBeds.forEach(bed => {
        bedNameToIdMap[bed.name] = bed._id;
      });

      for (const roomData of createRoomList) {
        // Map facility names to IDs for room
        let roomFacilitiesId = [];
        if (roomData.facilities && Array.isArray(roomData.facilities)) {
          roomFacilitiesId = roomData.facilities
            .map(name => roomFacilityNameToIdMap[name])
            .filter(id => id);
        }

        // Map bed data
        let bedArray = [];
        if (roomData.bed && Array.isArray(roomData.bed)) {
          bedArray = roomData.bed.map(bedItem => ({
            bed: bedNameToIdMap[bedItem.bed] || bedItem.bed,
            quantity: bedItem.quantity
          }));
        }

        const newRoom = new Room({
          name: roomData.name,
          type: roomData.type,
          price: roomData.price,
          capacity: roomData.capacity,
          description: roomData.description,
          images: roomData.images || [],
          quantity: roomData.quantity,
          hotel: savedHotel._id,
          bed: bedArray,
          facilities: roomFacilitiesId,
          statusActive: "NONACTIVE" // Default status
        });
        
        const savedRoom = await newRoom.save();
        createdRooms.push(savedRoom);
      }
    }

    console.log(`Created hotel with ${createdServices.length} services and ${createdRooms.length} rooms`);

    return res.status(201).json({
      error: false,
      message: "Hotel created successfully",
      hotel: savedHotel,
      servicesCreated: createdServices.length,
      roomsCreated: createdRooms.length,
      data: {
        hotel: savedHotel,
        services: createdServices,
        rooms: createdRooms
      }
    });

  } catch (error) {
    console.error("Error creating hotel:", error);
    
    // If hotel was created but services/rooms failed, we might want to clean up
    // This is optional - you can decide whether to keep the hotel or delete it
    
    return res.status(500).json({
      error: true,
      message: "Failed to create hotel",
      details: error.message
    });
  }
});


// Upload multiple hotel images
exports.uploadHotelImages = asyncHandler(async (req, res) => {
  try {
    console.log("=== UPLOAD IMAGES DEBUG ===");
    console.log("Files received:", req.files ? req.files.length : 0);
    console.log("Cloudinary object:", typeof cloudinary);
    console.log("Cloudinary uploader:", typeof cloudinary.uploader);
    
    // Debug cloudinary object
    if (!cloudinary || !cloudinary.uploader) {
      console.error("❌ Cloudinary not properly configured!");
      return res.status(500).json({
        error: true,
        message: "Cloudinary configuration error"
      });
    }

    // Check if files are provided
    if (!req.files || req.files.length === 0) {
      console.log("No files provided");
      return res.status(400).json({
        error: true,
        message: "Vui lòng chọn ít nhất 1 ảnh"
      });
    }

    // Check if exactly 5 images
    // if (req.files.length !== 5) {
    //   console.log(`Wrong number of files: ${req.files.length}/5`);
    //   return res.status(400).json({
    //     error: true,
    //     message: `Vui lòng upload đúng 5 ảnh (hiện tại: ${req.files.length}/5)`
    //   });
    // }

    const uploadedImages = [];
    const errors = [];

    console.log("Starting upload to Cloudinary...");

    // Upload each image to Cloudinary
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      try {
        console.log(`Uploading image ${i + 1}:`, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });

        // Convert buffer to base64
        const fileBuffer = file.buffer;
        const fileBase64 = `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`;

        // Upload to Cloudinary với error handling
        console.log(`Calling cloudinary.uploader.upload for image ${i + 1}...`);
        const result = await cloudinary.uploader.upload(fileBase64, {
          folder: 'hotel_images',
          public_id: `hotel_${Date.now()}_${i + 1}`,
          transformation: [
            { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
            { flags: 'progressive' }
          ]
        });

        console.log(`✅ Image ${i + 1} uploaded successfully:`, result.public_id);

        uploadedImages.push({
          public_ID: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes
        });

      } catch (uploadError) {
        console.error(`❌ Error uploading image ${i + 1}:`, uploadError);
        errors.push(`Lỗi upload ảnh ${i + 1}: ${uploadError.message}`);
      }
    }

    // Check if all uploads were successful
    // if (uploadedImages.length !== 5) {
    //   console.log("Some uploads failed, cleaning up...");
    //   // Delete successfully uploaded images if not all succeeded
    //   for (const image of uploadedImages) {
    //     try {
    //       await cloudinary.uploader.destroy(image.public_ID);
    //       console.log(`🧹 Cleaned up image: ${image.public_ID}`);
    //     } catch (deleteError) {
    //       console.error('Error deleting image:', deleteError);
    //     }
    //   }

    //   return res.status(500).json({
    //     error: true,
    //     message: "Có lỗi xảy ra khi upload ảnh",
    //     errors: errors
    //   });
    // }

    console.log("🎉 All images uploaded successfully!");
    console.log("=== END UPLOAD DEBUG ===");

    res.status(200).json({
      error: false,
      message: "Upload 5 ảnh thành công!",
      data: {
        images: uploadedImages,
        totalImages: uploadedImages.length
      }
    });

  } catch (error) {
    console.error("❌ Error uploading hotel images:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
      details: error.message
    });
  }
});

// Delete hotel images
exports.deleteHotelImages = asyncHandler(async (req, res) => {
  try {
    console.log("=== DELETE IMAGES DEBUG ===");
    console.log("Request body:", req.body);
    
    const { imageIds } = req.body; // Array of public_IDs

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      console.log("No imageIds provided");
      return res.status(400).json({
        error: true,
        message: "Vui lòng cung cấp danh sách ID ảnh cần xóa"
      });
    }

    console.log("Images to delete:", imageIds);

    const deletedImages = [];
    const errors = [];

    // Delete each image from Cloudinary
    for (const imageId of imageIds) {
      try {
        console.log(`Deleting image: ${imageId}`);
        const result = await cloudinary.uploader.destroy(imageId);
        
        console.log(`Delete result for ${imageId}:`, result);
        
        if (result.result === 'ok') {
          deletedImages.push(imageId);
        } else {
          errors.push(`Không thể xóa ảnh ${imageId}: ${result.result}`);
        }
      } catch (deleteError) {
        console.error(`Error deleting image ${imageId}:`, deleteError);
        errors.push(`Lỗi xóa ảnh ${imageId}: ${deleteError.message}`);
      }
    }

    console.log("Deleted images:", deletedImages);
    console.log("Errors:", errors);
    console.log("=== END DELETE DEBUG ===");

    res.status(200).json({
      error: false,
      message: `Đã xóa ${deletedImages.length}/${imageIds.length} ảnh`,
      data: {
        deletedImages,
        errors: errors.length > 0 ? errors : null
      }
    });

  } catch (error) {
    console.error("Error deleting hotel images:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
      details: error.message
    });
  }
});