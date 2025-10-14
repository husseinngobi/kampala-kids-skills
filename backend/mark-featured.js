import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY // Using service key for write operations
);

async function markFeaturedVideos() {
  try {
    console.log('🎯 Marking first 3 videos as featured...');
    
    // Get first 3 videos
    const { data: videos, error: fetchError } = await supabase
      .from('videos')
      .select('id, title, featured')
      .limit(3);
    
    if (fetchError) throw fetchError;
    
    console.log('📹 Found videos:');
    videos.forEach((v, i) => console.log(`${i+1}. ${v.title} (featured: ${v.featured})`));
    
    // Update them to be featured
    const { error: updateError } = await supabase
      .from('videos')
      .update({ featured: true })
      .in('id', videos.map(v => v.id));
    
    if (updateError) throw updateError;
    
    console.log('✅ Successfully marked 3 videos as featured!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

markFeaturedVideos();