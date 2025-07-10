const mongoose = require("mongoose");
const MonthlyPayment = require("./src/models/monthlyPayment");
require("dotenv").config();

const uri = process.env.MONGODB_URI_DEVELOPMENT;

async function checkMonthlyPayments() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Đếm tổng số monthly payments
    const totalCount = await MonthlyPayment.countDocuments();
    console.log("Total MonthlyPayment records:", totalCount);

    if (totalCount === 0) {
      console.log("No MonthlyPayment records found. Running seed...");
      // Chạy seed nếu không có dữ liệu
      const { exec } = require('child_process');
      exec('node seed4.js', (error, stdout, stderr) => {
        if (error) {
          console.error('Error running seed:', error);
          return;
        }
        console.log('Seed output:', stdout);
        if (stderr) console.log('Seed errors:', stderr);
      });
      return;
    }

    // Lấy một vài records để kiểm tra
    const samplePayments = await MonthlyPayment.find({})
      .populate('hotel', 'hotelName')
      .limit(5)
      .sort({ createdAt: -1 });

    console.log("\nSample MonthlyPayments:");
    samplePayments.forEach((payment, index) => {
      console.log(`${index + 1}. ID: ${payment._id}`);
      console.log(`   Hotel: ${payment.hotel?.hotelName || 'N/A'}`);
      console.log(`   Amount: $${payment.amount}`);
      console.log(`   Month/Year: ${payment.month}/${payment.year}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Created: ${payment.createdAt}`);
      console.log("---");
    });

    // Kiểm tra các trạng thái
    const statusCounts = await MonthlyPayment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log("\nStatus distribution:");
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });

    // Kiểm tra theo năm
    const yearCounts = await MonthlyPayment.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    console.log("\nYear distribution:");
    yearCounts.forEach(year => {
      console.log(`${year._id}: ${year.count}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkMonthlyPayments(); 