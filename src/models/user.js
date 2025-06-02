const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserSchema = new Schema(
  {
    _id: {
      type: Number,
    },
    providerId: { type: String },
    name: { type: String, required: true },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email!"],
    },

    //const user = await User.findOne({ email }).select("+password");
    //vì select: false nên lúc findOne sẽ không ra password mà phải dùng select như trên
    password: {
      type: String,
      required: [
        function () {
          return !this.providerId; // Password is required only if providerId is not provided
        },
        "Password is required!",
      ],
      select: false,
    },
    phoneNumber: {
      type: String,
      default: "N/A",
    },
    status: {
      type: String,
      enum: ["INACTIVE", "ACTIVE", "LOCK"],
      default: "ACTIVE",
    },
    createOn: { type: Date, default: new Date().getTime() },
    cmnd: { type: String, default: "N/A" },
    updatedAt: { type: Date, default: new Date().getTime() },
    address: { type: String, default: "N/A" },
    role: {
      type: String,
      enum: ["CUSTOMER", "ADMIN", "OWNER"],
      default: "CUSTOMER",
    },
    reservations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
    ownedHotels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Hotel",
      },
    ], // Mảng các khách sạn người dùng sở hữu (tham chiếu đến Hotel),
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Hotel",
      },
    ], // Mảng các khách sạn yêu thích (tham chiếu đến Hotel)
    image: {
      public_ID: {
        type: String,
        default: "avatar_default"
      },
      url: {
        type: String,
        default: "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg",
      },
    }, //avatar
    //MẢNG BUSSINESS DOCUMENT
    isVerified: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    reasonLocked: {
      type: String,
      default: "Violation of standards",
    },
    dateLocked: {
      type: Date,
      default: () => new Date(),
    },
    birthDate: {
      type: Date,
      default: new Date("2000-01-01"),
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE"],
      default: "MALE",
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true },
  { versionKey: false }
);

// Hashing mật khẩu trước khi lưu
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.plugin(AutoIncrement, { id: "user_seq", inc_field: "_id" });

// Index hóa email để tìm kiếm nhanh hơn
UserSchema.index({ email: 1 });

module.exports = mongoose.model("User", UserSchema);
