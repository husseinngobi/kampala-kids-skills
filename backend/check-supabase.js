import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkSupabaseSetup() {
  console.log('🔍 Checking Supabase setup...\n');
  
  try {
    // 1. Check videos in database
    console.log('📹 Checking videos in database:');
    const { data: videos, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (videoError) {
      console.error('❌ Error fetching videos:', videoError);
    } else {
      console.log(`✅ Found ${videos.length} videos in database:`);
      videos.forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.title}`);
        console.log(`      - Featured: ${video.featured ? 'YES' : 'NO'}`);
        console.log(`      - Category: ${video.category}`);
        console.log(`      - URL: ${video.url}`);
        console.log(`      - Views: ${video.views}`);
        console.log('');
      });
    }
    
    // 2. Check featured videos specifically
    console.log('\n⭐ Checking featured videos:');
    const { data: featuredVideos, error: featuredError } = await supabase
      .from('videos')
      .select('*')
      .eq('featured', true)
      .eq('status', 'ACTIVE');
    
    if (featuredError) {
      console.error('❌ Error fetching featured videos:', featuredError);
    } else {
      console.log(`✅ Found ${featuredVideos.length} featured videos:`);
      featuredVideos.forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.title} (${video.category})`);
      });
    }
    
    // 3. Check storage buckets
    console.log('\n💾 Checking storage buckets:');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error fetching buckets:', bucketError);
    } else {
      console.log(`✅ Found ${buckets.length} storage buckets:`);
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
      });
    }
    
    // 4. Check files in videos bucket
    console.log('\n🎬 Checking files in videos bucket:');
    const { data: videoFiles, error: filesError } = await supabase.storage
      .from('videos')
      .list('', { limit: 100 });
    
    if (filesError) {
      console.error('❌ Error fetching video files:', filesError);
    } else {
      console.log(`✅ Found ${videoFiles.length} files in videos bucket:`);
      videoFiles.forEach(file => {
        console.log(`   - ${file.name} (${(file.metadata?.size / 1024 / 1024).toFixed(1)}MB)`);
      });
    }
    
    console.log('\n🎯 Summary:');
    console.log(`   • Database: ${videos?.length || 0} videos total`);
    console.log(`   • Featured: ${featuredVideos?.length || 0} videos for homepage`);
    console.log(`   • Storage: ${videoFiles?.length || 0} video files uploaded`);
    
  } catch (error) {
    console.error('❌ Error checking Supabase setup:', error);
  }
}

checkSupabaseSetup();