import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🧪 Testing Backend API Endpoints...\n');
    
    // Test 1: Featured videos endpoint
    console.log('1️⃣ Testing Featured Videos API...');
    const featuredResponse = await fetch('http://localhost:5000/api/gallery/featured?type=video');
    const featuredData = await featuredResponse.json();
    
    if (featuredResponse.ok) {
      console.log('✅ Featured videos endpoint working!');
      console.log(`📊 Returned ${featuredData.length} featured videos`);
      featuredData.forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.title} (${video.views} views)`);
      });
    } else {
      console.log('❌ Featured videos endpoint failed:', featuredData);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: All videos endpoint
    console.log('2️⃣ Testing All Videos API...');
    const allVideosResponse = await fetch('http://localhost:5000/api/gallery/videos');
    const allVideosData = await allVideosResponse.json();
    
    if (allVideosResponse.ok) {
      console.log('✅ All videos endpoint working!');
      console.log(`📊 Total videos: ${allVideosData.length}`);
      allVideosData.forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.title} - Featured: ${video.isFeatured ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('❌ All videos endpoint failed:', allVideosData);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Dashboard data endpoint
    console.log('3️⃣ Testing Admin Dashboard Data...');
    const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard');
    const dashboardData = await dashboardResponse.json();
    
    if (dashboardResponse.ok) {
      console.log('✅ Dashboard endpoint working!');
      console.log(`📊 Dashboard stats:`);
      console.log(`   👥 Total Parents: ${dashboardData.totalParents}`);
      console.log(`   👶 Total Children: ${dashboardData.totalChildren}`);
      console.log(`   📹 Total Videos: ${dashboardData.totalVideos}`);
      console.log(`   🖼️ Total Images: ${dashboardData.totalImages}`);
      console.log(`   📝 Total Enrollments: ${dashboardData.totalEnrollments}`);
    } else {
      console.log('❌ Dashboard endpoint failed:', dashboardData);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Backend API testing completed!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();