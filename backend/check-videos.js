import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function checkVideos() {
  try {
    console.log('🔍 Checking videos in database...\n');
    
    // Get all videos from database
    const videosInDb = await prisma.video.findMany({
      orderBy: { title: 'asc' }
    });
    
    console.log(`📊 Videos in database: ${videosInDb.length}`);
    console.log('='.repeat(50));
    
    videosInDb.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   📁 File: ${video.filename}`);
      console.log(`   📂 Category: ${video.category}`);
      console.log(`   ⭐ Featured: ${video.isFeatured ? 'Yes' : 'No'}`);
      console.log(`   👁️ Views: ${video.views}`);
      console.log(`   📊 Status: ${video.status}`);
      console.log(`   🗓️ Uploaded: ${video.uploadedAt.toLocaleDateString()}`);
      console.log('');
    });
    
    // Check actual video files in uploads folder
    const uploadsDir = path.join(__dirname, 'uploads', 'videos');
    const videoFiles = fs.readdirSync(uploadsDir).filter(file => 
      file.endsWith('.mp4') || file.endsWith('.mov') || file.endsWith('.avi')
    );
    
    console.log('='.repeat(50));
    console.log(`📁 Video files in uploads folder: ${videoFiles.length}`);
    console.log('='.repeat(50));
    
    videoFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
      
      // Check if this file is in database
      const inDb = videosInDb.find(v => v.filename === file || v.originalName === file);
      console.log(`   📊 In Database: ${inDb ? '✅ Yes' : '❌ No'}`);
      if (inDb) {
        console.log(`   🏷️ Title: ${inDb.title}`);
      }
      console.log('');
    });
    
    // Check for featured videos specifically
    const featuredVideos = videosInDb.filter(v => v.isFeatured);
    console.log('='.repeat(50));
    console.log(`⭐ Featured videos: ${featuredVideos.length}`);
    console.log('='.repeat(50));
    
    featuredVideos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title} (${video.views} views)`);
    });
    
    if (featuredVideos.length === 0) {
      console.log('⚠️ No featured videos found! Need to set some videos as featured.');
    }
    
  } catch (error) {
    console.error('❌ Error checking videos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVideos();