const Room = require("../../models/room");
const Hotel = require("../../models/hotel");
const RoomFacility = require("../../models/roomFacility");
const Bed = require("../../models/bed");
const reservation = require("../../models/reservation");
const asyncHandler = require("../../middlewares/asyncHandler");
const cloudinary = require("../../config/cloudinaryConfig");

const getRoomsByHotel = async (req, res) => {
  const { hotelId } = req.params;
  const { checkInDate, checkOutDate, page = 1, limit = 50 } = req.query;

  // Validate inputs
  if (!hotelId || !checkInDate || !checkOutDate) {
    return res.status(400).json({
      error: true,
      message: "Missing required fields (hotelId, checkInDate, or checkOutDate).",
    });
  }
  try {
    const selectedCheckIn = new Date(checkInDate);
    const selectedCheckOut = new Date(checkOutDate);
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch overlapping reservations
    const overlappingReservations = await reservation
      .find({
        hotel: hotelId,
        status: { $nin: ["CANCELLED", "COMPLETED"] },
        $and: [{ checkInDate: { $lt: selectedCheckOut } }, { checkOutDate: { $gt: selectedCheckIn } }],
      })
      .populate("rooms.room");

    // Get all rooms for this hotel
    const allRooms = await Room.find({ hotel: hotelId, statusActive: "ACTIVE" });

    // Calculate the number of rooms booked for each room
    const roomBookedQuantities = {};
    // Create a day-by-day occupancy map for each room
    const dailyOccupancy = {};

    overlappingReservations.forEach((res) => {
      const resCheckIn = new Date(res.checkInDate);
      const resCheckOut = new Date(res.checkOutDate);

      res.rooms.forEach((roomItem) => {
        const roomId = roomItem.room._id.toString();
        const quantity = roomItem.quantity;

        if (!dailyOccupancy[roomId]) {
          dailyOccupancy[roomId] = {};
        }

        // Mark each day of this reservation with the booked quantity
        let currentDate = new Date(resCheckIn);
        while (currentDate < resCheckOut) {
          const dateKey = currentDate.toISOString().split("T")[0];

          // If multiple reservations on same day, add them up
          dailyOccupancy[roomId][dateKey] = (dailyOccupancy[roomId][dateKey] || 0) + quantity;

          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    });

    // Find the maximum occupancy for each room across the entire period
    for (const roomId in dailyOccupancy) {
      const maxOccupancy = Math.max(...Object.values(dailyOccupancy[roomId]));
      roomBookedQuantities[roomId] = maxOccupancy;
    }

    // Determine available rooms with remaining quantity
    const availableRooms = allRooms
      .map((room) => {
        const booked = roomBookedQuantities[room._id.toString()] || 0;
        console.log("booked: ", booked);
        const available = room.quantity - booked;
        return {
          ...room.toObject(),
          availableQuantity: available,
        };
      })
      .filter((room) => room.availableQuantity > 0);

    // Apply pagination
    const paginatedRooms = availableRooms.slice(skip, skip + limitNumber);
    const totalRooms = availableRooms.length;
    const totalPages = Math.ceil(totalRooms / limitNumber);

    return res.status(200).json({
      error: false,
      message: "Rooms fetched successfully",
      rooms: paginatedRooms,
      totalRooms,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error fetching room availability:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

const getRoomById = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findById(roomId)
      .populate("hotel")
      .populate("facilities")
      .populate("bed.bed", "bedType capacity name description");

    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng với ID đã cung cấp." });
    }

    res.status(200).json({ room });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin phòng:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thông tin phòng." });
  }
};

const getRoomByHotelIdOfOwner = async (req, res) => {
  const { hotelId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    // Validate hotel ID
    if (!hotelId) {
      return res.status(400).json({
        error: true,
        message: "Hotel ID is required",
      });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch all rooms for this hotel with populated data
    const rooms = await Room.find({ hotel: hotelId })
      .populate("facilities")
      .populate("bed.bed", "bedType capacity name description")
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const totalRooms = await Room.countDocuments({ hotel: hotelId });
    const totalPages = Math.ceil(totalRooms / limitNumber);

    return res.status(200).json({
      error: false,
      message: "Rooms fetched successfully",
      rooms,
      totalRooms,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error fetching rooms for owner:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

const createRoom = asyncHandler(async (req, res) => {
  const { hotelId, name, type, price, capacity, description, quantity, facilities, bed, images } = req.body;

  // Validate required fields
  if (!hotelId || !name || !type || !price || !capacity || !description || !quantity) {
    return res.status(400).json({
      error: true,
      message: "Missing required fields (hotelId, name, type, price, capacity, description, quantity)",
    });
  }

  // Check if hotel exists
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return res.status(404).json({
      error: true,
      message: "Hotel not found",
    });
  }

  // Convert facility names to IDs if facilities are provided as names
  let facilitiesId = [];
  if (facilities && Array.isArray(facilities)) {
    const allFacilities = await RoomFacility.find({});
    const nameToIdMap = {};
    allFacilities.forEach((facility) => {
      nameToIdMap[facility.name] = facility._id;
    });

    facilitiesId = facilities.map((name) => nameToIdMap[name]).filter((id) => id);
  }

  // Validate bed array structure
  let bedData = [];
  if (bed && Array.isArray(bed)) {
    bedData = bed.filter((bedItem) => bedItem.bed && bedItem.quantity && bedItem.quantity > 0);
  }

  const newRoom = new Room({
    name,
    type,
    price: Number(price),
    capacity: Number(capacity),
    description,
    quantity: Number(quantity),
    hotel: hotelId,
    bed: bedData,
    facilities: facilitiesId,
    images: images || [],
    statusActive: "NONACTIVE", // Default status
  });

  try {
    const savedRoom = await newRoom.save();

    // Populate the saved room for response
    const populatedRoom = await Room.findById(savedRoom._id)
      .populate("facilities")
      .populate("bed.bed", "bedType capacity name description");

    return res.status(201).json({
      error: false,
      message: "Room created successfully",
      room: populatedRoom,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to create room",
      details: error.message,
    });
  }
});

// Upload multiple room images
const uploadRoomImages = asyncHandler(async (req, res) => {
  try {
    console.log("=== UPLOAD ROOM IMAGES DEBUG ===");
    console.log("Files received:", req.files ? req.files.length : 0);
    console.log("Cloudinary object:", typeof cloudinary);
    console.log("Cloudinary uploader:", typeof cloudinary.uploader);

    // Debug cloudinary object
    if (!cloudinary || !cloudinary.uploader) {
      console.error("❌ Cloudinary not properly configured!");
      return res.status(500).json({
        error: true,
        message: "Cloudinary configuration error",
      });
    }

    // Check if files are provided
    if (!req.files || req.files.length === 0) {
      console.log("No files provided");
      return res.status(400).json({
        error: true,
        message: "Vui lòng chọn ít nhất 1 ảnh",
      });
    }

    const uploadedImages = [];
    const errors = [];

    console.log("Starting upload to Cloudinary...");

    // Upload each image to Cloudinary
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      try {
        console.log(`Uploading room image ${i + 1}:`, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });

        // Convert buffer to base64
        const fileBuffer = file.buffer;
        const fileBase64 = `data:${file.mimetype};base64,${fileBuffer.toString("base64")}`;

        // Upload to Cloudinary với error handling
        console.log(`Calling cloudinary.uploader.upload for room image ${i + 1}...`);
        const result = await cloudinary.uploader.upload(fileBase64, {
          folder: "room_images",
          public_id: `room_${Date.now()}_${i + 1}`,
          transformation: [{ width: 1200, height: 800, crop: "fill", quality: "auto" }, { flags: "progressive" }],
        });

        console.log(`✅ Room image ${i + 1} uploaded successfully:`, result.public_id);

        uploadedImages.push({
          public_ID: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      } catch (uploadError) {
        console.error(`❌ Error uploading room image ${i + 1}:`, uploadError);
        errors.push(`Lỗi upload ảnh ${i + 1}: ${uploadError.message}`);
      }
    }

    console.log("🎉 All room images uploaded successfully!");
    console.log("=== END UPLOAD ROOM DEBUG ===");

    res.status(200).json({
      error: false,
      message: `Upload ${uploadedImages.length} ảnh phòng thành công!`,
      data: {
        images: uploadedImages,
        totalImages: uploadedImages.length,
      },
    });
  } catch (error) {
    console.error("❌ Error uploading room images:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
      details: error.message,
    });
  }
});

// Delete room images
const deleteRoomImages = asyncHandler(async (req, res) => {
  try {
    console.log("=== DELETE ROOM IMAGES DEBUG ===");
    console.log("Request body:", req.body);

    const { imageIds } = req.body; // Array of public_IDs

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      console.log("No imageIds provided");
      return res.status(400).json({
        error: true,
        message: "Vui lòng cung cấp danh sách ID ảnh cần xóa",
      });
    }

    console.log("Room images to delete:", imageIds);

    const deletedImages = [];
    const errors = [];

    // Delete each image from Cloudinary
    for (const imageId of imageIds) {
      try {
        console.log(`Deleting room image: ${imageId}`);
        const result = await cloudinary.uploader.destroy(imageId);

        console.log(`Delete result for ${imageId}:`, result);

        if (result.result === "ok") {
          deletedImages.push(imageId);
        } else {
          errors.push(`Không thể xóa ảnh ${imageId}: ${result.result}`);
        }
      } catch (deleteError) {
        console.error(`Error deleting room image ${imageId}:`, deleteError);
        errors.push(`Lỗi xóa ảnh ${imageId}: ${deleteError.message}`);
      }
    }

    console.log("Deleted room images:", deletedImages);
    console.log("Errors:", errors);
    console.log("=== END DELETE ROOM DEBUG ===");

    res.status(200).json({
      error: false,
      message: `Đã xóa ${deletedImages.length}/${imageIds.length} ảnh phòng`,
      data: {
        deletedImages,
        errors: errors.length > 0 ? errors : null,
      },
    });
  } catch (error) {
    console.error("Error deleting room images:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
      details: error.message,
    });
  }
});

// Update room information
const updateRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const updateData = req.body;
  console.log("Update data received:", updateData);

  if (!roomId) {
    return res.status(400).json({
      error: true,
      message: "Room ID is required",
    });
  }

  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({
      error: true,
      message: "Room not found",
    });
  }

  // Convert facility names to IDs if facilities are provided as names
  if (updateData.facilities && Array.isArray(updateData.facilities)) {
    const allFacilities = await RoomFacility.find({});
    const nameToIdMap = {};
    allFacilities.forEach((facility) => {
      nameToIdMap[facility.name] = facility._id;
    });

    updateData.facilities = updateData.facilities.map((name) => nameToIdMap[name]).filter((id) => id);
  }

  // Validate and process bed data if provided
  if (updateData.bed && Array.isArray(updateData.bed)) {
    updateData.bed = updateData.bed.filter((bedItem) => bedItem.bed && bedItem.quantity && bedItem.quantity > 0);
  }

  // Define updatable fields based on Room model
  const updatableFields = [
    "name",
    "type",
    "price",
    "capacity",
    "description",
    "quantity",
    "facilities",
    "bed",
    "images",
    "statusActive",
  ];

  updatableFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (field === "price" || field === "capacity" || field === "quantity") {
        room[field] = Number(updateData[field]);
      } else {
        room[field] = updateData[field];
      }
    }
  });

  try {
    const updatedRoom = await room.save();

    // Populate the updated room for response
    const populatedRoom = await Room.findById(updatedRoom._id)
      .populate("facilities")
      .populate("bed.bed", "bedType capacity name description");

    return res.status(200).json({
      error: false,
      message: "Room updated successfully",
      room: populatedRoom,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to update room",
      details: error.message,
    });
  }
});

