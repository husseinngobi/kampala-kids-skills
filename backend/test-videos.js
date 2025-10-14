import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Test video accessibility
async function testVideoAccess() {
  console.log('🎬 Testing video accessibility...\n');
  
  const testVideos = [
    'https://hrkyolfxuxlivbzbxsbq.supabase.co/storage/v1/object/public/videos/house-cleaning.mp4',
    'https://hrkyolfxuxlivbzbxsbq.supabase.co/storage/v1/object/public/videos/pet-care.mp4',
    'https://hrkyolfxuxlivbzbxsbq.supabase.co/storage/v1/object/public/videos/shoe-care.mp4'
  ];
  
  for (const url of testVideos) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const videoName = url.split('/').pop();
      console.log(`✅ ${videoName}: ${response.status} ${response.statusText} (${response.headers.get('content-length')} bytes)`);
    } catch (error) {
      console.log(`❌ ${url}: ${error.message}`);
    }
  }
}

testVideoAccess();