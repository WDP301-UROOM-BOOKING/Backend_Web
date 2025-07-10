const mongoose = require("mongoose");
const MonthlyPayment = require("./src/models/monthlyPayment");
const Hotel = require("./src/models/hotel");
require("dotenv").config();

const uri = process.env.MONGODB_URI_DEVELOPMENT;

async function createSampleMonthlyPayments() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Lấy danh sách hotels
    const hotels = await Hotel.find({ adminStatus: "APPROVED" }).limit(10);
    console.log("Found hotels:", hotels.length);

    if (hotels.length === 0) {
      console.log("No approved hotels found. Creating sample data...");
      // Tạo một số hotels mẫu nếu không có
      const sampleHotels = [
        {
          hotelName: "Luxury Palace Hotel",
          owner: 1,
          description: "A luxurious 5-star hotel in the heart of the city",
          address: "123 Main Street, City Center",
          phoneNumber: "0905123456",
          email: "info@luxurypalace.com",
          rating: 4.8,
          star: 5,
          pricePerNight: 200,
          adminStatus: "APPROVED",
          ownerStatus: "ACTIVE"
        },
        {
          hotelName: "Seaside Resort & Spa",
          owner: 2,
          description: "Beautiful beachfront resort with spa facilities",
          address: "456 Beach Road, Coastal Area",
          phoneNumber: "0905123457",
          email: "info@seasideresort.com",
          rating: 4.6,
          star: 4,
          pricePerNight: 150,
          adminStatus: "APPROVED",
          ownerStatus: "ACTIVE"
        },
        {
          hotelName: "City Center Hotel",
          owner: 3,
          description: "Modern hotel in the business district",
          address: "789 Business Ave, Downtown",
          phoneNumber: "0905123458",
          email: "info@citycenter.com",
          rating: 4.4,
          star: 4,
          pricePerNight: 120,
          adminStatus: "APPROVED",
          ownerStatus: "ACTIVE"
        },
        {
          hotelName: "Mountain View Lodge",
          owner: 4,
          description: "Cozy lodge with mountain views",
          address: "321 Mountain Road, Highland",
          phoneNumber: "0905123459",
          email: "info@mountainview.com",
          rating: 4.7,
          star: 3,
          pricePerNight: 80,
          adminStatus: "APPROVED",
          ownerStatus: "ACTIVE"
        }
      ];

      const createdHotels = await Hotel.insertMany(sampleHotels);
      console.log("Created sample hotels:", createdHotels.length);
      hotels.push(...createdHotels);
    }

    // Tạo monthly payments mẫu
    const samplePayments = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    hotels.forEach((hotel, hotelIndex) => {
      // Tạo payments cho 6 tháng gần đây
      for (let i = 0; i < 6; i++) {
        const month = currentMonth - i;
        const year = currentYear;
        let adjustedMonth = month;
        let adjustedYear = year;
        
        if (month <= 0) {
          adjustedMonth = month + 12;
          adjustedYear = year - 1;
        }

        const amount = Math.floor(Math.random() * 5000) + 1000; // $1000-$6000
        const status = Math.random() > 0.3 ? "PENDING" : "PAID"; // 70% PENDING, 30% PAID

        samplePayments.push({
          hotel: hotel._id,
          month: adjustedMonth,
          year: adjustedYear,
          amount: amount,
          status: status,
          accountHolderName: "Sample Account Holder",
          accountNumber: "123456789",
          bankName: "Sample Bank",
          branchName: "Main Branch",
          requestDate: new Date(adjustedYear, adjustedMonth - 1, Math.floor(Math.random() * 28) + 1),
          paymentDate: status === "PAID" ? new Date(adjustedYear, adjustedMonth - 1, Math.floor(Math.random() * 28) + 1) : null
        });
      }
    });

    console.log("Creating sample payments:", samplePayments.length);

    // Xóa dữ liệu cũ nếu có
    await MonthlyPayment.deleteMany({});
    console.log("Cleared existing monthly payments");

    // Tạo payments mới
    const createdPayments = await MonthlyPayment.insertMany(samplePayments);
    console.log("Created sample monthly payments:", createdPayments.length);

    // Hiển thị một vài mẫu
    const sampleResults = await MonthlyPayment.find({})
      .populate('hotel', 'hotelName')
      .limit(5)
      .sort({ createdAt: -1 });

    console.log("\nSample created payments:");
    sampleResults.forEach((payment, index) => {
      console.log(`${index + 1}. Hotel: ${payment.hotel?.hotelName}`);
      console.log(`   Amount: $${payment.amount}`);
      console.log(`   Month/Year: ${payment.month}/${payment.year}`);
      console.log(`   Status: ${payment.status}`);
      console.log("---");
    });

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

createSampleMonthlyPayments(); 