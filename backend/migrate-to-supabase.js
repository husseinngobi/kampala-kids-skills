import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Using service key for write operations
);

async function migrateVideos() {
  try {
    console.log('🔄 Starting video migration from Prisma to Supabase...\n');
    
    // Get all videos from Prisma
    const prismaVideos = await prisma.video.findMany();
    console.log(`📊 Found ${prismaVideos.length} videos in Prisma database\n`);
    
    for (const video of prismaVideos) {
      console.log(`📹 Migrating: ${video.title}`);
      
      // Prepare video data for Supabase
      const supabaseVideo = {
        title: video.title,
        description: video.description || null,
        filename: video.filename,
        url: video.url || `/uploads/videos/${video.filename}`,
        category: video.category || 'GENERAL',
        featured: video.featured || false,
        duration: video.duration || null,
        file_size: video.fileSize || null,
        mime_type: video.mimeType || 'video/mp4',
        views: video.views || 0,
        status: video.status || 'ACTIVE',
        created_at: video.createdAt || new Date().toISOString(),
        updated_at: video.updatedAt || new Date().toISOString()
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('videos')
        .insert([supabaseVideo]);
      
      if (error) {
        console.log(`❌ Failed to migrate ${video.title}:`, error.message);
      } else {
        console.log(`✅ Successfully migrated: ${video.title}`);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('🔍 Verifying migration...\n');
    
    // Verify migration
    const { data: migratedVideos, error: verifyError } = await supabase
      .from('videos')
      .select('*');
    
    if (verifyError) {
      console.log('❌ Error verifying migration:', verifyError.message);
    } else {
      console.log(`✅ Verification complete: ${migratedVideos.length} videos in Supabase`);
      migratedVideos.forEach((video, i) => {
        console.log(`${i + 1}. ${video.title} (${video.filename})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateVideos();