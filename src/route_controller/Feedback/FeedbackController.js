const Feedback = require("../../models/feedback");
const asyncHandler = require("../../middlewares/asyncHandler");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../../models/user");
exports.calculateAvgRatingHotel = async (hotelId) => {
  // Sử dụng aggregate để tính trung bình rating và tổng số feedback
  const result = await Feedback.aggregate([
    { $match: { hotel: hotelId } }, // Lọc feedback theo hotelId
    {
      $group: {
        _id: "$hotel",
        avgRating: { $avg: "$rating" }, // Tính trung bình rating
        totalFeedbacks: { $sum: 1 }, // Đếm số feedback
      },
    },
  ]);

  if (result.length === 0) {
    return { avgValueRating: 0, totalFeedbacks: 0 }; // Nếu không có feedback, trả về 0
  }

  const avgValueRating = Number(result[0].avgRating.toFixed(1));
  const totalFeedbacks = result[0].totalFeedbacks;

  return { avgValueRating, totalFeedbacks };
};

exports.getAllFeedBackByHotelId = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  console.log("hotelId: ", hotelId);

  const { page = 1, limit = 3, sort = 1, star = 0 } = req.query;

  if (!hotelId) {
    return res
      .status(400)
      .json({ error: true, message: "Hotel ID is required" });
  }

  let query = { hotel: hotelId };

  // Lọc theo số sao nếu có
  if (star) {
    if (star === 0) {
      // Không lọc theo star
    } else if (/^\d$/.test(star) && Number(star) >= 1 && Number(star) <= 5) {
      query.rating = Number(star);
    }
  }

  // Sắp xếp
  let sortOption = {};
  if (sort == 0) {
    sortOption = { createdAt: -1 }; // mới nhất đến cũ nhất
  } else if (sort == 1) {
    sortOption = { createdAt: 1 }; // cũ nhất đến mới nhất
  } else if (sort == 2) {
    sortOption = { rating: -1 }; // rating cao đến thấp
  } else if (sort == 3) {
    sortOption = { rating: 1 }; // rating thấp đến cao
  }

  let listFeedback = [];
  let stats = [];
  let ratingCounts = [];

  try {
    listFeedback = await Feedback.find(query)
      .populate("user")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));
  } catch (err) {
    console.error("❌ Error when fetching listFeedback:", err);
    return res.status(500).json({
      error: true,
      message: "Error fetching feedback list",
      detail: err.message,
    });
  }

  try {
    stats = await Feedback.aggregate([
      { $match: { hotel: new mongoose.Types.ObjectId(hotelId) } },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
    ]);
  } catch (err) {
    console.error("❌ Error in aggregate stats:", err);
    return res.status(500).json({
      error: true,
      message: "Error aggregating feedback stats",
      detail: err.message,
    });
  }

  try {
    ratingCounts = await Feedback.aggregate([
      { $match: { hotel: new mongoose.Types.ObjectId(hotelId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Error aggregating rating counts",
      detail: err.message,
    });
  }

  // Chuẩn hóa dữ liệu
  const feedbackStats = stats[0] || { totalFeedback: 0, averageRating: 0 };
  const ratingMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingCounts.forEach((item) => {
    ratingMap[item._id] = item.count;
  });

  const totalFeedbackCount = await Feedback.countDocuments(query);

  return res.status(200).json({
    error: false,
    listFeedback,
    totalFeedback: feedbackStats.totalFeedback,
    averageRating: parseFloat(feedbackStats.averageRating?.toFixed(1)) || 0,
    ratingBreakdown: {
      oneStar: ratingMap[1],
      twoStar: ratingMap[2],
      threeStar: ratingMap[3],
      fourStar: ratingMap[4],
      fiveStar: ratingMap[5],
    },
    totalPages: Math.ceil(totalFeedbackCount / limit),
    currentPage: Number(page),
    message:
      listFeedback.length === 0
        ? "No feedback yet for this hotel"
        : "Get all feedback by hotel id success",
  });
});

exports.likeFeedback = async (req, res) => {
  const feedbackId = req.params.id;
  const userId = req.user._id;

  try {
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const hasLiked = feedback.likedBy.includes(userId);
    const hasDisliked = feedback.dislikedBy.includes(userId);

    if (hasLiked) {
      // Nếu đã like thì bỏ like
      feedback.likedBy.pull(userId);
    } else {
      // Nếu chưa like thì thêm vào và bỏ dislike nếu có
      feedback.likedBy.push(userId);
      if (hasDisliked) {
        feedback.dislikedBy.pull(userId);
      }
    }

    await feedback.save();

    return res.status(200).json({
      message: hasLiked ? "Like removed" : "Feedback liked",
      feedback,
    });
  } catch (error) {
    console.error("Error liking feedback:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.dislikeFeedback = async (req, res) => {
  const feedbackId = req.params.id;
  const userId = req.user._id;

  try {
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const hasDisliked = feedback.dislikedBy.includes(userId);
    const hasLiked = feedback.likedBy.includes(userId);

    if (hasDisliked) {
      // Nếu đã dislike thì bỏ dislike
      feedback.dislikedBy.pull(userId);
    } else {
      // Nếu chưa dislike thì thêm vào và bỏ like nếu có
      feedback.dislikedBy.push(userId);
      if (hasLiked) {
        feedback.likedBy.pull(userId);
      }
    }

    await feedback.save();

    return res.status(200).json({
      message: hasDisliked ? "Dislike removed" : "Feedback disliked",
      feedback,
    });
  } catch (error) {
    console.error("Error disliking feedback:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.getFeedbackByUserId = async (req, res) => {
  try {
    const userId = Number(req.user._id);

    const feedbacks = await Feedback.find({ user: userId })
      .populate("hotel")
      .populate("reservation", "checkInDate checkOutDate")
      .sort({ createdAt: -1 });

    if (feedbacks.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Bạn chưa viết feedback nào.",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Lấy danh sách feedback thành công",
      data: feedbacks,
    });
  } catch (error) {
    console.error("Lỗi khi lấy feedback theo user:", error);
    return res.status(500).json({
      error: true,
      message: "Lỗi server khi lấy feedback người dùng",
    });
  }
};
// update review
exports.updateFeedback = async (req, res) => {
  try {
    const userId = Number(req.user._id);
    const feedbackId = req.params.feedbackId;
    const { content, rating } = req.body;

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res
        .status(404)
        .json({ error: true, message: "Feedback does not exist." });
    }

    if (feedback.user !== userId) {
      return res
        .status(403)
        .json({
          error: true,
          message: "You do not have permission to edit this feedback.",
        });
    }

    // Check content with Gemini if updated
    if (content) {
      const isProfane = await checkProfanityWithGemini(content);
      if (isProfane) {
        console.log("Inappropriate language detected in feedback");
        return res.status(400).json({
          error: true,
          message: `The content "${content}" contains inappropriate language and cannot be updated.`,
        });
      }
      feedback.content = content;
    }

    if (rating) {
      feedback.rating = rating;
    }

    feedback.updatedAt = new Date();

    await feedback.save();

    return res.status(200).json({
      error: false,
      message: "Feedback updated successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Error while updating feedback:", error);
    return res.status(500).json({
      error: true,
      message: "Server error while updating feedback",
    });
  }
};

//delete review
exports.deleteFeedback = async (req, res) => {
  try {
    const userId = Number(req.user._id);
    const feedbackId = req.params.feedbackId;

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res
        .status(404)
        .json({ error: true, message: "Feedback không tồn tại." });
    }

    if (feedback.user !== userId) {
      return res
        .status(403)
        .json({ error: true, message: "Bạn không có quyền xoá feedback này." });
    }

    await Feedback.findByIdAndDelete(feedbackId);

    return res.status(200).json({
      error: false,
      message: "Xoá feedback thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xoá feedback:", error);
    return res.status(500).json({
      error: true,
      message: "Lỗi server khi xoá feedback",
    });
  }
};

const { GoogleGenerativeAI } = require("@google/generative-ai");
// AI kiểm tra nội dung từ ngữ không phù hợp
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const checkProfanityWithGemini = async (content) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  try {
    // tạo prompt để kiểm tra nội dung
    const prompt = `Kiểm tra nội dung sau có chứa từ ngữ không phù hợp hay không (trả lời chỉ "YES" hoặc "NO") * CHÚ Ý HÃY KIỂM TRA TRONG TẤT CẢ CÁC LOẠI NGÔN NGỮ: "${content}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    console.log("responseText: ", responseText);
    return responseText === "YES"; // Trả về true nếu có từ ngữ không phù hợp
  } catch (error) {
    console.error("Error checking content with Gemini:", error);
    return false; // Nếu lỗi xảy ra, mặc định không chặn nội dung
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const { reservation, hotel, content, rating } = req.body;
    const user = req.user._id;

    if (!reservation || !hotel || !content || !rating) {
      return res.status(400).json({
        error: true,
        message: "Please provide all required feedback information.",
      });
    }

    //Kiểm tra nội dung bằng Gemini
    const isProfane = await checkProfanityWithGemini(content);
    if (isProfane) {
      console.log("Có từ ngữ không phù hợp trong feedback");
      return res.status(400).json({
        message: `Content "${content}" contains inappropriate language and is not acceptable in feedback.`,
      });
    }

    const newFeedback = await Feedback.create({
      user,
      reservation,
      hotel,
      content,
      rating,
    });

    res.status(201).json({
      error: false,
      message: "Create feedback successfully",
      data: newFeedback,
    });
  } catch (error) {
    console.error("Lỗi khi tạo feedback:", error);
    res.status(500).json({
      error: true,
      message: "Error server when creating feedback",
    });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findById(feedbackId)
      .populate("user")
      .populate("hotel")
      .populate("reservation");

    if (!feedback) {
      return res.status(404).json({
        error: true,
        message: "Feedback không tồn tại.",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Feedback retrieved successfully.",
      data: feedback,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin feedback theo ID:", error);
    return res.status(500).json({
      error: true,
      message: "Server error occurred when fetching feedback.",
    });
  }
};
