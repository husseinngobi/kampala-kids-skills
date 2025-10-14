import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

async function retryFailedUploads() {
  const failedFiles = ['plants.jpg', 'polishing.jpg'];
  
  console.log('🔄 Retrying failed image uploads...\n');
  
  for (const filename of failedFiles) {
    try {
      console.log(`📤 Retrying: ${filename}`);
      const imagePath = path.resolve(__dirname, `uploads/images/${filename}`);
      
      if (fs.existsSync(imagePath)) {
        const imageFile = fs.readFileSync(imagePath);
        
        const { data, error } = await supabase.storage
          .from('images')
          .upload(filename, imageFile, {
            contentType: 'image/jpeg',
            upsert: true
          });
        
        if (error) {
          console.log(`   ❌ Still failed: ${error.message}`);
        } else {
          console.log(`   ✅ Success!`);
          const { data: urlData } = supabase.storage.from('images').getPublicUrl(filename);
          console.log(`   🔗 URL: ${urlData.publicUrl}`);
        }
      } else {
        console.log(`   ❌ File not found: ${imagePath}`);
      }
      console.log('');
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      console.log('');
    }
  }
}

retryFailedUploads();