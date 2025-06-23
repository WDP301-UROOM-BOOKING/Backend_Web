const mongoose = require("mongoose");
const Promotion = require("./src/models/Promotion"); // đường dẫn model

mongoose.connect("mongodb://localhost:27017/My_Uroom", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const promotions = [
    {
        code: "SUMMER10",
        name: "Summer Sale 10%",
        description: "Enjoy 10% off on all products during summer!",
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscountAmount: 50000,
        minOrderAmount: 100000,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-07-01"),
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
        createdBy: "6669f97c93d37323b0f12345" // giả định một ObjectId
    },
    {
        code: "WELCOME50K",
        name: "Welcome Bonus",
        description: "Get 50,000đ off for your first order!",
        discountType: "FIXED_AMOUNT",
        discountValue: 50000,
        minOrderAmount: 200000,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        usageLimit: null,
        usedCount: 20,
        isActive: true,
        createdBy: "6669f97c93d37323b0f12345"
    },
    {
        code: "FLASH25",
        name: "Flash Deal 25%",
        description: "Limited time offer with 25% discount.",
        discountType: "PERCENTAGE",
        discountValue: 25,
        maxDiscountAmount: 100000,
        minOrderAmount: 0,
        startDate: new Date("2025-06-20"),
        endDate: new Date("2025-06-25"),
        usageLimit: 50,
        usedCount: 3,
        isActive: true,
        createdBy: "6669f97c93d37323b0f12345"
    },
    {
        code: "EXPIRED2024",
        name: "Old Promotion",
        description: "Expired promotion, should not be valid.",
        discountType: "FIXED_AMOUNT",
        discountValue: 30000,
        minOrderAmount: 100000,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        usageLimit: 200,
        usedCount: 200,
        isActive: true,
        createdBy: "6669f97c93d37323b0f12345"
    },
    {
        code: "INACTIVE15",
        name: "Inactive Promo",
        description: "15% off but deactivated.",
        discountType: "PERCENTAGE",
        discountValue: 15,
        maxDiscountAmount: 80000,
        minOrderAmount: 50000,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-12-31"),
        usageLimit: 100,
        usedCount: 10,
        isActive: false,
        createdBy: "6669f97c93d37323b0f12345"
    }
];

Promotion.insertMany(promotions)
    .then(() => {
        console.log("Dữ liệu promotion đã được chèn thành công.");
        mongoose.disconnect();
    })
    .catch(err => {
        console.error("Lỗi khi chèn dữ liệu:", err);
        mongoose.disconnect();
    });
