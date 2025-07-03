// Test script for Admin Dashboard API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test function
async function testDashboardAPI() {
  try {
    console.log('🧪 Testing Admin Dashboard API...\n');

    // Test without authentication (should fail)
    console.log('1. Testing without authentication...');
    try {
      const response = await axios.get(`${BASE_URL}/dashboard-admin/metrics`);
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test with mock admin token (you'll need to replace with real token)
    console.log('\n2. Testing with authentication...');
    console.log('⚠️  Note: You need to replace this with a real admin JWT token');
    
    const mockToken = 'your-admin-jwt-token-here';
    
    try {
      const response = await axios.get(`${BASE_URL}/dashboard-admin/metrics`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
      
      console.log('✅ API Response received');
      console.log('📊 Dashboard Data Structure:');
      console.log('- Total Hotels:', response.data.data.totalHotels);
      console.log('- Active Hotels:', response.data.data.activeHotels);
      console.log('- Pending Approvals:', response.data.data.pendingApprovals);
      console.log('- Total Customers:', response.data.data.totalCustomers);
      console.log('- Total Revenue:', response.data.data.totalRevenue);
      console.log('- Revenue Chart Labels:', response.data.data.revenueData.labels.length, 'months');
      console.log('- Recent Approvals:', response.data.data.recentApprovals.length, 'items');
      console.log('- Recent Reports:', response.data.data.recentReports.length, 'items');
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️  Authentication failed - please provide valid admin token');
      } else {
        console.log('❌ API Error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🔧 To test with real authentication:');
    console.log('1. Login as admin user to get JWT token');
    console.log('2. Replace mockToken variable with real token');
    console.log('3. Run this script again');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run test
testDashboardAPI();
