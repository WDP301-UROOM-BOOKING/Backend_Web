const mongoose = require("mongoose");
const User = require("./src/models/user");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Kết nối MongoDB
mongoose
  .connect(`${process.env.MONGODB_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    seedUsers();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

async function seedUsers() {
  try {
    // Xoá toàn bộ user
    await mongoose.connection.dropDatabase();

    // Danh sách user seed
    const users = [
      // 10 OWNER
      {
        name: "Khách Sạn One",
        email: "hot1@gm.com",
        password: "12345678",
        role: "OWNER",
        phoneNumber: "0934726001",
        address: "123 Trần Cao Vân, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012301",
        image: {
          public_ID: "avatar_owner1",
          url: "https://i.pinimg.com/736x/6c/88/6a/6c886a58955b62b80b29d29a69432904.jpg",
        },
      },
      {
        name: "Khách Sạn Two",
        email: "hot2@gm.com",
        password: "12345678",
        role: "OWNER",
        phoneNumber: "0934726002",
        address: "456 Hùng Vương, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012302",
        image: {
          public_ID: "avatar_owner2",
          url: "https://i.pinimg.com/736x/4b/72/21/4b722154dc3f319b1f8e9ac7c0a48d4f.jpg",
        },
      },
      {
        name: "Khách Sạn Three",
        email: "hot3@gm.com",
        password: "12345678",
        role: "OWNER",
        phoneNumber: "0934726003",
        address: "789 Nguyễn Văn Linh, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012303",
        image: {
          public_ID: "avatar_owner3",
          url: "https://i.pinimg.com/736x/7f/eb/63/7feb63a3026ec37bfc7d1d8ffe3dc873.jpg",
        },
      },
      {
        name: "Khách Sạn Four",
        email: "hot4@gm.com",
        password: "12345678",
        role: "OWNER",
        phoneNumber: "0934726004",
        address: "101 Phan Châu Trinh, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012304",
        image: {
          public_ID: "avatar_owner4",
          url: "https://i.pinimg.com/736x/ba/07/4b/ba074bf20e916723432ce1bb3df949ec.jpg",
        },
      },
      {
        name: "Khách Sạn Five",
        email: "hot5@gm.com",
        password: "12345678",
        role: "OWNER",
        phoneNumber: "0934726005",
        address: "88 Trưng Nữ Vương, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012305",
        image: {
          public_ID: "avatar_owner5",
          url: "https://i.pinimg.com/736x/ba/07/4b/ba074bf20e916723432ce1bb3df949ec.jpg",
        },
      },
      {
        name: "Khách Sạn Six",
        email: "hot6@gm.com",
        password: "12345678",
        role: "OWNER",
        phoneNumber: "0934726006",
        address: "64 Nguyễn Văn Linh, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012306",
        image: {
          public_ID: "avatar_owner6",
          url: "https://i.pinimg.com/736x/e2/a8/ba/e2a8baa8d5a171e4c80725801b648e81.jpg",
        },
      },
      {
        name: "Khách Sạn Seven",
        email: "hot7@gm.com",
        password: "12345678",
        role: "OWNER",
        phoneNumber: "0934726007",
        address: "35 Điện Biên Phủ, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012307",
        image: {
          public_ID: "avatar_owner7",
          url: "https://i.pinimg.com/736x/29/44/39/294439b399dd8f9905d7dc04c5c58ce2.jpg",
        },
      },
      {
        name: "Khách Sạn Eight",
        email: "hot8@gm.com",
        password: "12345678",
        role: "OWNER",
        phoneNumber: "0934726008",
        address: "12 Quang Trung, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012308",
        image: {
          public_ID: "avatar_owner8",
          url: "https://i.pinimg.com/736x/11/49/fb/1149fb05369b91e4cb07fc85cc67426e.jpg",
        },
      },
      {
        name: "Khách Sạn Nine",
        email: "hot9@gm.com",
        password: "12345678",
        role: "OWNER",
        phoneNumber: "0934726009",
        address: "99 Lê Duẩn, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012309",
        image: {
          public_ID: "avatar_owner9",
          url: "https://i.pinimg.com/736x/1a/13/f9/1a13f9cc5a076c71449e2ffd7dcbfd94.jpg",
        },
      },
      {
        name: "Khách Sạn Ten",
        email: "hot10@gm.com",
        password: "12345678",
        role: "OWNER",
        phoneNumber: "0934726010",
        address: "10 Lý Thường Kiệt, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012310",
        image: {
          public_ID: "avatar_owner10",
          url: "https://i.pinimg.com/736x/0b/ec/aa/0becaa9013e485340fc15704e8ea7bd5.jpg",
        },
      },

      // 2 CUSTOMER (cuối danh sách)
      {
        name: "Nguyễn Văn A",
        email: "cus1@gm.com",
        password: "12345678",
        role: "CUSTOMER",
        phoneNumber: "0934726071",
        address: "123 Trần Cao Vân, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012311",
        image: {
          public_ID: "avatar_customer1",
          url: "https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/avatar-cute-54.png",
        },
      },
      {
        name: "Nguyễn Văn B",
        email: "cus2@gm.com",
        password: "12345678",
        role: "CUSTOMER",
        phoneNumber: "0934726072",
        address: "456 Hùng Vương, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012312",
        image: {
          public_ID: "avatar_customer2",
          url: "https://i.pinimg.com/736x/00/40/22/00402207be828983fee5889803fd5d00.jpg",
        },
      },
      {
        name: "Nguyễn Văn C",
        email: "cus3@gm.com",
        password: "12345678",
        role: "CUSTOMER",
        phoneNumber: "0934726071",
        address: "123 Trần Cao Vân, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012311",
        image: {
          public_ID: "avatar_customer1",
          url: "https://cellphones.com.vn/sforum/wp-content/uploads/2024/02/anh-avatar-cute-58.jpg",
        },
      },
      {
        name: "Nguyễn Văn D",
        email: "cus4@gm.com",
        password: "12345678",
        role: "CUSTOMER",
        phoneNumber: "0934726072",
        address: "456 Hùng Vương, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012312",
        image: {
          public_ID: "avatar_customer2",
          url: "https://cellphones.com.vn/sforum/wp-content/uploads/2024/02/anh-avatar-cute-53.jpg",
        },
      },
      {
        name: "Nguyễn Văn E",
        email: "cus5@gm.com",
        password: "12345678",
        role: "CUSTOMER",
        phoneNumber: "0934726072",
        address: "456 Hùng Vương, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012312",
        image: {
          public_ID: "avatar_customer2",
          url: "https://cellphones.com.vn/sforum/wp-content/uploads/2024/02/anh-avatar-cute-71.jpg",
        },
      },
    ];

    // Dùng new + save() để AutoIncrement hoạt động
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user ${user.name} with _id = ${user._id}`);
    }

    console.log("✅ Seed completed!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}
