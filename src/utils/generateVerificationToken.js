/**
 * Generate a 6-digit verification code for email verification
 * @returns {string} 6-digit verification code
 */
const generateVerificationToken = () => {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = generateVerificationToken; 