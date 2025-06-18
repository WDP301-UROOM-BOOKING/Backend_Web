const mongoose = require("mongoose");
const User = require("./src/models/user");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Kết nối MongoDB
mongoose
  .connect(`${process.env.MONGODB_URI_DEVELOPMENT}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    seedUsers();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

async function seedUsers() {
  const hotelImage = [
    "https://i.pinimg.com/736x/8a/eb/20/8aeb20492a1c5dd51909352ea4f3c570.jpg",
    "https://i.pinimg.com/736x/c0/74/a3/c074a3d76474c26eb9694631edd6c59e.jpg",
    "https://i.pinimg.com/736x/10/1b/ae/101bae2e28dc30ea889ba93d6c058886.jpg",
    "https://i.pinimg.com/736x/3f/68/a8/3f68a890de2144e224e46fb21c756a41.jpg",
    "https://i.pinimg.com/736x/ab/5d/d4/ab5dd428955149bc39f3e92edbf01eb1.jpg",
    "https://i.pinimg.com/736x/22/7b/3b/227b3b3096fa77288e15617b4947af8b.jpg",
    "https://i.pinimg.com/736x/1e/82/db/1e82db2dfcee66dbd3dab40359a0533a.jpg",
    "https://i.pinimg.com/736x/96/4d/1d/964d1dc9693e6286c48a3f5cfd1cbbb0.jpg",
    "https://i.pinimg.com/736x/0a/4d/c3/0a4dc359a857b9c98fc7e0d99b8a80d5.jpg",
    "https://i.pinimg.com/736x/17/1e/af/171eaf32f503df8a085367a8bf155da9.jpg",
    "https://i.pinimg.com/736x/36/84/90/368490a019e5376e3fc21c0c5f2f5e92.jpg",
    "https://i.pinimg.com/736x/03/40/8b/03408b1ce609497438bb60a07a764398.jpg",
    "https://i.pinimg.com/736x/3f/64/c6/3f64c6d642c7128f11ee6ac26138407a.jpg",
    "https://i.pinimg.com/736x/89/c0/92/89c09207356de3fe14b7d5692c4a3411.jpg",
    "https://i.pinimg.com/736x/89/c0/92/89c09207356de3fe14b7d5692c4a3411.jpg",
    "https://i.pinimg.com/736x/5b/b5/08/5bb508fc74fd9864107216cf1e9ef450.jpg",
    "https://i.pinimg.com/736x/77/d1/74/77d17473cf4f1c3eb5aec7e381930025.jpg",
    "https://i.pinimg.com/736x/88/29/b1/8829b159416c99734c1b742be4ad9f09.jpg",
    "https://i.pinimg.com/736x/02/27/3f/02273f2568b055775825730c29f5001b.jpg",
    "https://i.pinimg.com/736x/da/fc/fa/dafcfa156af0f8c61036f9131c83fe20.jpg",
    "https://i.pinimg.com/736x/1a/b2/c7/1ab2c74722fc1a74d874af4071bede51.jpg",
    "https://i.pinimg.com/736x/4f/bd/68/4fbd684337df5152f4d6e33e4ff52b38.jpg",
    "https://i.pinimg.com/736x/6f/d1/2d/6fd12d8f7559c7a21c52aa782d22287f.jpg",
    "https://i.pinimg.com/736x/86/4d/4b/864d4beed3779d530b4388052d9b2cb6.jpg",
    "https://i.pinimg.com/736x/2b/46/fc/2b46fc944691029b2f49c5fa2eef893e.jpg",
    "https://i.pinimg.com/736x/42/04/c8/4204c8c328a8d86280dda711c545f9cf.jpg",
    "https://i.pinimg.com/736x/6a/aa/cd/6aaacd9a8009044b595ffcaa5aca7681.jpg",
    "https://i.pinimg.com/736x/2d/f6/11/2df6114307d9b93b925026b275b392a3.jpg",
    "https://i.pinimg.com/736x/cd/4e/a1/cd4ea1470db39a3c43021ab7d8a96db8.jpg",
    "https://i.pinimg.com/736x/6e/8a/c9/6e8ac97a5c24098c4844153b744fa2a4.jpg",
    "https://i.pinimg.com/736x/6e/8a/c9/6e8ac97a5c24098c4844153b744fa2a4.jpg",
    "https://i.pinimg.com/736x/fa/02/06/fa0206cb4a813d05f5b56dc1c4681a8b.jpg",
    "https://i.pinimg.com/736x/0e/97/13/0e971336348fabb5a30df2ca76b512dd.jpg",
    "https://i.pinimg.com/736x/ad/54/bf/ad54bf18bebd9d71103b68cee09fe6fb.jpg",
    "https://i.pinimg.com/736x/f3/3f/eb/f33feb864f7f72b753b48c8a9003d405.jpg",
    "https://i.pinimg.com/736x/1c/31/7c/1c317c4053b0835a3a54944ace8b66f0.jpg",
    "https://i.pinimg.com/736x/6c/88/6a/6c886a58955b62b80b29d29a69432904.jpg",
    "https://i.pinimg.com/736x/4b/72/21/4b722154dc3f319b1f8e9ac7c0a48d4f.jpg",
    "https://i.pinimg.com/736x/d2/0d/f6/d20df6973cf3f59e840e898a1462b2da.jpg",
    "https://i.pinimg.com/736x/7f/eb/63/7feb63a3026ec37bfc7d1d8ffe3dc873.jpg",
    "https://i.pinimg.com/736x/7f/eb/63/7feb63a3026ec37bfc7d1d8ffe3dc873.jpg",
    "https://i.pinimg.com/736x/ba/07/4b/ba074bf20e916723432ce1bb3df949ec.jpg",
    "https://i.pinimg.com/736x/ba/07/4b/ba074bf20e916723432ce1bb3df949ec.jpg",
    "https://i.pinimg.com/736x/e2/a8/ba/e2a8baa8d5a171e4c80725801b648e81.jpg",
    "https://i.pinimg.com/736x/29/44/39/294439b399dd8f9905d7dc04c5c58ce2.jpg",
    "https://i.pinimg.com/736x/11/49/fb/1149fb05369b91e4cb07fc85cc67426e.jpg",
    "https://i.pinimg.com/736x/1a/13/f9/1a13f9cc5a076c71449e2ffd7dcbfd94.jpg",
    "https://i.pinimg.com/736x/0b/ec/aa/0becaa9013e485340fc15704e8ea7bd5.jpg",
    "https://i.pinimg.com/736x/f7/ca/52/f7ca520754b7b1762a046fc32380beda.jpg",
    "https://i.pinimg.com/736x/53/f1/3d/53f13d79d88322ae511b5f2ed6aa90aa.jpg",
    "https://i.pinimg.com/736x/91/75/72/9175726f32ba9ef74fb7eab078d4c8c9.jpg",
    "https://i.pinimg.com/736x/44/2c/f0/442cf046ba3a72c97a3a406328a8604f.jpg",
    "https://i.pinimg.com/736x/82/85/41/82854152d968f7ecd7ab6a8134b9c801.jpg",
    "https://i.pinimg.com/736x/e2/b6/44/e2b644225297edc672c37475c2e71bd1.jpg",
    "https://i.pinimg.com/736x/89/7a/32/897a32e588f88300cc58fc696ed16e70.jpg",
    "https://i.pinimg.com/736x/e1/2b/1e/e12b1eef92fcbb8d148366a02a29d62b.jpg",
    "https://i.pinimg.com/736x/e9/40/4b/e9404b59bd7c3ec545b82be0def660f2.jpg",
    "https://i.pinimg.com/736x/34/fb/8e/34fb8e98222d0c6c1e617560c574b2b7.jpg",
    "https://i.pinimg.com/736x/58/52/f9/5852f9c6d22bbf48966279db9bd83be2.jpg",
    "https://i.pinimg.com/736x/d6/87/32/d687326d8acb084b6767ebfcef6b04d2.jpg",
    "https://i.pinimg.com/736x/56/d8/45/56d8450d55513d4e3b93877c708a47b4.jpg",
    "https://i.pinimg.com/736x/3e/32/ed/3e32ed6be00cdfdbe696736b93d14a74.jpg",
    "https://i.pinimg.com/736x/4e/d3/5c/4ed35c9263929654b9076cf8968047ae.jpg",
    "https://i.pinimg.com/736x/9a/76/1b/9a761b45824d60a117dc7a484cc5c93b.jpg",
    "https://i.pinimg.com/736x/72/94/b9/7294b9f07d5c8374552504a82ecc53cb.jpg",
    "https://i.pinimg.com/736x/4d/ee/19/4dee19b6b2af0c305f6e9b013fe18fdc.jpg",
    "https://i.pinimg.com/736x/85/9c/22/859c2298f64ef85e3b28d10b03f402bb.jpg",
    "https://i.pinimg.com/736x/4e/e1/d2/4ee1d24d87d37c5ddcab157af20d902e.jpg",
  ];
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
      {
        name: "Admin Uroom",
        email: "ad1@gm.com",
        password: "12345678",
        role: "ADMIN",
        phoneNumber: "0934726072",
        address: "456 Hùng Vương, Đà Nẵng",
        isVerified: true,
        isLocked: false,
        cmnd: "047003012312",
        image: {
          public_ID: "avatar_admin1",
          url: "https://cdn-icons-png.freepik.com/512/4880/4880553.png",
        },
      },
    ];

    // Dùng new + save() để AutoIncrement hoạt động
    for (const userData of users) {
      console.log(`Seeding user: ${userData.password}`);
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user ${user.name} with _id = ${user._id}`);
    }

    const owners = [];

    for (let i = 1; i <= 37; i++) {
      const randomAvatar = hotelImage[Math.floor(Math.random() * hotelImage.length)];
      const hashedPassword = await bcrypt.hash("12345678", 10);

      const owner = {
        _id: i + 16,
        email: `hot${i + 10}@gm.com`,
        password: hashedPassword,
        name: `User Owner ${i + 16}`,
        phone: `090${String(i).padStart(7, "0")}`, // Generate phone numbers
        role: "OWNER",
        status: "ACTIVE",
        image: {
          public_ID: "avatar_customer2",
          url: randomAvatar,
        },
        address: `Address ${i}, District ${Math.ceil(i / 5)}, Ho Chi Minh City`,
        dateOfBirth: new Date(1980 + (i % 20), i % 12, (i % 28) + 1),
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        isVerified: true,
      };
      owners.push(owner);
    }

    // Insert all owners
    const result = await User.insertMany(owners);
    console.log(`Successfully created ${result.length} owners`);

    console.log("✅ Seed completed!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}
