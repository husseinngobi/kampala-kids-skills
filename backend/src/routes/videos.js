import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get all videos (admin access)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
        skip: parseInt(offset),
        take: parseInt(limit),
        include: {
          uploader: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      }),
      prisma.video.count({ where })
    ]);

    const formattedVideos = videos.map(video => ({
      ...video,
      videoUrl: `/uploads/videos/${video.filename}`,
      uploaderName: video.uploader ? `${video.uploader.firstName} ${video.uploader.lastName}` : 'System',
      uploaderEmail: video.uploader?.email || 'system@kampala-kids-skills.com',
      fileSizeFormatted: formatFileSize(video.fileSize)
    }));

    res.json({
      success: true,
      data: formattedVideos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single video details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...video,
        videoUrl: `/uploads/videos/${video.filename}`,
        uploaderName: video.uploader ? `${video.uploader.firstName} ${video.uploader.lastName}` : 'System',
        fileSizeFormatted: formatFileSize(video.fileSize)
      }
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload new video
router.post('/upload', authenticateToken, upload.single('video'), [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3-200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('category').isIn(['HOUSE_CLEANING', 'PET_CARE', 'SHOE_CARE', 'TABLE_SETTING', 'GENERAL', 'EDUCATIONAL'])
    .withMessage('Invalid category'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const { title, description, category, isPublic = false } = req.body;
    const { filename, originalname, size, mimetype } = req.file;

    // Validate file type
    if (!mimetype.startsWith('video/')) {
      return res.status(400).json({
        success: false,
        message: 'File must be a video'
      });
    }

    // Create video record
    const video = await prisma.video.create({
      data: {
        title,
        description,
        category,
        filename,
        originalName: originalname,
        fileSize: size,
        mimeType: mimetype,
        isPublic: Boolean(isPublic),
        uploaderId: req.user.id,
        status: 'ACTIVE'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        id: video.id,
        title: video.title,
        videoUrl: `/uploads/videos/${video.filename}`,
        uploadedAt: video.uploadedAt
      }
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update video details
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3-200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('category').optional().isIn(['HOUSE_CLEANING', 'PET_CARE', 'SHOE_CARE', 'TABLE_SETTING', 'GENERAL', 'EDUCATIONAL'])
    .withMessage('Invalid category'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = {};

    // Only include fields that are provided
    const { title, description, category, isPublic } = req.body;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);

    const video = await prisma.video.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    console.error('Error updating video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete video
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // First get the video to get the filename
    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Delete from database
    await prisma.video.delete({
      where: { id }
    });

    // Note: In production, you might want to also delete the physical file
    // This requires additional file system operations

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get video categories with counts
router.get('/stats/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.video.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    const formattedCategories = categories.map(cat => ({
      category: cat.category,
      count: cat._count.id,
      label: formatCategoryLabel(cat.category)
    }));

    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching video categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Utility functions
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatCategoryLabel(category) {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

export default router;