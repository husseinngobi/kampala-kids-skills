import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);

async function checkUrls() {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('title, filename, url')
      .limit(3);
    
    if (error) throw error;
    
    console.log('📊 Current video URLs in database:');
    data.forEach((v, i) => {
      console.log(`${i+1}. ${v.title} (${v.filename})`);
      console.log(`   URL: ${v.url}`);
      console.log('');
    });
    
    // Check if URLs are using Supabase
    const usingSupabase = data.every(v => v.url.includes('supabase.co'));
    if (usingSupabase) {
      console.log('✅ All videos are using Supabase Storage URLs!');
    } else {
      console.log('⚠️ Some videos still using local URLs - need to update');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUrls();