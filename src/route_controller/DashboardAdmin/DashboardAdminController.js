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
  const { period = "month" } = req.query;
  
  // Calculate date range based on period
  const now = new Date();
  let startDate;
  
  switch (period) {
    case "day":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
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
    
    // Calculate total revenue from completed reservations
    const totalRevenue = completedReservations.reduce((sum, reservation) => {
      return sum + (reservation.finalPrice || reservation.totalPrice || 0);
    }, 0);
    
    // Get pending reports count
    const pendingReports = await ReportedFeedback.countDocuments({
      status: "PENDING"
    });
    
    // Get detailed hotel distribution by location with better categorization
    const detailedHotelsByLocation = await Hotel.aggregate([
      { $match: { adminStatus: { $ne: 'REJECTED' } } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: "$location", regex: /hà nội|hải phòng|quảng ninh|thái nguyên|lào cai|điện biên|sơn la|hòa bình|phú thọ|vĩnh phúc|bắc ninh|bắc giang|hưng yên|hải dương|nam định|thái bình|ninh bình/i } }, then: "Miền Bắc" },
                { case: { $regexMatch: { input: "$location", regex: /thanh hóa|nghệ an|hà tĩnh|quảng bình|quảng trị|thừa thiên huế|đà nẵng|quảng nam|quảng ngãi/i } }, then: "Miền Trung" },
                { case: { $regexMatch: { input: "$location", regex: /tp\.hcm|hồ chí minh|bình dương|đồng nai|bà rịa|tây ninh|bình phước|long an|tiền giang|bến tre|vĩnh long|trà vinh|cần thơ|an giang|kiên giang|cà mau|bạc liêu|sóc trăng|hậu giang|đồng tháp/i } }, then: "Miền Nam" },
                { case: { $regexMatch: { input: "$location", regex: /đà lạt|lâm đồng|đắk lắk|đắk nông|gia lai|kon tum/i } }, then: "Tây Nguyên" },
                { case: { $regexMatch: { input: "$location", regex: /nha trang|khánh hòa|bình thuận|ninh thuận|phú yên|vũng tàu|phan thiết|mũi né|hạ long|sapa|phú quốc/i } }, then: "Khu du lịch" }
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

    // Get revenue data for chart (last 12 months)
    const revenueData = [];
    const labels = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthlyReservations = await Reservation.find({
        status: "COMPLETED",
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      const monthlyRevenue = monthlyReservations.reduce((sum, reservation) => {
        return sum + (reservation.finalPrice || reservation.totalPrice || 0);
      }, 0);
      
      revenueData.push(monthlyRevenue);
      labels.push(monthStart.toLocaleDateString('vi-VN', { month: 'short' }));
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
        pendingHotels: formattedPendingHotels
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

exports.getDashboardMetricsAdmin = getDashboardMetricsAdmin;
