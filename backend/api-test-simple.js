fetch('http://localhost:5000/api/gallery/media?featured=true&limit=3')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Featured Videos API Test');
    console.log('Status: OK');
    console.log('Count:', data.data?.length || 0);
    
    if (data.data) {
      data.data.forEach((video, i) => {
        console.log(`${i+1}. ${video.title} (${video.views} views)`);
        console.log(`   URL: ${video.url}`);
      });
    }
  })
  .catch(err => console.error('Error:', err.message));