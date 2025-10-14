import http from 'http';

const testVideoUrls = [
  'http://localhost:5000/uploads/videos/house-cleaning.mp4',
  'http://localhost:5000/uploads/videos/Basic%20Plant%20care.mp4',
  'http://localhost:5000/uploads/videos/Basic Plant care.mp4',
  'http://localhost:5000/uploads/videos/Car%20Cleaning.mp4',
  'http://localhost:5000/uploads/videos/Car Cleaning.mp4'
];

console.log('🧪 Testing video URL access...\n');

testVideoUrls.forEach((url, index) => {
  console.log(`Test ${index + 1}: ${url}`);
  
  const request = http.get(url, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    console.log(`📄 Headers: ${JSON.stringify(res.headers, null, 2)}`);
    console.log('---\n');
    res.destroy(); // Don't download the full video
  });
  
  request.on('error', (err) => {
    console.log(`❌ Error: ${err.message}`);
    console.log('---\n');
  });
  
  request.setTimeout(5000, () => {
    console.log(`⏰ Timeout`);
    console.log('---\n');
    request.destroy();
  });
});