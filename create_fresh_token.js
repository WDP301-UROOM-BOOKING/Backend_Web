require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user');
const jwt = require('jsonwebtoken');

// Tạo token mới cho user để test
async function createFreshToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/My_Uroom');
    
    console.log("🔑 Creating Fresh Token for Testing");
    console.log("=" .repeat(50));
    
    // Tìm user
    const user = await User.findOne({ _id: 11 });
    if (!user) {
      console.log("❌ User not found");
      return;
    }
    
    console.log(`✅ User found: ${user.name} (${user.email})`);
    
    // Tạo token mới
    const tokenPayload = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        isLocked: user.isLocked
      }
    };
    
    const token = jwt.sign(
      tokenPayload,
      process.env.SECRET_KEY || 'hoangnguyen',
      {
        expiresIn: '365d', // 1 năm để test
        issuer: 'issuer'
      }
    );
    
    console.log(`\n🎯 Fresh Token (valid for 365 days):`);
    console.log(token);
    
    // Test token ngay
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY || 'hoangnguyen');
      console.log(`\n✅ Token verification successful`);
      console.log(`📊 Token payload:`, {
        userId: decoded.user._id,
        name: decoded.user.name,
        email: decoded.user.email,
        role: decoded.user.role,
        expiresAt: new Date(decoded.exp * 1000).toLocaleString()
      });
    } catch (error) {
      console.log(`❌ Token verification failed:`, error.message);
    }
    
    console.log(`\n📋 How to use this token:`);
    console.log(`1. Copy the token above`);
    console.log(`2. Use it in Authorization header: "Bearer <token>"`);
    console.log(`3. Test API: GET /api/promotions/claimed`);
    console.log(`4. Or use it in frontend localStorage`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Chạy script
createFreshToken();
