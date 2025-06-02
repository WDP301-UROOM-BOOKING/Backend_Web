const express = require("express");
const AuthController = require("./AuthController");
const checkCustomer = require("../../middlewares/checkCustomer");
const checkRole = require("../../middlewares/checkRole");
const upload = require("../../middlewares/uploadMiddleware");
const authRouter = express.Router();

// Registration and verification routes
authRouter.post("/register_customer", AuthController.registerCustomer);
authRouter.post("/verify-email", AuthController.verifyEmail);
authRouter.post("/resend-verification", AuthController.resendVerificationCode);
authRouter.post("/google_login", AuthController.googleLogin);

authRouter.post("/login_customer", AuthController.loginCustomer);
authRouter.post(
  "/updateProfile_customer",
  checkRole(["CUSTOMER", "OWNER"]),
  AuthController.updateCustomerProfile
);
authRouter.post(
  "/changePassword_customer",
  checkRole(["CUSTOMER", "OWNER"]),
  AuthController.changePassword
);
authRouter.post("/forgot_password", AuthController.forgotPassword);
authRouter.post("/reset_password", AuthController.resetPassword);
authRouter.post("/verify_forgot_password", AuthController.verifyForgotPassword);
//upload ảnh

authRouter.put(
  "/update_avatar",
  checkRole(["CUSTOMER", "OWNER"]),
  upload.single("avatar"),
  AuthController.updateAvatar
);

//hotel host
authRouter.post("/login_owner", AuthController.loginOwner);
authRouter.post("/register_owner", AuthController.registerOwner);

module.exports = authRouter;
