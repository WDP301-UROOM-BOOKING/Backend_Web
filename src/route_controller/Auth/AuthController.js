const generateToken = require("../../utils/generateToken");
const cloudinary  = require("../../config/cloudinaryConfig");
const bcrypt = require("bcryptjs");
const User = require("../../models/user");
const generateVerificationToken = require("../../utils/generateVerificationToken");
const sendEmail = require("../../utils/sendEmail");
const { emailVerificationTemplate } = require("../../utils/emailTemplates");
const admin = require("../../config/firebaseAdminConfig").default;
const Reservation = require("../../models/reservation");
const streamifier = require("streamifier");

const Hotel = require("../../models/hotel")
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("body: ", req.body);
    const user = await User.findOne({ email }).select("+password");
    // Nếu không tìm thấy user
    if (!user) {
      return res.status(401).json({ MsgNo: "Email or password is incorrect" });
    }

    // Nếu không có role
    if (!user.role) {
      return res.status(401).json({ MsgNo: "Email or password is incorrect" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ MsgNo: "Email or password is incorrect" });
    }

    // Kiểm tra xác minh email
    if (!user.isVerified) {
      return res.status(403).json({ MsgNo: "Your email is not verified" });
    }

    // Tạo token và trả về dữ liệu
    const token = generateToken(user);
    res.json({
      Data: {
        token: token,
        user: user,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

exports.loginOwner = async (req, res) => {
  const { email, password } = req.body;
  console.log("body: ", req.body);
  console.log("email: ", email);
  const user = await User.findOne({ email }).populate('ownedHotels').select("+password");

  if (!user) {
    return res.status(401).json({ MsgNo: "Email or password is incorrect" });
  }
  if (user.role && user.role == "OWNER") {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ MsgNo: "Email or password is incorrect" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ MsgNo: "Your email is not verified" });
    }
    const token = generateToken(user);
    res.json({
      Data: {
        token: token,
        user: user,
      },
    });
  } else {
    return res.status(401).json({ MsgNo: "Email or password is incorrect" });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phoneNumber, address, gender, birthDate, image, cmnd } =
      req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ MsgNo: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ MsgNo: "Your email is not verified" });
    }

    // Cập nhật các trường
    user.name = name || user.name;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    user.gender = gender || user.gender;
    user.birthDate = birthDate || user.birthDate;
    user.cmnd = cmnd || user.cmnd;

    if (image && image.public_ID && image.url) {
      user.image = image;
    }

    user.updatedAt = new Date();

    const updatedUser = await user.save();

    res.json({
      MsgNo: "Profile updated successfully",
      Data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ MsgNo: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ MsgNo: "Current password is incorrect" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ MsgNo: "Confirm password does not match" });
    }

    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({ MsgNo: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

/**
 * Register a new customer account with email verification
 */
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ MsgNo: "Email is already registered" });
    }

    // Generate 6-digit verification code
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      phoneNumber,
      role: "CUSTOMER",
      isVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
    });

    // Save user
    await newUser.save();

    // Send verification email with 6-digit code
    const emailSent = await sendEmail(
      email,
      "UROOM - Verify Your Email",
      emailVerificationTemplate(name, verificationToken)
    );

    if (!emailSent) {
      return res
        .status(500)
        .json({ MsgNo: "Failed to send verification email" });
    }

    res.json({
      MsgNo:
        "Registration successful! Please check your email for your verification code.",
      Data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

/**
 * Send email when forgot password
 */
exports.forgotPassword = async (req, res) => {
  console.log("Forgot password request body:", req.body);
  try {
    const { email } = req.body;
    console.log("Forgot password request for email:", email);
    if (!email) {
      return res.status(400).json({ MsgNo: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({
          MsgNo:
            "Email is not registered with us! Try again with another email",
        });
    }

    // Generate reset token and expiry (6-digit code, valid for 1 hour)
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;
    await user.save();

    // Send email with reset code
    const emailSent = await sendEmail(
      email,
      "UROOM - Password Reset Code",
      emailVerificationTemplate(user.name, verificationToken)
    );

    if (!emailSent) {
      return res.status(500).json({ MsgNo: "Failed to send reset email" });
    }

    res.json({
      MsgNo: "Password reset code sent to your email",
      Data: { email: user.email },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

/**
 * Reset password using the code sent to email
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    console.log("req.body: ", req.body);
    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({ MsgNo: "All fields are required" });
    }

    const user = await User.findOne({
      email,
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: new Date() },
    }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ MsgNo: "Invalid or expired verification code" });
    }
    user.password = newPassword;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    user.updatedAt = new Date();
    await user.save();

    res.json({ MsgNo: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};
/**
 * Verify request forgot password using the verification code
 */
exports.verifyForgotPassword = async (req, res) => {
  try {
    const { code } = req.body;

    // Find user with the verification code
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: new Date() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ MsgNo: "Invalid or expired verification code" });
    }
    res.json({
      MsgNo: "Verification successful. You can now reset your password.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

/**
 * Verify email using the verification code
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    // Find user with the verification code
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ MsgNo: "Invalid or expired verification code" });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    res.json({
      MsgNo: "Email verified successfully. You can now log in.",
      Data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

/**
 * Resend verification code to the user's email
 */
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ MsgNo: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ MsgNo: "User not found" });
    }

    // Generate new verification code
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours

    // Update user with new verification code
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;
    await user.save();

    // Send verification email with new code
    const emailSent = await sendEmail(
      email,
      "UROOM - Your New Verification Code",
      emailVerificationTemplate(user.name, verificationToken)
    );

    if (!emailSent) {
      return res
        .status(500)
        .json({ MsgNo: "Failed to send verification email" });
    }

    res.json({
      MsgNo: "A new verification code has been sent to your email",
      Data: { email: user.email },
    });
  } catch (error) {
    console.error("Resend verification code error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

exports.updateAvatar = async (req, res) => {
  console.log("Uploaded file (multer):", req.file);

  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ MsgNo: "User not found" });

    // Xoá ảnh cũ nếu có
    if (user.image && user.image.public_ID) {
      await cloudinary.uploader.destroy(user.image.public_ID);
    }

    // Kiểm tra file upload
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ MsgNo: "No file uploaded" });
    }

    // Upload buffer trực tiếp lên Cloudinary
    const uploadFromBuffer = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `avatar_${userId}`,
            public_id: `avatar_${userId}`,
            resource_type: "image",
            overwrite: true,
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await uploadFromBuffer(req.file.buffer);

    const newImage = {
      public_ID: result.public_id,
      url: result.secure_url,
    };

    user.image = newImage;
    await user.save();

    res.json({
      Data: {
        MsgYes: "Avatar updated successfully",
        image: newImage,
      },
    });
  } catch (err) {
    console.error("Update avatar error:", err);
    res.status(500).json({ MsgNo: "Server error" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const { email, name, picture, uid: providerId } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        providerId,
        image: {
          public_ID: `google_${providerId}`,
          url: picture,
        },
        isVerified: true,
      });
      await user.save();
    }

    const token = generateToken(user);

    res.json({
      MsgYes: "Login successful",
      Data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

////Owner///
exports.registerOwner = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    console.log("body: ", req.body);
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ MsgNo: "Email is already registered" });
    }

    // Generate 6-digit verification code
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      phoneNumber,
      role: "OWNER",
      isVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
    });

    // Save user
    await newUser.save();

    // Send verification email with 6-digit code
    const emailSent = await sendEmail(
      email,
      "UROOM - Verify Your Email",
      emailVerificationTemplate(name, verificationToken)
    );

    if (!emailSent) {
      return res
        .status(500)
        .json({ MsgNo: "Failed to send verification email" });
    }

    res.json({
      MsgNo:
        "Registration successful! Please check your email for your verification code.",
      Data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

/**
 * Lấy tất cả khách hàng (role CUSTOMER) cho admin
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const User = require("../../models/user");
    const query = { role: "CUSTOMER" };
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex }
      ];
    }
    // Sắp xếp
    let sort = {};
    if (req.query.sort === 'name') sort = { name: 1 };
    if (req.query.sort === 'createdAt') sort = { createdAt: -1 };
    // Lấy danh sách user
    const [customers, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);
    // Đếm số booking thực sự cho từng user
    const bookingStatuses = ["BOOKED", "CHECKED IN", "CHECKED OUT", "COMPLETED"];
    let customersWithBookingCount = await Promise.all(customers.map(async (user) => {
      const bookingCount = await Reservation.countDocuments({ user: user._id, status: { $in: bookingStatuses } });
      return { ...user.toObject(), bookingCount };
    }));
    // Sắp xếp lại theo bookingCount nếu cần
    if (req.query.sort === 'bookingCount') {
      customersWithBookingCount = customersWithBookingCount.sort((a, b) => b.bookingCount - a.bookingCount);
    }
    res.json({
      success: true,
      data: customersWithBookingCount,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.lockCustomer = async (req, res) => {
  try {
    const { reasonLocked, lockDuration } = req.body;
    // Xác định thời gian lock
    let lockExpiresAt = null;
    let durationText = lockDuration;
    if (lockDuration && lockDuration !== "permanent") {
      const days = parseInt(lockDuration, 10);
      if (!isNaN(days)) {
        lockExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    }
    const updateFields = {
      isLocked: true,
      status: "LOCK",
      reasonLocked: reasonLocked || "Violation of standards",
      dateLocked: new Date(),
      lockDuration: durationText || null,
      lockExpiresAt: lockExpiresAt || null,
    };
    const user = await require("../../models/user").findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unlockCustomer = async (req, res) => {
  try {
    const updateFields = {
      isLocked: false,
      status: "ACTIVE",
      lockDuration: null,
      lockExpiresAt: null,
      reasonLocked: "",
      dateLocked: null,
    };
    const user = await require("../../models/user").findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Thinh update manage hotel owner START 25/06/2025
exports.getAllOwners = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const User = require("../../models/user");
    const query = { role: "OWNER" };
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex }
      ];
    }
    // Sắp xếp
    let sort = {};
    if (req.query.sort === 'name') sort = { name: 1 };
    if (req.query.sort === 'createdAt') sort = { createdAt: -1 };
    // Lấy danh sách owner
    const [owners, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);
    // Đếm số khách sạn thực sự cho từng owner
    let ownersWithHotelCount = await Promise.all(owners.map(async (user) => {
      const hotelCount = user.ownedHotels ? user.ownedHotels.length : 0;
      return { ...user.toObject(), hotelCount };
    }));
    // Sắp xếp lại theo hotelCount nếu cần
    if (req.query.sort === 'hotelCount') {
      ownersWithHotelCount = ownersWithHotelCount.sort((a, b) => b.hotelCount - a.hotelCount);
    }
    res.json({
      success: true,
      data: ownersWithHotelCount,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHotelsByOwnerId = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem Owner có tồn tại hay không (tùy chọn, có thể bỏ nếu không cần)
    const owner = await User.findOne({ _id: id, role: "OWNER" });
    if (!owner) {
      return res.status(404).json({ MsgNo: "Owner not found" });
    }

    // Truy vấn các khách sạn có owner là id được truyền vào
    const hotels = await Hotel.find({ owner: id });

    res.json({
      MsgYes: "Hotels retrieved successfully",
      Data: hotels,
    });
  } catch (error) {
    console.error("Get hotels by owner ID error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

exports.updateOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, address } = req.body;

    // Chỉ cho phép chủ tài khoản cập nhật chính họ
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ MsgNo: "Permission denied" });
    }

    const owner = await User.findOne({ _id: id, role: "OWNER" });

    if (!owner) {
      return res.status(404).json({ MsgNo: "Owner not found" });
    }

    owner.name = name || owner.name;
    owner.phoneNumber = phoneNumber || owner.phoneNumber;
    owner.address = address || owner.address;
    owner.updatedAt = new Date();

    await owner.save();

    res.json({
      MsgYes: "Owner updated successfully",
      Data: owner,
    });
  } catch (error) {
    console.error("Update owner error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

exports.deleteOwner = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findOneAndDelete({ _id: id, role: "OWNER" });

    if (!deleted) {
      return res.status(404).json({ MsgNo: "Owner not found" });
    }

    res.json({
      MsgYes: "Owner deleted successfully",
    });
  } catch (error) {
    console.error("Delete owner error:", error);
    res.status(500).json({ MsgNo: "Internal server error" });
  }
};

// Thinh update manage hotel owner END 25/06/2025

// Middleware tự động unlock nếu hết hạn lock
exports.autoUnlockIfExpired = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.params.id;
    if (!userId) return next();
    const User = require("../../models/user");
    const user = await User.findById(userId);
    if (user && user.isLocked && user.lockExpiresAt && user.lockExpiresAt < new Date()) {
      user.isLocked = false;
      user.status = "ACTIVE";
      user.lockDuration = null;
      user.lockExpiresAt = null;
      user.reasonLocked = "";
      user.dateLocked = null;
      await user.save();
    }
    next();
  } catch (err) {
    next();
  }
};
