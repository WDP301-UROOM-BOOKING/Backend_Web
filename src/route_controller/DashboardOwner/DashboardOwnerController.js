const Reservation = require("../../models/reservation");
const Hotel = require("../../models/hotel");
const Room = require("../../models/room");
const Feedback = require("../../models/feedback");
const MonthlyPayment = require("../../models/monthlyPayment");
const User = require("../../models/user");
const ReportedFeedback = require("../../models/reportedFeedback");
const asyncHandler = require("../../middlewares/asyncHandler");

const getDashboardMetrics = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;
  const ownerId = Number(req.user.id || req.user._id);

  // Get owner's hotels
  const hotels = await Hotel.find({ owner: ownerId });
  const hotelIds = hotels.map(hotel => hotel._id);

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

  // Get reservations for the period (status: COMPLETED) - Doanh thu đã hoàn thành
  const completedReservations = await Reservation.find({
    hotel: { $in: hotelIds },
    createdAt: { $gte: startDate, $lte: now },
    status: { $in: ["COMPLETED"] }
  }).populate("hotel room");

  // Get all reservations for the period (status: COMPLETED, CHECKED IN, CHECKED OUT, BOOKED) - Tổng doanh thu
  const allReservations = await Reservation.find({
    hotel: { $in: hotelIds },
    createdAt: { $gte: startDate, $lte: now },
    status: { $in: ["COMPLETED", "CHECKED IN", "CHECKED OUT", "BOOKED", "PENDING"] }
  }).populate("hotel room");

  // Calculate completed revenue (doanh thu đã hoàn thành)
  const completedRevenue = completedReservations.reduce((sum, reservation) => {
    // Ưu tiên finalPrice (giá sau khuyến mãi), nếu không có thì dùng totalPrice
    const price = reservation.finalPrice > 0 ? reservation.finalPrice : reservation.totalPrice;
    return sum + price;
  }, 0);

  // Calculate total revenue (tổng doanh thu từ tất cả đặt phòng)
  const totalRevenue = allReservations.reduce((sum, reservation) => {
    // Ưu tiên finalPrice (giá sau khuyến mãi), nếu không có thì dùng totalPrice
    const price = reservation.finalPrice > 0 ? reservation.finalPrice : reservation.totalPrice;
    return sum + price;
  }, 0);

  // Get total rooms
  const totalRooms = await Room.countDocuments({ hotel: { $in: hotelIds } });
  
  // Calculate RevPAR (Revenue Per Available Room) - sử dụng doanh thu đã hoàn thành
  const daysInPeriod = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  const revpar = totalRooms > 0 ? completedRevenue / (totalRooms * daysInPeriod) : 0;

  // Calculate ADR (Average Daily Rate) - sử dụng doanh thu đã hoàn thành
  const adr = completedReservations.length > 0 ? completedRevenue / completedReservations.length : 0;

  // Calculate profit (assuming 30% profit margin) - sử dụng doanh thu đã hoàn thành
  const profit = completedRevenue * 0.3;

  // Calculate occupancy rate - sử dụng tất cả reservation
  const totalRoomNights = totalRooms * daysInPeriod;
  const occupiedRoomNights = allReservations.reduce((sum, reservation) => {
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return sum + nights;
  }, 0);
  const occupancyRate = totalRoomNights > 0 ? (occupiedRoomNights / totalRoomNights) * 100 : 0;

  // Get average rating
  const feedbacks = await Feedback.find({
    hotel: { $in: hotelIds },
    createdAt: { $gte: startDate, $lte: now }
  });
  
  const averageRating = feedbacks.length > 0 
    ? feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0) / feedbacks.length 
    : 0;

  // Calculate return rate (simplified - based on repeat customers)
  const customerIds = [...new Set(completedReservations.map(r => r.user.toString()))];
  const returnRate = customerIds.length > 0 ? (customerIds.length / completedReservations.length) * 100 : 0;

  // Get recent bookings - cập nhật để lấy đúng trạng thái
  const recentBookings = await Reservation.find({
    hotel: { $in: hotelIds },
    status: { $in: ["BOOKED", "CHECKED IN", "CHECKED OUT", "COMPLETED", "PENDING"] }
  })
  .populate("user", "name")
  .populate("rooms.room", "name")
  .sort({ createdAt: -1 })
  .limit(5)
  .select("_id user rooms checkInDate checkOutDate status totalPrice finalPrice");

  const formattedRecentBookings = recentBookings.map(booking => ({
    id: booking._id,
    guest: booking.user?.name || "Unknown",
    room: booking.rooms?.[0]?.room?.name || "Unknown",
    checkin: new Date(booking.checkInDate).toLocaleDateString("vi-VN"),
    checkout: new Date(booking.checkOutDate).toLocaleDateString("vi-VN"),
    status: booking.status === "BOOKED" ? "Đã đặt" : 
            booking.status === "CHECKED IN" ? "Đã check-in" :
            booking.status === "CHECKED OUT" ? "Đã check-out" :
            booking.status === "COMPLETED" ? "Đã hoàn thành" : "Đang xử lý",
    amount: `$${(booking.finalPrice > 0 ? booking.finalPrice : booking.totalPrice || 0).toLocaleString()}`
  }));

  // Mock revenue data for chart (12 months) - sử dụng tổng doanh thu
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const monthRevenue = totalRevenue * (0.8 + Math.random() * 0.4); // Vary by ±20%
    return Math.round(monthRevenue / 12);
  });

  // Mock customer segment data
  const customerSegmentData = {
    labels: ["Doanh nhân", "Gia đình", "Cặp đôi", "Du lịch một mình", "Đoàn du lịch"],
    datasets: [{
      data: [35, 25, 20, 10, 10],
      backgroundColor: ["#4361ee", "#3a0ca3", "#4cc9f0", "#f72585", "#7209b7"],
      borderWidth: 1
    }]
  };

  // --- Revenue by Room Type ---
  // Lấy tất cả các phòng thuộc khách sạn của owner
  const rooms = await Room.find({ hotel: { $in: hotelIds } });
  const roomTypes = [...new Set(rooms.map(r => r.type))];
  let totalRevenueAllTypes = 0;
  const roomTypeStats = [];

  // Tính tổng doanh thu cho từng loại phòng - sử dụng tất cả reservation
  for (const type of roomTypes) {
    const typeRooms = rooms.filter(r => r.type === type);
    const roomIds = typeRooms.map(r => r._id.toString());
    const quantity = typeRooms.length;

    // Lấy reservation liên quan đến loại phòng này
    let typeReservations = allReservations.filter(res => {
      // Nếu reservation có trường rooms (nhiều phòng)
      if (Array.isArray(res.rooms) && res.rooms.length > 0) {
        return res.rooms.some(rm => roomIds.includes(rm.room?.toString?.()));
      }
      // Nếu reservation có trường room (1 phòng)
      if (res.room && roomIds.includes(res.room._id?.toString?.())) {
        return true;
      }
      return false;
    });

    // Tổng doanh thu loại phòng này
    const typeRevenue = typeReservations.reduce((sum, res) => {
      // Ưu tiên finalPrice (giá sau khuyến mãi), nếu không có thì dùng totalPrice
      const price = res.finalPrice > 0 ? res.finalPrice : res.totalPrice;
      
      // Nếu reservation có nhiều phòng, chia đều doanh thu cho các phòng
      if (Array.isArray(res.rooms) && res.rooms.length > 0) {
        const matched = res.rooms.filter(rm => roomIds.includes(rm.room?.toString?.()));
        if (matched.length > 0) {
          return sum + (price * matched.length / res.rooms.length);
        }
      }
      // Nếu reservation chỉ có 1 phòng
      if (res.room && roomIds.includes(res.room._id?.toString?.())) {
        return sum + price;
      }
      return sum;
    }, 0);
    totalRevenueAllTypes += typeRevenue;

    // Tính occupancy (tỷ lệ lấp đầy: tổng số đêm đã đặt / tổng số đêm có thể bán)
    let occupiedNights = 0;
    for (const res of typeReservations) {
      let nights = 0;
      if (res.checkInDate && res.checkOutDate) {
        nights = Math.ceil((new Date(res.checkOutDate) - new Date(res.checkInDate)) / (1000 * 60 * 60 * 24));
      }
      // Nếu reservation có nhiều phòng, chỉ tính số phòng thuộc loại này
      if (Array.isArray(res.rooms) && res.rooms.length > 0) {
        const matched = res.rooms.filter(rm => roomIds.includes(rm.room?.toString?.()));
        occupiedNights += nights * matched.length;
      } else {
        occupiedNights += nights;
      }
    }
    // Tổng số đêm có thể bán trong kỳ
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
    const daysInPeriod = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    const totalRoomNights = quantity * daysInPeriod;
    const occupancy = totalRoomNights > 0 ? occupiedNights / totalRoomNights : 0;

    // Giá trung bình
    const avgPrice = typeReservations.length > 0 ? typeRevenue / typeReservations.length : 0;

    roomTypeStats.push({
      type,
      quantity,
      quantity,
      occupancy,
      avgPrice,
      revenue: typeRevenue,
      // percent sẽ tính sau khi có totalRevenueAllTypes
    });
  }
  // Tính phần trăm doanh thu
  roomTypeStats.forEach(stat => {
    stat.percent = totalRevenueAllTypes > 0 ? ((stat.revenue / totalRevenueAllTypes) * 100).toFixed(1) : 0;
  });

  // --- Tổng hợp doanh thu từng khách sạn ---
  const hotelRevenueStats = [];
  for (const hotel of hotels) {
    // Lấy reservation của hotel này (tất cả trạng thái)
    const hotelReservations = allReservations.filter(res => res.hotel && res.hotel._id.toString() === hotel._id.toString());
    const revenue = hotelReservations.reduce((sum, res) => {
      const price = res.finalPrice > 0 ? res.finalPrice : res.totalPrice;
      return sum + price;
    }, 0);
    hotelRevenueStats.push({
      hotelId: hotel._id,
      hotelName: hotel.hotelName,
      revenue,
      reservationCount: hotelReservations.length
    });
  }

  // --- Tổng hợp doanh thu từng tháng (từ tháng 1 đến tháng hiện tại) ---
  const nowDate = new Date();
  const monthlyRevenueStats = [];
  
  // Tính từ tháng 1 đến tháng hiện tại của năm hiện tại
  const currentYear = nowDate.getFullYear();
  const currentMonth = nowDate.getMonth() + 1;
  
  // Tối ưu hóa: Lấy tất cả reservation từ tháng 1 đến tháng hiện tại
  const yearStart = new Date(currentYear, 0, 1); // Tháng 1
  const allMonthlyReservations = await Reservation.find({
    hotel: { $in: hotelIds },
    createdAt: { $gte: yearStart, $lte: nowDate },
    status: { $in: ["COMPLETED", "CHECKED IN", "CHECKED OUT", "BOOKED", "PENDING"] }
  });

  for (let month = 1; month <= currentMonth; month++) {
    // Tính thời gian bắt đầu và kết thúc của tháng
    const monthStart = new Date(currentYear, month - 1, 1);
    const monthEnd = new Date(currentYear, month, 1);
    
    // Lọc reservation trong tháng này từ dữ liệu đã lấy
    const monthReservations = allMonthlyReservations.filter(res => {
      const createdAt = new Date(res.createdAt);
      return createdAt >= monthStart && createdAt < monthEnd;
    });
    
    // Tính tổng doanh thu của tháng
    const revenue = monthReservations.reduce((sum, res) => {
      const price = res.finalPrice > 0 ? res.finalPrice : res.totalPrice;
      return sum + price;
    }, 0);
    
    // Tính hoa hồng (12%) và số tiền thực tế cho chủ khách sạn (88%)
    const commission = Math.floor(revenue * 0.12);
    const actualAmountToHost = Math.floor(revenue * 0.88);
    
    // Lấy monthly payment (nếu có)
    const monthlyPayment = await MonthlyPayment.findOne({
      hotel: { $in: hotelIds },
      month: month,
      year: currentYear
    });
    
    monthlyRevenueStats.push({
      month: month,
      year: currentYear,
      revenue,
      monthlyPayment: monthlyPayment ? monthlyPayment.amount : 0,
      paymentStatus: monthlyPayment ? monthlyPayment.status : null,
      reservationCount: monthReservations.length, // Thêm số lượng reservation
      commission,
      actualAmountToHost
    });
  }

  res.json({
    success: true,
    data: {
      totalRevenue, // Tổng doanh thu từ tất cả đặt phòng
      completedRevenue, // Doanh thu đã hoàn thành
      revpar,
      adr,
      profit,
      occupancyRate,
      averageRating,
      returnRate,
      recentBookings: formattedRecentBookings,
      revenueData,
      customerSegmentData,
      revenueByRoomType: roomTypeStats,
      hotelRevenueStats,
      monthlyRevenueStats
    }
  });
});

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

    // Get recent hotel approvals
    const recentApprovals = await Hotel.find({
      adminStatus: "PENDING"
    })
    .populate('owner', 'name email')
    .sort({ requestDate: -1 })
    .limit(5)
    .select('name owner location requestDate adminStatus');

    // Get recent reports
    const recentReports = await ReportedFeedback.find()
    .populate('reportedBy', 'name email')
    .populate('feedbackId', 'content')
    .populate({
      path: 'feedbackId',
      populate: {
        path: 'hotel',
        select: 'name'
      }
    })
    .sort({ createdAt: -1 })
    .limit(5);

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

    // Get hotel distribution by location
    const hotelsByLocation = await Hotel.aggregate([
      {
        $match: { adminStatus: "APPROVED" }
      },
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get hotels by category (star rating)
    const hotelsByCategory = await Hotel.aggregate([
      {
        $match: { adminStatus: "APPROVED" }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Format recent approvals
    const formattedApprovals = recentApprovals.map(hotel => ({
      id: hotel._id,
      hotelName: hotel.name,
      owner: hotel.owner?.name || 'N/A',
      location: hotel.location,
      submittedDate: hotel.requestDate?.toLocaleDateString('vi-VN') || 'N/A',
      status: hotel.adminStatus === 'PENDING' ? 'Đang chờ' : 'Đã xử lý'
    }));

    // Format recent reports
    const formattedReports = recentReports.map(report => ({
      id: report._id,
      customerName: report.reportedBy?.name || 'N/A',
      hotelName: report.feedbackId?.hotel?.name || 'N/A',
      reportType: report.reason || 'N/A',
      submittedDate: report.createdAt?.toLocaleDateString('vi-VN') || 'N/A',
      status: report.status === 'PENDING' ? 'Chưa xử lý' : 'Đã xử lý',
      severity: 'Trung bình' // You can add severity logic based on your business rules
    }));

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

        // Distribution data
        hotelDistributionData: {
          labels: hotelsByLocation.map(item => item._id || 'Khác'),
          datasets: [{
            data: hotelsByLocation.map(item => item.count),
            backgroundColor: [
              '#4361ee',
              '#3a0ca3',
              '#4cc9f0',
              '#f72585',
              '#7209b7'
            ]
          }]
        },

        hotelCategoryData: {
          labels: hotelsByCategory.map(item => item._id || 'Khác'),
          datasets: [{
            data: hotelsByCategory.map(item => item.count),
            backgroundColor: [
              '#4cc9f0',
              '#4361ee',
              '#3a0ca3',
              '#7209b7',
              '#f72585'
            ]
          }]
        },

        // Recent activities
        recentApprovals: formattedApprovals,
        recentReports: formattedReports
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

exports.getDashboardMetrics = getDashboardMetrics;
exports.getDashboardMetricsAdmin = getDashboardMetricsAdmin;