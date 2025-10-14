import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Supabase Gallery API...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testGalleryAPI() {
  try {
    console.log('🔍 Fetching featured videos...');
    
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('status', 'ACTIVE')
      .eq('featured', true)
      .limit(3)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Found ${data.length} featured videos:`);
    data.forEach((video, i) => {
      console.log(`${i + 1}. ${video.title} (${video.filename})`);
    });
    
    // Format like our API would
    const formattedVideos = data.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      filename: video.filename,
      url: `http://localhost:5000/uploads/videos/${video.filename}`,
      videoUrl: `http://localhost:5000/uploads/videos/${video.filename}`,
      type: 'video',
      isFeatured: video.featured,
      category: video.category,
      views: video.views || 0,
      createdAt: video.created_at
    }));
    
    console.log('\n🎯 API Response Preview:');
    console.log(JSON.stringify({
      success: true,
      data: formattedVideos,
      count: formattedVideos.length,
      source: 'supabase'
    }, null, 2));
    
    console.log('\n✅ Gallery API test successful! Ready to serve frontend.');
    
  } catch (error) {
    console.error('❌ Gallery API test failed:', error.message);
  }
}

testGalleryAPI();