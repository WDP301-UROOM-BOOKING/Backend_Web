require('dotenv').config(); // Thêm dòng này để load environment variables

const mongoose = require("mongoose");
const Reservation = require("./src/models/reservation");
const Room = require("./src/models/room");
const HotelService = require("./src/models/hotelService");

const connectDB = async () => {
  const uri_development = process.env.MONGODB_URI_DEVELOPMENT;
  const uri_production = process.env.MONGODB_URI_PRODUCTION;
  
  console.log("Environment:", process.env.ENVIRONMENT);
  console.log("Using URI:", process.env.ENVIRONMENT == "development" ? "Development DB" : "Production DB");
  
  try {
    await mongoose.connect(process.env.ENVIRONMENT == "development" ? uri_development : uri_production, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const calculateReservationTotal = async () => {
  try {
    console.log("Starting totalPrice recalculation for all reservations...");

    // Lấy tất cả reservations
    const reservations = await Reservation.find({}).populate("rooms.room").populate("services.service");

    console.log(`Found ${reservations.length} reservations to update`);

    let updatedCount = 0;

    for (const reservation of reservations) {
      let totalPrice = 0;

      // Tính số đêm
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      console.log(`\nProcessing Reservation ${reservation._id}:`);
      console.log(`Check-in: ${checkIn.toDateString()}, Check-out: ${checkOut.toDateString()}, Nights: ${nights}`);

      // Tính tổng tiền phòng
      for (const roomItem of reservation.rooms) {
        if (roomItem.room && roomItem.room.price) {
          const roomTotal = roomItem.room.price * roomItem.quantity * nights;
          totalPrice += roomTotal;
          console.log(
            `Room ${roomItem.room.name}: ${roomItem.room.price} x ${roomItem.quantity} x ${nights} nights = ${roomTotal}`
          );
        }
      }

      // Tính tổng tiền dịch vụ
      for (const serviceItem of reservation.services) {
        if (serviceItem.service && serviceItem.service.price) {
          // Số ngày sử dụng dịch vụ
          const serviceDays = serviceItem.selectDate ? serviceItem.selectDate.length : 1;
          const serviceTotal = serviceItem.service.price * serviceItem.quantity * serviceDays;
          totalPrice += serviceTotal;
          console.log(
            `Service ${serviceItem.service.name}: ${serviceItem.service.price} x ${serviceItem.quantity} x ${serviceDays} days = ${serviceTotal}`
          );
        }
      }

      console.log(`Total calculated: ${totalPrice}, Current total: ${reservation.totalPrice}`);

      // Cập nhật totalPrice nếu khác với giá trị hiện tại
      if (reservation.totalPrice !== totalPrice) {
        await Reservation.findByIdAndUpdate(reservation._id, { totalPrice: totalPrice }, { new: true });

        console.log(`✅ Updated Reservation ${reservation._id}: ${reservation.totalPrice} -> ${totalPrice}`);
        updatedCount++;
      } else {
        console.log(`✓ Reservation ${reservation._id}: Price already correct (${totalPrice})`);
      }
    }

    console.log(`\n=== Recalculation completed! ===`);
    console.log(`Total reservations processed: ${reservations.length}`);
    console.log(`Reservations updated: ${updatedCount}`);
    console.log(`Reservations unchanged: ${reservations.length - updatedCount}`);
  } catch (error) {
    console.error("Error calculating reservation totals:", error);
  }
};

const runSeed = async () => {
  try {
    console.log("Starting seed script...");
    await connectDB();
    await calculateReservationTotal();

    console.log("\n🎉 Seed completed successfully!");
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Chạy script
runSeed();
