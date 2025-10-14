import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Using service key for uploads
);

async function uploadImages() {
  try {
    console.log('📸 Starting image upload to Supabase Storage...\n');
    
    const imagePaths = [
      // Backend uploaded images
      { local: '../backend/uploads/images/carwash.jpg', bucket: 'images', filename: 'carwash.jpg' },
      { local: '../backend/uploads/images/children-activity-1.jpg', bucket: 'images', filename: 'children-activity-1.jpg' },
      { local: '../backend/uploads/images/children-activity-2.jpg', bucket: 'images', filename: 'children-activity-2.jpg' },
      { local: '../backend/uploads/images/children-activity-3.jpg', bucket: 'images', filename: 'children-activity-3.jpg' },
      { local: '../backend/uploads/images/children-dining.jpg', bucket: 'images', filename: 'children-dining.jpg' },
      { local: '../backend/uploads/images/children-learning-1.jpg', bucket: 'images', filename: 'children-learning-1.jpg' },
      { local: '../backend/uploads/images/children-learning-2.jpg', bucket: 'images', filename: 'children-learning-2.jpg' },
      { local: '../backend/uploads/images/plants.jpg', bucket: 'images', filename: 'plants.jpg' },
      { local: '../backend/uploads/images/polishing.jpg', bucket: 'images', filename: 'polishing.jpg' },
      { local: '../backend/uploads/images/table-setting-1.jpg', bucket: 'images', filename: 'table-setting-1.jpg' },
      { local: '../backend/uploads/images/table-setting-2.jpg', bucket: 'images', filename: 'table-setting-2.jpg' },
      
      // Frontend assets
      { local: '../frontend/src/assets/life-skills-logo.jpeg', bucket: 'images', filename: 'life-skills-logo.jpeg' }
    ];
    
    console.log(`📋 Found ${imagePaths.length} images to upload\n`);
    
    for (const imageInfo of imagePaths) {
      try {
        const imagePath = path.resolve(__dirname, imageInfo.local);
        
        console.log(`📤 Uploading: ${imageInfo.filename}`);
        console.log(`   Source: ${imagePath}`);
        
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
          console.log(`   ⚠️ File not found, skipping...`);
          continue;
        }
        
        // Read the image file
        const imageFile = fs.readFileSync(imagePath);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(imageInfo.bucket)
          .upload(imageInfo.filename, imageFile, {
            contentType: `image/${path.extname(imageInfo.filename).slice(1)}`,
            upsert: true // Overwrite if exists
          });
        
        if (error) {
          console.log(`   ❌ Upload failed: ${error.message}`);
        } else {
          console.log(`   ✅ Successfully uploaded!`);
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from(imageInfo.bucket)
            .getPublicUrl(imageInfo.filename);
          
          console.log(`   🔗 Public URL: ${urlData.publicUrl}`);
        }
        
        console.log(''); // Empty line for readability
        
      } catch (fileError) {
        console.log(`   ❌ Error processing ${imageInfo.filename}: ${fileError.message}`);
        console.log('');
      }
    }
    
    console.log('🎉 Image upload completed!');
    console.log('\n📸 Check your Supabase Storage dashboard to see all uploaded images:');
    console.log('🔗 Images: https://supabase.com/dashboard/project/hrkyolfxuxlivbzbxsbq/storage/buckets/images');
    
  } catch (error) {
    console.error('❌ Upload process failed:', error.message);
  }
}

uploadImages();