import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service key for file uploads
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Service key needed for storage operations
);

async function uploadVideosToSupabase() {
  try {
    console.log('🚀 Starting video upload to Supabase Storage...\n');
    
    const videosDir = path.join(__dirname, 'uploads', 'videos');
    const videoFiles = fs.readdirSync(videosDir);
    
    console.log(`📹 Found ${videoFiles.length} videos to upload:`);
    videoFiles.forEach((file, i) => console.log(`${i + 1}. ${file}`));
    console.log('');
    
    for (const filename of videoFiles) {
      if (!filename.endsWith('.mp4')) {
        console.log(`⏭️ Skipping non-video file: ${filename}`);
        continue;
      }
      
      console.log(`📤 Uploading ${filename}...`);
      
      const filePath = path.join(videosDir, filename);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filename, fileBuffer, {
          cacheControl: '3600',
          upsert: true, // Replace if exists
          contentType: 'video/mp4'
        });
      
      if (error) {
        console.log(`❌ Failed to upload ${filename}:`, error.message);
      } else {
        console.log(`✅ Successfully uploaded: ${filename}`);
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('videos')
          .getPublicUrl(filename);
        
        console.log(`🔗 Public URL: ${publicUrlData.publicUrl}`);
        
        // Update the database record with the new Supabase URL
        const { error: updateError } = await supabase
          .from('videos')
          .update({ 
            url: publicUrlData.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('filename', filename);
        
        if (updateError) {
          console.log(`⚠️ Warning: Could not update database URL for ${filename}:`, updateError.message);
        } else {
          console.log(`📊 Database updated with new URL for ${filename}`);
        }
      }
      console.log('');
    }
    
    console.log('🎉 Video upload process completed!');
    console.log('🔍 Checking final status...\n');
    
    // Verify uploads
    const { data: storageFiles, error: listError } = await supabase.storage
      .from('videos')
      .list('', {
        limit: 100,
        offset: 0
      });
    
    if (listError) {
      console.log('❌ Error checking uploaded files:', listError.message);
    } else {
      console.log(`✅ Supabase Storage now contains ${storageFiles.length} files:`);
      storageFiles.forEach((file, i) => {
        console.log(`${i + 1}. ${file.name} (${(file.metadata?.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Upload process failed:', error.message);
  }
}

uploadVideosToSupabase();