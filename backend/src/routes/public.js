import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index.js';

const router = express.Router();

// Get all public videos (for homepage display)
router.get('/videos', async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        title: true,
        description: true,
        filename: true,
        category: true,
        views: true,
        uploadedAt: true
      },
      orderBy: { uploadedAt: 'desc' },
      take: 10 // Limit to 10 videos for performance
    });

    // Format videos for frontend
    const formattedVideos = videos.map(video => ({
      ...video,
      videoUrl: `/uploads/videos/${video.filename}`,
      thumbnail: `/uploads/videos/thumbnails/${video.filename.replace(/\.[^/.]+$/, '.jpg')}` // We'll generate thumbnails later
    }));

    res.json({
      success: true,
      data: formattedVideos,
      count: formattedVideos.length
    });
  } catch (error) {
    console.error('Error fetching public videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get programme levels and pricing
router.get('/programme-levels', async (req, res) => {
  try {
    const levels = await prisma.programmeLevel.findMany({
      orderBy: { ageMin: 'asc' }
    });

    const formattedLevels = levels.map(level => ({
      ...level,
      skills: JSON.parse(level.skills || '[]'),
      feeFormatted: new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: 'UGX',
        minimumFractionDigits: 0
      }).format(level.fee)
    }));

    res.json({
      success: true,
      data: formattedLevels
    });
  } catch (error) {
    console.error('Error fetching programme levels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch programme levels',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get upcoming programme sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await prisma.programmeSession.findMany({
      where: {
        status: 'UPCOMING',
        startDate: {
          gte: new Date()
        }
      },
      orderBy: { startDate: 'asc' },
      take: 5
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Contact form submission
router.post('/contact', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10-1000 characters')
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

    const { name, email, phone, message } = req.body;

    // Check if parent exists
    let parent = null;
    try {
      parent = await prisma.parent.findUnique({
        where: { email }
      });
    } catch (e) {
      // Parent doesn't exist, that's fine
    }

    // Create contact inquiry
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone,
        message,
        parentId: parent?.id || null,
        status: 'NEW'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your inquiry! We will get back to you within 24 hours.',
      data: {
        id: inquiry.id,
        createdAt: inquiry.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Track video views
router.post('/videos/:id/view', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.video.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      message: 'View tracked'
    });
  } catch (error) {
    // Don't log this error as it's not critical
    res.status(200).json({
      success: false,
      message: 'View tracking failed'
    });
  }
});

// Get system statistics (for public display)
router.get('/stats', async (req, res) => {
  try {
    const [
      totalEnrollments,
      completedProgrammes,
      totalVideos,
      totalParents
    ] = await Promise.all([
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
      prisma.video.count({ where: { isPublic: true } }),
      prisma.parent.count()
    ]);

    res.json({
      success: true,
      data: {
        totalEnrollments,
        completedProgrammes,
        totalVideos,
        totalFamilies: totalParents,
        successRate: totalEnrollments > 0 ? Math.round((completedProgrammes / totalEnrollments) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;