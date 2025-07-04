const Reservation = require("../../models/reservation");
const Hotel = require("../../models/hotel");
const Room = require("../../models/room");
const Feedback = require("../../models/feedback");
const MonthlyPayment = require("../../models/monthlyPayment");
const User = require("../../models/user");
const ReportedFeedback = require("../../models/reportedFeedback");
const asyncHandler = require("../../middlewares/asyncHandler");

// Admin Dashboard Metrics
const getDashboardMetricsAdmin = asyncHandler(async (req, res) => {
  const { period = "month", year } = req.query;
  
  // Calculate date range based on period
  const now = new Date();
  let startDate;
  
  switch (period) {
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  try {
    // Get total hotels count
    const totalHotels = await Hotel.countDocuments();
    
    // Get active hotels count (approved by admin and active by owner)
    const activeHotels = await Hotel.countDocuments({
      adminStatus: "APPROVED",
      ownerStatus: "ACTIVE"
    });
    
    // Get pending approvals count
    const pendingApprovals = await Hotel.countDocuments({
      adminStatus: "PENDING"
    });
    
    // Get total customers count
    const totalCustomers = await User.countDocuments({
      role: "CUSTOMER"
    });
    
    // Get total hotel owners count
    const totalOwners = await User.countDocuments({
      role: "OWNER"
    });
    
    // Get total reservations in period
    const totalReservations = await Reservation.countDocuments({
      createdAt: { $gte: startDate, $lte: now }
    });
    
    // Get completed reservations in period
    const completedReservations = await Reservation.find({
      status: "COMPLETED",
      createdAt: { $gte: startDate, $lte: now }
    });
    
    // Calculate total revenue using MonthlyPayment for the period (in USD)
    let totalRevenue = 0;

    // Get all MonthlyPayment data to find available periods
    const allMonthlyPayments = await MonthlyPayment.find({});
    console.log("Total MonthlyPayment records:", allMonthlyPayments.length);

    if (period === 'year') {
      // For year: sum all monthly payments in the year (both PAID and PENDING)
      const yearlyPayments = await MonthlyPayment.find({
        year: now.getFullYear()
      });
      totalRevenue = yearlyPayments.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0);

      // If no data for current year, try previous year or use all available data
      if (totalRevenue === 0) {
        const allYearlyPayments = await MonthlyPayment.find({});
        totalRevenue = allYearlyPayments.reduce((sum, payment) => {
          return sum + (payment.amount || 0);
        }, 0);
        console.log("Using all available MonthlyPayment data for year:", totalRevenue);
      }
    } else {
      // For month: try current month first, then any available month
      let monthlyPayments = await MonthlyPayment.find({
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });

      // If no data for current month, get the most recent month with data
      if (monthlyPayments.length === 0) {
        const latestPayment = await MonthlyPayment.findOne({}).sort({ year: -1, month: -1 });
        if (latestPayment) {
          monthlyPayments = await MonthlyPayment.find({
            month: latestPayment.month,
            year: latestPayment.year
          });
          console.log(`Using data from ${latestPayment.month}/${latestPayment.year} instead of current month`);
        }
      }

      totalRevenue = monthlyPayments.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0);
    }

    // If still no MonthlyPayment data, fallback to reservation-based calculation
    if (totalRevenue === 0) {
      console.log("No MonthlyPayment data found, using reservation fallback");
      totalRevenue = completedReservations.reduce((sum, reservation) => {
        return sum + (reservation.finalPrice || reservation.totalPrice || 0);
      }, 0);
      console.log("Fallback revenue from reservations:", totalRevenue);
    } else {
      console.log("Revenue from MonthlyPayment:", totalRevenue);
    }
    
    // Get pending reports count
    const pendingReports = await ReportedFeedback.countDocuments({
      status: "PENDING"
    });

    // Get total users count (customers)
    const totalUsers = await User.countDocuments({
      role: "CUSTOMER"
    });
    
    // Get detailed hotel distribution by location - extract last part of address for better matching
    const detailedHotelsByLocation = await Hotel.aggregate([
      { $match: { adminStatus: { $ne: 'REJECTED' } } },
      {
        $addFields: {
          // Extract last part from address (after last comma) for better matching
          addressSuffix: {
            $trim: {
              input: {
                $arrayElemAt: [
                  { $split: [{ $toLower: "$address" }, ","] },
                  -1
                ]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: "$addressSuffix", regex: /hà nội|hải phòng|quảng ninh|thái nguyên|lào cai|điện biên|sơn la|hòa bình|phú thọ|vĩnh phúc|bắc ninh|bắc giang|hưng yên|hải dương|nam định|thái bình|ninh bình|hanoi|hai phong|quang ninh|thai nguyen|lao cai|dien bien|son la|hoa binh|phu tho|vinh phuc|bac ninh|bac giang|hung yen|hai duong|nam dinh|thai binh|ninh binh|thành phố hà nội|thanh pho ha noi/i } }, then: "Miền Bắc" },
                { case: { $regexMatch: { input: "$addressSuffix", regex: /thanh hóa|nghệ an|hà tĩnh|quảng bình|quảng trị|thừa thiên huế|đà nẵng|quảng nam|quảng ngãi|thanh hoa|nghe an|ha tinh|quang binh|quang tri|thua thien hue|da nang|quang nam|quang ngai|hue|danang|thành phố đà nẵng|thanh pho da nang/i } }, then: "Miền Trung" },
                { case: { $regexMatch: { input: "$addressSuffix", regex: /tp\.hcm|hồ chí minh|bình dương|đồng nai|bà rịa|tây ninh|bình phước|long an|tiền giang|bến tre|vĩnh long|trà vinh|cần thơ|an giang|kiên giang|cà mau|bạc liêu|sóc trăng|hậu giang|đồng tháp|ho chi minh|saigon|binh duong|dong nai|ba ria|tay ninh|binh phuoc|long an|tien giang|ben tre|tra vinh|vinh long|dong thap|an giang|kien giang|can tho|hau giang|soc trang|bac lieu|ca mau|hcm|tphcm|sài gòn|thành phố hồ chí minh|thanh pho ho chi minh/i } }, then: "Miền Nam" },
                { case: { $regexMatch: { input: "$addressSuffix", regex: /đà lạt|lâm đồng|đắk lắk|đắk nông|gia lai|kon tum|da lat|lam dong|dak lak|dak nong|gia lai|kon tum|dalat|thành phố đà lạt|thanh pho da lat/i } }, then: "Tây Nguyên" },
                { case: { $regexMatch: { input: "$addressSuffix", regex: /nha trang|khánh hòa|bình thuận|ninh thuận|phú yên|vũng tàu|phan thiết|mũi né|hạ long|sapa|phú quốc|khanh hoa|binh thuan|ninh thuan|phu yen|vung tau|phan thiet|mui ne|ha long|sapa|phu quoc|phuquoc|halong|hoian|hoi an|thành phố nha trang|thanh pho nha trang|thành phố vũng tàu|thanh pho vung tau/i } }, then: "Khu du lịch" }
              ],
              default: "Khác"
            }
          },
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$adminStatus", "APPROVED"] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$adminStatus", "PENDING"] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get detailed hotel distribution by category/rating
    const detailedHotelsByCategory = await Hotel.aggregate([
      { $match: { adminStatus: { $ne: 'REJECTED' } } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ["$rating", 4.5] }, then: "5 sao (4.5+)" },
                { case: { $gte: ["$rating", 4.0] }, then: "4 sao (4.0-4.4)" },
                { case: { $gte: ["$rating", 3.0] }, then: "3 sao (3.0-3.9)" },
                { case: { $gte: ["$rating", 2.0] }, then: "2 sao (2.0-2.9)" },
                { case: { $gt: ["$rating", 0] }, then: "1 sao (1.0-1.9)" }
              ],
              default: "Chưa đánh giá"
            }
          },
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$adminStatus", "APPROVED"] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$adminStatus", "PENDING"] }, 1, 0] }
          },
          avgRating: { $avg: "$rating" }
        }
      },
      { $sort: { avgRating: -1 } }
    ]);

    // Get pending hotels with details for approval management
    const pendingHotels = await Hotel.find({
      adminStatus: "PENDING"
    })
    .populate('owner', 'name email phone')
    .sort({ requestDate: -1 })
    .select('name owner location rating requestDate adminStatus images');

    // Get revenue data for chart based on period
    const revenueData = [];
    const labels = [];

    if (period === 'year') {
      // For yearly view: show last 5 years including current year
      const currentYear = now.getFullYear();
      const years = [];
      for (let i = 4; i >= 0; i--) {
        years.push(currentYear - i);
      }

      for (const year of years) {
        const yearlyPayments = await MonthlyPayment.find({ year });
        const yearRevenue = yearlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

        revenueData.push(yearRevenue);
        labels.push(`Year ${year}`);
      }
      console.log("Using yearly data for chart:", years);
    } else {
      // For monthly view: show 12 months of specified year or current year
      const targetYear = year ? parseInt(year) : now.getFullYear();

      for (let month = 1; month <= 12; month++) {
        // Try to get MonthlyPayment data first
        const monthlyPayments = await MonthlyPayment.find({ month, year: targetYear });
        let monthRevenue = monthlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // If no MonthlyPayment data, fallback to reservations
        if (monthRevenue === 0) {
          const monthStart = new Date(targetYear, month - 1, 1);
          const monthEnd = new Date(targetYear, month, 0);

          const monthlyReservations = await Reservation.find({
            status: "COMPLETED",
            createdAt: { $gte: monthStart, $lte: monthEnd }
          });

          monthRevenue = monthlyReservations.reduce((sum, reservation) => {
            return sum + (reservation.finalPrice || reservation.totalPrice || 0);
          }, 0);
        }

        revenueData.push(monthRevenue);
        const monthName = new Date(targetYear, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
        labels.push(`${monthName} ${targetYear}`);
      }
      console.log(`Using monthly data for chart (year ${targetYear})`);
    }

    // Format pending hotels for display
    const formattedPendingHotels = pendingHotels.map(hotel => ({
      id: hotel._id,
      name: hotel.name,
      owner: hotel.owner?.name || 'N/A',
      ownerEmail: hotel.owner?.email || 'N/A',
      ownerPhone: hotel.owner?.phone || 'N/A',
      location: hotel.location,
      rating: hotel.rating || 0,
      requestDate: hotel.requestDate?.toLocaleDateString('vi-VN') || 'N/A',
      status: 'Chờ phê duyệt',
      hasImages: hotel.images && hotel.images.length > 0
    }));

    // Prepare chart colors
    const locationColors = ['#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#7209b7', '#ff6b35'];
    const categoryColors = ['#4cc9f0', '#4361ee', '#3a0ca3', '#f72585', '#7209b7', '#ff6b35'];

    res.json({
      success: true,
      data: {
        // Overview stats
        totalHotels,
        activeHotels,
        pendingApprovals,
        totalCustomers,
        totalOwners,
        totalReservations,
        totalRevenue,
        pendingReports,

        // Chart data
        revenueData: {
          labels,
          datasets: [{
            label: 'Doanh thu thực tế',
            data: revenueData,
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },

        // Enhanced distribution data with detailed breakdown
        hotelDistributionData: {
          labels: detailedHotelsByLocation.map(item => item._id),
          datasets: [{
            label: 'Tổng số khách sạn',
            data: detailedHotelsByLocation.map(item => item.count),
            backgroundColor: locationColors.slice(0, detailedHotelsByLocation.length)
          }]
        },

        // Enhanced category data with rating breakdown
        hotelCategoryData: {
          labels: detailedHotelsByCategory.map(item => item._id),
          datasets: [{
            label: 'Số lượng khách sạn',
            data: detailedHotelsByCategory.map(item => item.count),
            backgroundColor: categoryColors.slice(0, detailedHotelsByCategory.length)
          }]
        },

        // Detailed breakdown data for admin analysis
        locationBreakdown: detailedHotelsByLocation.map(item => ({
          region: item._id,
          total: item.count,
          active: item.activeCount,
          pending: item.pendingCount,
          activePercentage: ((item.activeCount / item.count) * 100).toFixed(1)
        })),

        categoryBreakdown: detailedHotelsByCategory.map(item => ({
          category: item._id,
          total: item.count,
          active: item.activeCount,
          pending: item.pendingCount,
          avgRating: item.avgRating ? item.avgRating.toFixed(1) : 'N/A',
          activePercentage: ((item.activeCount / item.count) * 100).toFixed(1)
        })),

        // Pending hotels for approval management
        pendingHotels: formattedPendingHotels,

        // User statistics for PDF export
        totalUsers: totalUsers,

        // Available years for dropdown
        availableYears: await getAvailableYears()
      }
    });

  } catch (error) {
    console.error('Error fetching admin dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu dashboard',
      error: error.message
    });
  }
});

// Helper function to get available years
const getAvailableYears = async () => {
  try {
    // Get years from MonthlyPayment
    const paymentYears = await MonthlyPayment.distinct('year');

    // Get years from Reservations
    const reservationYears = await Reservation.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" }
        }
      },
      {
        $project: {
          year: "$_id"
        }
      }
    ]);

    // Combine and deduplicate years
    const allYears = [...new Set([
      ...paymentYears,
      ...reservationYears.map(item => item.year),
      new Date().getFullYear() // Always include current year
    ])];

    // Sort years in descending order
    return allYears.sort((a, b) => b - a);
  } catch (error) {
    console.error("Error getting available years:", error);
    return [new Date().getFullYear()]; // Fallback to current year
  }
};

exports.getDashboardMetricsAdmin = getDashboardMetricsAdmin;
