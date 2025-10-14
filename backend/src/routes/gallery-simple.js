import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple, non-recursive media endpoint
router.get('/media', (req, res) => {
  console.log('📹 Simple gallery endpoint called - no recursion');
  
  try {
    // Return simple static data to test if frontend stops infinite loop
    const staticVideos = [
      {
        id: 'static-1',
        title: 'House Cleaning',
        description: 'Learn basic house cleaning skills',
        filename: 'house-cleaning.mp4',
        url: `http://localhost:5000/uploads/videos/house-cleaning.mp4`,
        type: 'video',
        isFeatured: true,
        category: 'LIFE_SKILLS'
      },
      {
        id: 'static-2', 
        title: 'Pet Care',
        description: 'Learn how to care for pets',
        filename: 'pet-care.mp4',
        url: `http://localhost:5000/uploads/videos/pet-care.mp4`,
        type: 'video',
        isFeatured: true,
        category: 'LIFE_SKILLS'
      },
      {
        id: 'static-3',
        title: 'Shoe Care', 
        description: 'Learn proper shoe maintenance',
        filename: 'shoe-care.mp4',
        url: `http://localhost:5000/uploads/videos/shoe-care.mp4`,
        type: 'video',
        isFeatured: true,
        category: 'LIFE_SKILLS'
      }
    ];

    // Filter based on query parameters
    const { featured, limit = 20, type } = req.query;
    let filteredVideos = staticVideos;

    if (featured === 'true') {
      filteredVideos = filteredVideos.filter(v => v.isFeatured);
    }

    if (type === 'videos' || type === 'video') {
      filteredVideos = filteredVideos.filter(v => v.type === 'video');
    }

    const limitNum = parseInt(limit);
    if (limitNum > 0) {
      filteredVideos = filteredVideos.slice(0, limitNum);
    }

    console.log(`✅ Returning ${filteredVideos.length} videos`);

    res.json({
      success: true,
      data: filteredVideos,
      pagination: {
        page: 1,
        limit: limitNum,
        total: filteredVideos.length,
        totalPages: 1
      }
    });

  } catch (error) {
    console.error('❌ Simple gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery content',
      error: error.message
    });
  }
});

// Simple featured endpoint
router.get('/featured', (req, res) => {
  console.log('⭐ Simple featured endpoint called');
  
  try {
    const { limit = 3, type } = req.query;
    
    const featuredVideos = [
      {
        id: 'featured-1',
        title: 'House Cleaning',
        description: 'Learn basic house cleaning skills',
        filename: 'house-cleaning.mp4',
        url: `http://localhost:5000/uploads/videos/house-cleaning.mp4`,
        type: 'video'
      },
      {
        id: 'featured-2',
        title: 'Pet Care', 
        description: 'Learn how to care for pets',
        filename: 'pet-care.mp4',
        url: `http://localhost:5000/uploads/videos/pet-care.mp4`,
        type: 'video'
      },
      {
        id: 'featured-3',
        title: 'Shoe Care',
        description: 'Learn proper shoe maintenance', 
        filename: 'shoe-care.mp4',
        url: `http://localhost:5000/uploads/videos/shoe-care.mp4`,
        type: 'video'
      }
    ];

    const limitNum = parseInt(limit);
    const result = featuredVideos.slice(0, limitNum);

    console.log(`✅ Returning ${result.length} featured videos`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Simple featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured content'
    });
  }
});

export default router;