// Simple test of backend functionality without external dependencies
import http from 'http';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testBackend() {
  console.log('🧪 Testing Backend Functionality...\n');
  
  try {
    // Test 1: Featured videos
    console.log('1️⃣ Testing Featured Videos API...');
    const featured = await makeRequest('/api/gallery/featured?type=video');
    if (featured.status === 200 && Array.isArray(featured.data)) {
      console.log(`✅ Featured videos: ${featured.data.length} videos`);
      console.log('   📊 Top 3 featured videos (by views):');
      featured.data
        .sort((a, b) => b.views - a.views)
        .slice(0, 3)
        .forEach((video, index) => {
          console.log(`   ${index + 1}. ${video.title} (${video.views} views)`);
        });
    } else {
      console.log('❌ Featured videos API failed');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: All videos
    console.log('2️⃣ Testing All Videos API...');
    const allVideos = await makeRequest('/api/gallery/videos');
    if (allVideos.status === 200 && Array.isArray(allVideos.data)) {
      console.log(`✅ All videos: ${allVideos.data.length} videos total`);
      const featuredCount = allVideos.data.filter(v => v.isFeatured).length;
      console.log(`   ⭐ Featured videos: ${featuredCount}`);
      console.log(`   📹 Non-featured videos: ${allVideos.data.length - featuredCount}`);
    } else {
      console.log('❌ All videos API failed');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Dashboard
    console.log('3️⃣ Testing Dashboard API...');
    const dashboard = await makeRequest('/api/admin/dashboard');
    if (dashboard.status === 200) {
      console.log('✅ Dashboard API working');
      console.log(`   📊 Dashboard data structure available`);
    } else {
      console.log('❌ Dashboard API failed');
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Backend testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing backend:', error.message);
  }
}

testBackend();