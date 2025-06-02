/**
 * Email verification template
 * @param {string} name - User's name
 * @param {string} verificationCode - 6-digit verification code
 * @returns {string} - HTML content for verification email
 */
const emailVerificationTemplate = (name, verificationCode) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #4a90e2; color: white; padding: 10px 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; }
        .code-container { text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4a90e2; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>UROOM Account Verification</h2>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Thank you for registering with UROOM. To complete your registration and activate your account, please use the following verification code:</p>
          <div class="code-container">
            <div class="code">${verificationCode}</div>
          </div>
          <p>Enter this code in the verification page to activate your account.</p>
          <p>This verification code will expire in 24 hours.</p>
          <p>If you did not create an account with UROOM, please ignore this email.</p>
          <p>Thank you,<br>The UROOM Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} UROOM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  emailVerificationTemplate
}; 