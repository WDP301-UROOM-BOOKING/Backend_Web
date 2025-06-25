const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomUnitSchema = new Schema(
  {
    // Số phòng cụ thể (101, 102, A-205, etc.)
    roomNumber: { type: String, required: true },
    
    // Tầng của phòng
    floor: { type: Number, required: true },
    
    // Tham chiếu đến loại phòng (Room model hiện tại)
    roomType: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    
    // Trạng thái hiện tại của phòng cụ thể này
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "CLEANING", "MAINTENANCE", "OUT_OF_ORDER"],
      default: "AVAILABLE"
    },
    
    // Trạng thái hoạt động
    isActive: { type: Boolean, default: true },
    
    // Ghi chú riêng cho phòng này (nếu có điều gì đặc biệt)
    notes: { type: String },
    
    // Thông tin bảo trì
    maintenance: {
      lastCleaned: { type: Date },
      lastMaintenance: { type: Date },
      nextMaintenance: { type: Date },
      maintenanceNotes: { type: String }
    },
    
    // Lịch sử booking (tùy chọn, có thể tham chiếu từ Booking model)
    currentBooking: { type: Schema.Types.ObjectId, ref: 'Reservation' },
    
    // Hotel mà phòng này thuộc về
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true }
  },
  { 
    versionKey: false,
    timestamps: true 
  }
);

// Index để đảm bảo roomNumber unique trong cùng hotel
RoomUnitSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

// Index để tìm kiếm nhanh theo status và roomType
RoomUnitSchema.index({ status: 1, roomType: 1 });

module.exports = mongoose.model('RoomUnit', RoomUnitSchema);