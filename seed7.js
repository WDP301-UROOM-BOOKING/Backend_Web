const mongoose = require("mongoose");
const Promotion = require("./src/models/Promotion"); // đường dẫn model
require('dotenv').config();

// Kiểm tra ENVIRONMENT và chọn MongoDB URI phù hợp
const getMongoURI = () => {
  const environment = process.env.ENVIRONMENT || 'development';
  console.log(`🌍 Environment: ${environment}`);
  
  if (environment === 'production') {
    console.log(`📡 Using Production MongoDB: ${process.env.MONGODB_URI_PRODUCTION}`);
    return process.env.MONGODB_URI_PRODUCTION;
  } else {
    console.log(`💻 Using Development MongoDB: ${process.env.MONGODB_URI_DEVELOPMENT}`);
    return process.env.MONGODB_URI_DEVELOPMENT;
  }
};

const mongoURI = getMongoURI();
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📍 Connected to: ${mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas (Production)' : 'Local MongoDB (Development)'}`);
})
.catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
});

const promotions = [
    {
        code: "SUMMER10",
        name: "Summer Sale 10%",
        description: "Enjoy 10% off on all products during summer!",
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscountAmount: 20,
        minOrderAmount: 100,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-07-01"),
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
        createdBy: 1 // Admin user ID
    },
    {
        code: "WELCOME50K",
        name: "Welcome Bonus",
        description: "Get 10$ off for your first order!",
        discountType: "FIXED_AMOUNT",
        discountValue: 10,
        minOrderAmount: 100,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        usageLimit: null,
        usedCount: 20,
        isActive: true,
        createdBy: 1 // Admin user ID
    },
    {
        code: "FLASH25",
        name: "Flash Deal 25%",
        description: "Limited time offer with 25% discount.",
        discountType: "PERCENTAGE",
        discountValue: 25,
        maxDiscountAmount: 20,
        minOrderAmount: 0,
        startDate: new Date("2025-06-20"),
        endDate: new Date("2025-06-25"),
        usageLimit: 50,
        usedCount: 3,
        isActive: true,
        createdBy: 1 // Admin user ID
    },
    {
        code: "EXPIRED2024",
        name: "Old Promotion",
        description: "Expired promotion, should not be valid.",
        discountType: "FIXED_AMOUNT",
        discountValue: 5,
        minOrderAmount: 50,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        usageLimit: 200,
        usedCount: 200,
        isActive: true,
        createdBy: 1 // Admin user ID
    },
    {
        code: "INACTIVE15",
        name: "Inactive Promo",
        description: "15% off but deactivated.",
        discountType: "PERCENTAGE",
        discountValue: 15,
        maxDiscountAmount: 10,
        minOrderAmount: 100,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-12-31"),
        usageLimit: 100,
        usedCount: 10,
        isActive: false,
        createdBy: 1 // Admin user ID
    },
    {
    code: "FREESHIP2025",
    name: "Free Shipping",
    description: "Free shipping on orders over $50.",
    discountType: "FIXED_AMOUNT",
    discountValue: 5, // giá trị tương đương phí ship
    minOrderAmount: 50,
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-12-31"),
    usageLimit: 500,
    usedCount: 0,
    isActive: true,
    createdBy: 1
  },
  {
    code: "VIP30",
    name: "VIP Customer 30%",
    description: "Exclusive 30% off for VIP customers.",
    discountType: "PERCENTAGE",
    discountValue: 30,
    maxDiscountAmount: 50,
    minOrderAmount: 200,
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-12-31"),
    usageLimit: 100,
    usedCount: 5,
    isActive: true,
    createdBy: 1
  },
  {
    code: "BULKBUY20",
    name: "Bulk Buy 20% Off",
    description: "Buy more than $500 and get 20% off.",
    discountType: "PERCENTAGE",
    discountValue: 20,
    maxDiscountAmount: 100,
    minOrderAmount: 500,
    startDate: new Date("2025-08-01"),
    endDate: new Date("2025-12-31"),
    usageLimit: 200,
    usedCount: 0,
    isActive: true,
    createdBy: 1
  },
  {
    code: "NEWYEAR50",
    name: "New Year Special",
    description: "Celebrate New Year with $50 off orders above $300.",
    discountType: "FIXED_AMOUNT",
    discountValue: 50,
    minOrderAmount: 300,
    startDate: new Date("2025-12-25"),
    endDate: new Date("2026-01-05"),
    usageLimit: 50,
    usedCount: 0,
    isActive: true,
    createdBy: 1
  },
  {
    code: "LIMITED5",
    name: "Limited 5% Off",
    description: "Small discount for testing limited use.",
    discountType: "PERCENTAGE",
    discountValue: 5,
    maxDiscountAmount: 5,
    minOrderAmount: 20,
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-07-31"),
    usageLimit: 10,
    usedCount: 2,
    isActive: true,
    createdBy: 1
  },
  {
  code: "BIRTHDAY20",
  name: "Birthday Special 20%",
  description: "Celebrate your birthday with 20% off!",
  discountType: "PERCENTAGE",
  discountValue: 20,
  maxDiscountAmount: 30,
  minOrderAmount: 50,
  startDate: new Date("2025-07-01"),
  endDate: new Date("2025-07-31"),
  usageLimit: null,
  usedCount: 0,
  isActive: true,
  createdBy: 1
},
{
  code: "ONEHOURDEAL",
  name: "1 Hour Flash Sale",
  description: "Hurry! Only valid for 1 hour!",
  discountType: "PERCENTAGE",
  discountValue: 50,
  maxDiscountAmount: 25,
  minOrderAmount: 30,
  startDate: new Date(), // Bắt đầu ngay
  endDate: new Date(new Date().getTime() + 60 * 60 * 1000), // Kết thúc sau 1 giờ
  usageLimit: 10,
  usedCount: 0,
  isActive: true,
  createdBy: 1
},
{
  code: "GIFTFORU",
  name: "Gift Voucher",
  description: "Special $15 gift for loyal customers.",
  discountType: "FIXED_AMOUNT",
  discountValue: 15,
  minOrderAmount: 0,
  startDate: new Date("2025-07-01"),
  endDate: new Date("2025-12-31"),
  usageLimit: 300,
  usedCount: 50,
  isActive: true,
  createdBy: 1
},
{
  code: "LOYALTY40",
  name: "Loyalty Reward 40%",
  description: "Exclusive 40% off for loyal customers.",
  discountType: "PERCENTAGE",
  discountValue: 40,
  maxDiscountAmount: 60,
  minOrderAmount: 150,
  startDate: new Date("2025-07-10"),
  endDate: new Date("2025-12-31"),
  usageLimit: 100,
  usedCount: 0,
  isActive: true,
  createdBy: 1
},
{
  code: "FREE100",
  name: "Free 100% OFF",
  description: "Oops! 100% off to test system limit 😂",
  discountType: "PERCENTAGE",
  discountValue: 100,
  maxDiscountAmount: 9999,
  minOrderAmount: 1,
  startDate: new Date("2025-07-01"),
  endDate: new Date("2025-07-31"),
  usageLimit: 1,
  usedCount: 0,
  isActive: true,
  createdBy: 1
}
];

// Hàm seed dữ liệu
const seedPromotions = async () => {
    try {
        // Xóa tất cả dữ liệu promotion cũ
        console.log("🗑️  Đang xóa tất cả dữ liệu promotion cũ...");
        const deleteResult = await Promotion.deleteMany({});
        console.log(`✅ Đã xóa ${deleteResult.deletedCount} promotion cũ`);

        // Thêm dữ liệu mới
        console.log("📝 Đang thêm dữ liệu promotion mới...");
        const insertResult = await Promotion.insertMany(promotions);
        console.log(`✅ Đã thêm ${insertResult.length} promotion mới thành công`);

        // Hiển thị danh sách promotion đã thêm
        console.log("\n📋 Danh sách promotion đã được thêm:");
        insertResult.forEach((promo, index) => {
            console.log(`${index + 1}. ${promo.code} - ${promo.name} (${promo.isActive ? 'Active' : 'Inactive'})`);
        });

        console.log("\n🎉 Seed dữ liệu promotion hoàn tất!");
        mongoose.disconnect();
    } catch (error) {
        console.error("❌ Lỗi khi seed dữ liệu:", error);
        mongoose.disconnect();
        process.exit(1);
    }
};

// Chạy seed function
seedPromotions();
