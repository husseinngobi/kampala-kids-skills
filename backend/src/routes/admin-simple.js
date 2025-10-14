import express from 'express';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Simple admin endpoints without authentication for testing

// Helper function to read featured.json
const readFeaturedVideos = async () => {
  try {
    const featuredPath = path.join(__dirname, '../../../frontend/public/featured.json');
    const data = await fs.readFile(featuredPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading featured.json:', error);
    return { featured: [] };
  }
};

// Helper function to write featured.json
const writeFeaturedVideos = async (featuredData) => {
  try {
    const featuredPath = path.join(__dirname, '../../../frontend/public/featured.json');
    await fs.writeFile(featuredPath, JSON.stringify(featuredData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing featured.json:', error);
    return false;
  }
};

// Helper function to copy video to featured folder
const copyVideoToFeatured = async (filename) => {
  try {
    const sourcePath = path.join(__dirname, '../uploads/videos', filename);
    const destPath = path.join(__dirname, '../../../frontend/public/featured-videos', filename);
    
    // Ensure featured-videos directory exists
    const featuredDir = path.dirname(destPath);
    if (!fsSync.existsSync(featuredDir)) {
      await fs.mkdir(featuredDir, { recursive: true });
    }
    
    // Copy the file
    await fs.copyFile(sourcePath, destPath);
    console.log(`✅ Video copied to featured: ${filename}`);
    return true;
  } catch (error) {
    console.error('❌ Error copying video to featured:', error);
    return false;
  }
};

// Helper function to remove video from featured folder
const removeVideoFromFeatured = async (filename) => {
  try {
    const destPath = path.join(__dirname, '../../../frontend/public/featured-videos', filename);
    
    if (fsSync.existsSync(destPath)) {
      await fs.unlink(destPath);
      console.log(`✅ Video removed from featured: ${filename}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Error removing video from featured:', error);
    return false;
  }
};

// POST /api/admin-simple/videos/:filename/make-featured
// Copy a video to the featured videos folder (simplified, no auth)
router.post('/videos/:filename/make-featured', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log(`📝 Making video featured: ${filename}`);
    
    // Copy video to featured folder
    const copied = await copyVideoToFeatured(filename);
    if (!copied) {
      return res.status(500).json({
        success: false,
        error: 'Failed to copy video to featured folder'
      });
    }
    
    res.json({
      success: true,
      message: 'Video copied to featured folder',
      filename: filename
    });
    
  } catch (error) {
    console.error('❌ Make featured error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/admin-simple/featured-videos
// Add or remove videos from featured.json manifest (simplified, no auth)
router.post('/featured-videos', async (req, res) => {
  try {
    const { action, video, videoId } = req.body;
    console.log(`📝 Featured videos action: ${action}`, video);
    
    // Read current featured videos
    const featuredData = await readFeaturedVideos();
    
    if (action === 'add') {
      // Limit to 3 featured videos
      if (featuredData.featured.length >= 3) {
        return res.status(400).json({
          success: false,
          error: 'Maximum of 3 featured videos allowed'
        });
      }
      
      // Check if already featured
      const exists = featuredData.featured.find(fv => fv.id === video.id);
      if (exists) {
        return res.status(400).json({
          success: false,
          error: 'Video is already featured'
        });
      }
      
      // Add to featured
      featuredData.featured.push({
        id: video.id,
        title: video.title,
        description: video.description,
        filename: video.filename,
        thumbnail: video.thumbnail || '/placeholder.svg',
        category: video.category,
        views: video.views || 0,
        uploadDate: video.uploadDate || new Date().toISOString(),
        duration: video.duration || '0:00',
        isFeatured: true,
        staticPath: `/featured-videos/${video.filename}`
      });
      
      // Also copy the file
      await copyVideoToFeatured(video.filename);
      
    } else if (action === 'remove') {
      // Remove from featured
      const index = featuredData.featured.findIndex(fv => fv.id === videoId);
      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Video not found in featured list'
        });
      }
      
      const removedVideo = featuredData.featured[index];
      featuredData.featured.splice(index, 1);
      
      // Remove physical file from featured folder
      await removeVideoFromFeatured(removedVideo.filename);
    }
    
    // Save updated featured.json
    const saved = await writeFeaturedVideos(featuredData);
    if (!saved) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update featured videos list'
      });
    }
    
    res.json({
      success: true,
      message: `Video ${action}ed successfully`,
      featured: featuredData.featured
    });
    
  } catch (error) {
    console.error('❌ Featured videos management error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;