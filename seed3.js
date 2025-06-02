const mongoose = require("mongoose");
const Hotel = require("./src/models/hotel"); // sửa đúng đường dẫn
const User = require("./src/models/user");
require("dotenv").config();

const uri = process.env.MONGODB_URI; // đổi theo DB của bạn

async function updateUsers() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Lấy 10 hotel đầu tiên (theo thứ tự tạo hoặc _id tăng dần)
    const hotels = await Hotel.find().limit(10).exec();

    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      // Tìm user có _id = i
      const user = await User.findById(i + 1);
      if (!user) {
        console.log(`User with _id ${i} not found, skip`);
        continue;
      }

      // Thêm hotel._id vào mảng ownedHotels nếu chưa có
      if (!user.ownedHotels) {
        user.ownedHotels = [];
      }

      const hotelIdStr = hotel._id.toString();
      const exists = user.ownedHotels.some(id => id.toString() === hotelIdStr);
      if (!exists) {
        user.ownedHotels.push(hotel._id);
        await user.save();
        console.log(`Added hotel ${hotel._id} to user ${user._id} ownedHotels`);
      } else {
        console.log(`Hotel ${hotel._id} already in user ${user._id} ownedHotels`);
      }
    }

    console.log("Users updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

updateUsers();