// Change room status
const changeStatusRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { statusActive } = req.body;

  console.log("statusActive: ", statusActive);

  if (!roomId) {
    return res.status(400).json({
      error: true,
      message: "Room ID is required",
    });
  }

  // Validate statusActive according to Room model enum
  if (!statusActive || !["ACTIVE", "NONACTIVE"].includes(statusActive)) {
    return res.status(400).json({
      error: true,
      message: "Valid statusActive is required (ACTIVE or NONACTIVE)",
    });
  }

  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({
      error: true,
      message: "Room not found",
    });
  }

  // Update status
  room.statusActive = statusActive;

  try {
    const updatedRoom = await room.save();

    // Populate the updated room for response
    const populatedRoom = await Room.findById(updatedRoom._id)
      .populate("facilities")
      .populate("bed.bed", "bedType capacity name description");

    return res.status(200).json({
      error: false,
      message: `Room status changed to ${statusActive} successfully`,
      room: populatedRoom,
    });
  } catch (error) {
    console.error("Error changing room status:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to change room status",
      details: error.message,
    });
  }
});

module.exports = {
  getRoomsByHotel,
  getRoomById,
  getRoomByHotelIdOfOwner,
  createRoom,
  uploadRoomImages,
  deleteRoomImages,
  updateRoom,
  changeStatusRoom,
};
