const mongoose = require("mongoose");
const Hotel = require("./src/models/hotel");
const Room = require("./src/models/room");
const RoomUnit = require("./src/models/roomUnit");
require('dotenv').config(); // Thêm dòng này để load .env

const uri_development = process.env.MONGODB_URI_DEVELOPMENT;
const uri_production = process.env.MONGODB_URI_PRODUCTION;

console.log('Environment:', process.env.ENVIRONMENT);
console.log('DB URI:', process.env.ENVIRONMENT == "development" ? uri_development : uri_production);

// Kết nối MongoDB với error handling
mongoose.connect(
  process.env.ENVIRONMENT == "development" ? uri_development : uri_production,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => {
  console.log('✅ Kết nối MongoDB thành công');
  addRoomUnitsToOneHotel();
}).catch((error) => {
  console.error('❌ Lỗi kết nối MongoDB:', error);
});

async function addRoomUnitsToOneHotel() {
  try {
    console.log('🔍 Đang tìm hotel...');
    
    // Lấy 1 hotel đầu tiên (hoặc theo tên cụ thể)
    const hotels = await Hotel.find().limit(1);
    console.log('Hotels found:', hotels.length);
    
    const hotel = hotels[0];
    if (!hotel) {
      console.log("❌ Không tìm thấy hotel nào!");
      return;
    }

    console.log(`🏨 Tạo RoomUnit cho hotel: ${hotel.name}`);

    // Xóa RoomUnit cũ của hotel này
    const deleteResult = await RoomUnit.deleteMany({ hotel: hotel._id });
    console.log(`🗑️ Đã xóa ${deleteResult.deletedCount} RoomUnit cũ`);

    // Lấy tất cả Room của hotel này
    const rooms = await Room.find({ hotel: hotel._id, statusActive: "ACTIVE" });
    console.log(`📋 Tìm thấy ${rooms.length} loại phòng`);

    if (rooms.length === 0) {
      console.log("❌ Hotel này chưa có room nào!");
      return;
    }

    let totalCreated = 0;

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const floor = i + 1;

      console.log(`  📋 Tạo ${room.quantity} phòng cho loại: ${room.name} ở tầng ${floor}`);

      for (let j = 1; j <= room.quantity; j++) {
        try {
          const roomNumber = generateRoomNumber(floor, j, room.type);

          const roomUnit = new RoomUnit({
            roomNumber: roomNumber,
            floor: floor,
            roomType: room._id,
            status: getRandomStatus(),
            isActive: true,
            notes: `${room.name} - Phòng ${roomNumber} - Tầng ${floor}`,
            maintenance: {
              lastCleaned: getRandomDate(-3, 0),
              lastMaintenance: getRandomDate(-60, -30),
              nextMaintenance: getRandomDate(30, 90),
              maintenanceNotes: generateMaintenanceNotes(room.type),
            },
            hotel: hotel._id,
          });

          await roomUnit.save();
          totalCreated++;
          
        } catch (saveError) {
          console.error(`❌ Lỗi tạo phòng ${j} cho ${room.name}:`, saveError.message);
        }
      }
    }

    console.log(`✅ Đã tạo thành công ${totalCreated} phòng`);

    // Thống kê kết quả
    const totalRoomUnits = await RoomUnit.countDocuments({ hotel: hotel._id });
    console.log(`\n📊 THỐNG KÊ cho ${hotel.name}:`);
    console.log(`   Tổng số phòng cụ thể: ${totalRoomUnits}`);

  } catch (error) {
    console.error("❌ Lỗi chi tiết:", error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối DB');
  }
}

// Hàm tạo số phòng
function generateRoomNumber(floor, roomIndex, roomType) {
  if (roomType === "PRESIDENTIAL") {
    return `${floor}0${roomIndex}`;
  }
  return `${floor}${roomIndex.toString().padStart(2, "0")}`;
}

// Hàm tạo trạng thái ngẫu nhiên
function getRandomStatus() {
  const statuses = ["AVAILABLE", "OCCUPIED", "CLEANING", "MAINTENANCE", "OUT_OF_ORDER"];
  const weights = [70, 15, 8, 5, 2];
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return statuses[i];
    }
  }
  return "AVAILABLE";
}

// Hàm tạo ngày ngẫu nhiên
function getRandomDate(minDays, maxDays) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  return new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);
}

// Hàm tạo ghi chú bảo trì
function generateMaintenanceNotes(roomType) {
  const notes = {
    STANDARD: "Bảo trì định kỳ cơ bản",
    SUPERIOR: "Kiểm tra hệ thống điều hòa",
    DELUXE: "Bảo trì thiết bị cao cấp",
    SUITE: "Kiểm tra toàn diện suite",
    FAMILY_SUITE: "Bảo trì phòng gia đình",
    PRESIDENTIAL: "Bảo trì đặc biệt phòng VIP",
  };
  return notes[roomType] || "Bảo trì định kỳ";
}
