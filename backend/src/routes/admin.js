import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { uploadVideo, uploadImage, uploadMultiple } from '../middleware/upload.js';

const router = express.Router();

// Admin login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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

    const { email, password } = req.body;

    // Find admin user
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: 'ADMIN',
        permissions: admin.permissions ? JSON.parse(admin.permissions) : []
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions ? JSON.parse(admin.permissions) : []
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalEnrollments,
      pendingEnrollments,
      activeEnrollments,
      completedEnrollments,
      totalParents,
      totalChildren,
      totalVideos,
      publicVideos,
      totalInquiries,
      newInquiries,
      totalRevenue,
      thisMonthRevenue
    ] = await Promise.all([
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'PENDING' } }),
      prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
      prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
      prisma.parent.count(),
      prisma.child.count(),
      prisma.video.count(),
      prisma.video.count({ where: { isPublic: true } }),
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { status: 'NEW' } }),
      prisma.enrollment.aggregate({ _sum: { totalFee: true } }),
      prisma.enrollment.aggregate({
        _sum: { totalFee: true },
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    // Get recent activities
    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        child: { select: { firstName: true, lastName: true } },
        programmeLevel: { select: { name: true } }
      }
    });

    const recentInquiries = await prisma.contactInquiry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        subject: true,
        inquiryType: true,
        status: true,
        createdAt: true
      }
    });

    // Get enrollment trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const enrollmentTrend = await prisma.enrollment.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sixMonthsAgo }
      },
      _count: { id: true }
    });

    // Process trend data by month
    const trendData = {};
    enrollmentTrend.forEach(item => {
      const monthKey = item.createdAt.toISOString().substring(0, 7); // YYYY-MM
      trendData[monthKey] = (trendData[monthKey] || 0) + item._count.id;
    });

    res.json({
      success: true,
      data: {
        stats: {
          enrollments: {
            total: totalEnrollments,
            pending: pendingEnrollments,
            active: activeEnrollments,
            completed: completedEnrollments
          },
          users: {
            totalParents,
            totalChildren
          },
          videos: {
            total: totalVideos,
            public: publicVideos,
            private: totalVideos - publicVideos
          },
          inquiries: {
            total: totalInquiries,
            new: newInquiries,
            responded: totalInquiries - newInquiries
          },
          revenue: {
            total: totalRevenue._sum.totalFee || 0,
            thisMonth: thisMonthRevenue._sum.totalFee || 0
          }
        },
        recentActivities: {
          enrollments: recentEnrollments.map(e => ({
            id: e.id,
            childName: `${e.child.firstName} ${e.child.lastName}`,
            programme: e.programmeLevel.name,
            status: e.status,
            createdAt: e.createdAt
          })),
          inquiries: recentInquiries
        },
        charts: {
          enrollmentTrend: trendData
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all enrollments with filtering and pagination
router.get('/enrollments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search, 
      dateFrom, 
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Add filters
    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { child: { firstName: { contains: search, mode: 'insensitive' } } },
        { child: { lastName: { contains: search, mode: 'insensitive' } } },
        { child: { parent: { firstName: { contains: search, mode: 'insensitive' } } } },
        { child: { parent: { lastName: { contains: search, mode: 'insensitive' } } } },
        { child: { parent: { email: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          child: {
            include: {
              parent: {
                select: { firstName: true, lastName: true, email: true, phone: true }
              }
            }
          },
          programmeLevel: { select: { name: true } },
          session: { select: { startDate: true, endDate: true, location: true } }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: parseInt(offset),
        take: parseInt(limit)
      }),
      prisma.enrollment.count({ where })
    ]);

    const formattedEnrollments = enrollments.map(e => ({
      id: e.id,
      enrollmentNumber: `KKS-${e.id.slice(0, 8).toUpperCase()}`,
      child: {
        name: `${e.child.firstName} ${e.child.lastName}`,
        age: e.child.age,
        gender: e.child.gender
      },
      parent: {
        name: `${e.child.parent.firstName} ${e.child.parent.lastName}`,
        email: e.child.parent.email,
        phone: e.child.parent.phone
      },
      programme: e.programmeLevel.name,
      session: {
        dates: `${e.session.startDate.toLocaleDateString()} - ${e.session.endDate.toLocaleDateString()}`,
        location: e.session.location
      },
      status: e.status,
      totalFee: e.totalFee,
      amountPaid: e.amountPaid,
      balanceDue: e.totalFee - e.amountPaid,
      createdAt: e.createdAt,
      preferredSchedule: e.preferredSchedule,
      transportNeeded: e.transportNeeded,
      lunchRequired: e.lunchRequired
    }));

    res.json({
      success: true,
      data: formattedEnrollments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update enrollment status
router.patch('/enrollments/:id', authenticateToken, requireAdmin, [
  body('status').isIn(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
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
    const { status, notes } = req.body;

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        status,
        notes,
        updatedAt: new Date()
      },
      include: {
        child: {
          include: {
            parent: { select: { firstName: true, lastName: true, email: true } }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Enrollment updated successfully',
      data: {
        id: enrollment.id,
        status: enrollment.status,
        childName: `${enrollment.child.firstName} ${enrollment.child.lastName}`,
        parentEmail: enrollment.child.parent.email
      }
    });

  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all contact inquiries
router.get('/inquiries', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority,
      inquiryType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (inquiryType && inquiryType !== 'all') where.inquiryType = inquiryType;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: parseInt(offset),
        take: parseInt(limit)
      }),
      prisma.contactInquiry.count({ where })
    ]);

    const formattedInquiries = inquiries.map(inquiry => ({
      ...inquiry,
      referenceNumber: `INQ-${inquiry.id.slice(0, 8).toUpperCase()}`
    }));

    res.json({
      success: true,
      data: formattedInquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Respond to inquiry
router.patch('/inquiries/:id/respond', authenticateToken, requireAdmin, [
  body('response').trim().isLength({ min: 10, max: 1000 })
    .withMessage('Response must be between 10-1000 characters')
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
    const { response } = req.body;

    const inquiry = await prisma.contactInquiry.update({
      where: { id },
      data: {
        response,
        status: 'RESPONDED',
        respondedAt: new Date(),
        responderId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: {
        id: inquiry.id,
        status: inquiry.status,
        respondedAt: inquiry.respondedAt
      }
    });

  } catch (error) {
    console.error('Error responding to inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export data (CSV format)
router.get('/export/:type', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { dateFrom, dateTo } = req.query;

    let data = [];
    let filename = '';
    let headers = [];

    switch (type) {
      case 'enrollments':
        const enrollments = await prisma.enrollment.findMany({
          where: dateFrom || dateTo ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) })
            }
          } : {},
          include: {
            child: {
              include: {
                parent: true
              }
            },
            programmeLevel: true,
            session: true
          }
        });

        headers = [
          'Enrollment Number', 'Child Name', 'Child Age', 'Parent Name', 
          'Parent Email', 'Parent Phone', 'Programme', 'Status', 'Total Fee', 
          'Amount Paid', 'Created Date'
        ];

        data = enrollments.map(e => [
          `KKS-${e.id.slice(0, 8).toUpperCase()}`,
          `${e.child.firstName} ${e.child.lastName}`,
          e.child.age,
          `${e.child.parent.firstName} ${e.child.parent.lastName}`,
          e.child.parent.email,
          e.child.parent.phone,
          e.programmeLevel.name,
          e.status,
          e.totalFee,
          e.amountPaid,
          e.createdAt.toISOString().split('T')[0]
        ]);

        filename = `enrollments_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'inquiries':
        const inquiries = await prisma.contactInquiry.findMany({
          where: dateFrom || dateTo ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) })
            }
          } : {}
        });

        headers = [
          'Reference Number', 'Name', 'Email', 'Phone', 'Subject', 
          'Inquiry Type', 'Status', 'Priority', 'Created Date'
        ];

        data = inquiries.map(i => [
          `INQ-${i.id.slice(0, 8).toUpperCase()}`,
          i.name,
          i.email,
          i.phone || '',
          i.subject || '',
          i.inquiryType,
          i.status,
          i.priority,
          i.createdAt.toISOString().split('T')[0]
        ]);

        filename = `inquiries_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // Create CSV content
    const csvContent = [headers, ...data]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =====================================================
// VIDEO MANAGEMENT ENDPOINTS
// =====================================================

// Get all videos with pagination, filtering, and search
router.get('/videos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const status = req.query.status || 'ACTIVE';
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'uploadedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    // Build where clause
    const where = {
      status: status === 'all' ? undefined : status,
      category: category === 'all' ? undefined : category,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Remove undefined values
    Object.keys(where).forEach(key => where[key] === undefined && delete where[key]);

    const [videos, totalCount] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          uploader: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.video.count({ where })
    ]);

    // Add full URL to each video
    const videosWithUrls = videos.map(video => ({
      ...video,
      url: `/uploads/videos/${video.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${video.filename.replace(/\.[^/.]+$/, '.jpg')}`
    }));

    res.json({
      success: true,
      data: {
        videos: videosWithUrls,
        pagination: {
          current: page,
          pages: Math.ceil(totalCount / limit),
          total: totalCount,
          limit,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        filters: {
          category,
          status,
          search,
          sortBy,
          sortOrder
        }
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

// Get video by ID
router.get('/videos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const videoWithUrl = {
      ...video,
      url: `/uploads/videos/${video.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${video.filename.replace(/\.[^/.]+$/, '.jpg')}`
    };

    res.json({
      success: true,
      data: videoWithUrl
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

// Update video details
router.put('/videos/:id', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('category').isIn(['HOUSE_CLEANING', 'PET_CARE', 'SHOE_CARE', 'TABLE_SETTING', 'GENERAL', 'EDUCATIONAL']).withMessage('Invalid category'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'DELETED']).withMessage('Invalid status')
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

    const { title, description, category, isPublic, isFeatured, status } = req.body;

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id: req.params.id }
    });

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Update video
    const updatedVideo = await prisma.video.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        category,
        isPublic,
        isFeatured,
        status,
        updatedAt: new Date()
      },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    const videoWithUrl = {
      ...updatedVideo,
      url: `/uploads/videos/${updatedVideo.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${updatedVideo.filename.replace(/\.[^/.]+$/, '.jpg')}`
    };

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: videoWithUrl
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Toggle featured status (dedicated endpoint for quick toggle)
router.patch('/videos/:id/featured', authenticateToken, requireAdmin, [
  body('isFeatured').isBoolean().withMessage('isFeatured must be a boolean')
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

    const { isFeatured } = req.body;

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id: req.params.id }
    });

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Update only the featured status
    const updatedVideo = await prisma.video.update({
      where: { id: req.params.id },
      data: {
        isFeatured,
        updatedAt: new Date()
      },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    const videoWithUrl = {
      ...updatedVideo,
      url: `/uploads/videos/${updatedVideo.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${updatedVideo.filename.replace(/\.[^/.]+$/, '.jpg')}`
    };

    res.json({
      success: true,
      message: 'Featured status updated successfully',
      data: videoWithUrl
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update featured status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete video (soft delete by default)
router.delete('/videos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const hardDelete = req.query.hard === 'true';

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id: req.params.id }
    });

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (hardDelete) {
      // Hard delete - remove from database and filesystem
      const fs = await import('fs/promises');
      const path = await import('path');
      
      try {
        // Remove video file
        const videoPath = path.join(process.cwd(), 'uploads', 'videos', existingVideo.filename);
        await fs.unlink(videoPath);
        
        // Remove thumbnail if exists
        const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnails', existingVideo.filename.replace(/\.[^/.]+$/, '.jpg'));
        try {
          await fs.unlink(thumbnailPath);
        } catch (thumbError) {
          // Thumbnail might not exist, continue
        }
      } catch (fileError) {
        console.warn('Error deleting video files:', fileError);
        // Continue with database deletion even if file deletion fails
      }

      // Remove from database
      await prisma.video.delete({
        where: { id: req.params.id }
      });

      res.json({
        success: true,
        message: 'Video permanently deleted'
      });
    } else {
      // Soft delete - mark as deleted
      await prisma.video.update({
        where: { id: req.params.id },
        data: {
          status: 'DELETED',
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Video marked as deleted'
      });
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Bulk operations for videos
router.post('/videos/bulk', authenticateToken, requireAdmin, [
  body('action').isIn(['delete', 'activate', 'deactivate', 'feature', 'unfeature']).withMessage('Invalid action'),
  body('videoIds').isArray().withMessage('videoIds must be an array').notEmpty().withMessage('At least one video ID is required')
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

    const { action, videoIds } = req.body;

    let updateData = {};
    switch (action) {
      case 'delete':
        updateData = { status: 'DELETED' };
        break;
      case 'activate':
        updateData = { status: 'ACTIVE' };
        break;
      case 'deactivate':
        updateData = { status: 'INACTIVE' };
        break;
      case 'feature':
        updateData = { isFeatured: true };
        break;
      case 'unfeature':
        updateData = { isFeatured: false };
        break;
    }

    updateData.updatedAt = new Date();

    const result = await prisma.video.updateMany({
      where: {
        id: { in: videoIds }
      },
      data: updateData
    });

    res.json({
      success: true,
      message: `${result.count} videos updated successfully`,
      data: { updatedCount: result.count }
    });
  } catch (error) {
    console.error('Error performing bulk video operation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get video analytics
router.get('/videos/analytics/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalVideos,
      activeVideos,
      publicVideos,
      featuredVideos,
      videosByCategory,
      videosByUploadDate,
      topViewedVideos
    ] = await Promise.all([
      prisma.video.count(),
      prisma.video.count({ where: { status: 'ACTIVE' } }),
      prisma.video.count({ where: { isPublic: true } }),
      prisma.video.count({ where: { isFeatured: true } }),
      prisma.video.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      prisma.video.groupBy({
        by: ['uploadedAt'],
        _count: { uploadedAt: true },
        orderBy: { uploadedAt: 'desc' },
        take: 30
      }),
      prisma.video.findMany({
        select: {
          id: true,
          title: true,
          views: true,
          category: true,
          filename: true
        },
        orderBy: { views: 'desc' },
        take: 10
      })
    ]);

    // Calculate total file size
    const videoSizes = await prisma.video.aggregate({
      _sum: { fileSize: true }
    });

    res.json({
      success: true,
      data: {
        overview: {
          total: totalVideos,
          active: activeVideos,
          inactive: totalVideos - activeVideos,
          public: publicVideos,
          private: totalVideos - publicVideos,
          featured: featuredVideos,
          totalSize: videoSizes._sum.fileSize || 0
        },
        byCategory: videosByCategory.map(item => ({
          category: item.category,
          count: item._count.category
        })),
        uploadTrend: videosByUploadDate.map(item => ({
          date: item.uploadedAt,
          count: item._count.uploadedAt
        })),
        topViewed: topViewedVideos.map(video => ({
          ...video,
          url: `/uploads/videos/${video.filename}`
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching video analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload new video
router.post('/videos/upload', authenticateToken, requireAdmin, uploadVideo, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('category').isIn(['HOUSE_CLEANING', 'PET_CARE', 'SHOE_CARE', 'TABLE_SETTING', 'GENERAL', 'EDUCATIONAL']).withMessage('Invalid category'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        const fs = await import('fs/promises');
        try {
          await fs.unlink(req.file.path);
        } catch (err) {
          console.warn('Error deleting uploaded file:', err);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required'
      });
    }

    const { title, description, category, isPublic = true, isFeatured = false } = req.body;

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        title,
        description: description || '',
        category,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        isPublic: Boolean(isPublic),
        isFeatured: Boolean(isFeatured),
        uploaderId: req.user.id,
        status: 'ACTIVE'
      },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    const videoWithUrl = {
      ...video,
      url: `/uploads/videos/${video.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${video.filename.replace(/\.[^/.]+$/, '.jpg')}`
    };

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: videoWithUrl
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    
    // Delete uploaded file if database operation fails
    if (req.file) {
      const fs = await import('fs/promises');
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.warn('Error deleting uploaded file:', err);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =====================================================
// IMAGE MANAGEMENT ENDPOINTS
// =====================================================

// Get all images with pagination and filtering
router.get('/images', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const status = req.query.status || 'ACTIVE';
    const search = req.query.search;

    // Build where clause
    const where = {
      status: status === 'all' ? undefined : status,
      category: category === 'all' ? undefined : category,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Remove undefined values
    Object.keys(where).forEach(key => where[key] === undefined && delete where[key]);

    const [images, totalCount] = await Promise.all([
      prisma.image.findMany({
        where,
        include: {
          uploader: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { uploadedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.image.count({ where })
    ]);

    // Add full URL to each image
    const imagesWithUrls = images.map(image => ({
      ...image,
      url: `/uploads/images/${image.filename}`
    }));

    res.json({
      success: true,
      data: {
        images: imagesWithUrls,
        pagination: {
          current: page,
          pages: Math.ceil(totalCount / limit),
          total: totalCount,
          limit,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload new image
router.post('/images/upload', authenticateToken, requireAdmin, uploadImage, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('category').isIn(['ACTIVITIES', 'LEARNING', 'DINING', 'TABLE_SETTING', 'FACILITIES', 'GENERAL']).withMessage('Invalid category'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        const fs = await import('fs/promises');
        try {
          await fs.unlink(req.file.path);
        } catch (err) {
          console.warn('Error deleting uploaded file:', err);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    const { title, description, category, isPublic = true, isFeatured = false } = req.body;

    // Get image dimensions using Sharp (if available)
    let width, height;
    try {
      const sharp = await import('sharp');
      const metadata = await sharp.default(req.file.path).metadata();
      width = metadata.width;
      height = metadata.height;
    } catch (err) {
      console.warn('Could not get image dimensions:', err);
    }

    // Create image record in database
    const image = await prisma.image.create({
      data: {
        title,
        description: description || '',
        category,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        width,
        height,
        isPublic: Boolean(isPublic),
        isFeatured: Boolean(isFeatured),
        uploaderId: req.user.id,
        status: 'ACTIVE'
      },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    const imageWithUrl = {
      ...image,
      url: `/uploads/images/${image.filename}`
    };

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: imageWithUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Delete uploaded file if database operation fails
    if (req.file) {
      const fs = await import('fs/promises');
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.warn('Error deleting uploaded file:', err);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single image by ID
router.get('/images/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.image.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Add full URL
    const imageWithUrl = {
      ...image,
      url: `/uploads/images/${image.filename}`
    };

    res.json({
      success: true,
      data: imageWithUrl
    });

  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update image
router.patch('/images/:id', authenticateToken, requireAdmin, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('category').optional().isIn(['ACTIVITIES', 'LEARNING', 'DINING', 'TABLE_SETTING', 'FACILITIES', 'GENERAL']).withMessage('Invalid category'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  body('featured').optional().isBoolean().withMessage('featured must be a boolean') // Support both naming conventions
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
    const updateData = { ...req.body };

    // Handle both 'featured' and 'isFeatured' for consistency
    if ('featured' in updateData) {
      updateData.isFeatured = updateData.featured;
      delete updateData.featured;
    }

    const image = await prisma.image.update({
      where: { id },
      data: updateData,
      include: {
        uploader: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    });

    // Add full URL
    const imageWithUrl = {
      ...image,
      url: `/uploads/images/${image.filename}`
    };

    res.json({
      success: true,
      data: imageWithUrl,
      message: 'Image updated successfully'
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    console.error('Error updating image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete image
router.delete('/images/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // First get the image to find the file path
    const image = await prisma.image.findUnique({
      where: { id }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete the image record from database
    await prisma.image.delete({
      where: { id }
    });

    // Delete the file from filesystem
    try {
      const fs = await import('fs/promises');
      const filePath = path.join(process.cwd(), 'uploads', 'images', image.filename);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Error deleting image file:', fileError);
      // Continue even if file deletion fails
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// VIDEO MANAGEMENT ENDPOINTS FOR FEATURED VIDEOS
// =============================================

import fs from 'fs/promises';
import fsSync from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Helper function to get video info from database
const getVideoFromDatabase = async (videoId) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    });
    return video;
  } catch (error) {
    console.error('Error getting video from database:', error);
    return null;
  }
};

// POST /api/admin/videos/:id/make-featured
// Copy a video to the featured videos folder
router.post('/videos/:id/make-featured', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const videoId = req.params.id;
    console.log(`📝 Making video featured: ${videoId}`);
    
    // Get video info from database
    const video = await getVideoFromDatabase(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    // Copy video to featured folder
    const copied = await copyVideoToFeatured(video.filename);
    if (!copied) {
      return res.status(500).json({
        success: false,
        message: 'Failed to copy video to featured folder'
      });
    }
    
    res.json({
      success: true,
      message: 'Video copied to featured folder',
      filename: video.filename
    });
    
  } catch (error) {
    console.error('❌ Make featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make video featured',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/admin/featured-videos
// Add or remove videos from featured.json manifest
router.post('/featured-videos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { action, video, videoId } = req.body;
    console.log(`📝 Featured videos action: ${action}`);
    
    // Read current featured videos
    const featuredData = await readFeaturedVideos();
    
    if (action === 'add') {
      // Limit to 3 featured videos
      if (featuredData.featured.length >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum of 3 featured videos allowed'
        });
      }
      
      // Check if already featured
      const exists = featuredData.featured.find(fv => fv.id === video.id);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Video is already featured'
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
      
    } else if (action === 'remove') {
      // Remove from featured
      const index = featuredData.featured.findIndex(fv => fv.id === videoId);
      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: 'Video not found in featured list'
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
        message: 'Failed to update featured videos list'
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
      message: 'Failed to manage featured videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin/featured-videos
// Get current featured videos list
router.get('/featured-videos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const featuredData = await readFeaturedVideos();
    
    res.json({
      success: true,
      data: featuredData.featured
    });
    
  } catch (error) {
    console.error('❌ Get featured videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin/videos/status
// Get status of all videos (featured vs gallery)
router.get('/videos/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const featuredData = await readFeaturedVideos();
    
    // Get all videos from database
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const videoStatus = videos.map(video => ({
      id: video.id,
      title: video.title,
      filename: video.filename,
      size: video.fileSize,
      uploadedAt: video.createdAt,
      isFeatured: featuredData.featured.some(fv => fv.id === video.id),
      category: video.category,
      views: video.views
    }));
    
    res.json({
      success: true,
      data: {
        total: videoStatus.length,
        featured: featuredData.featured.length,
        gallery: videoStatus.length - featuredData.featured.length,
        videos: videoStatus
      }
    });
    
  } catch (error) {
    console.error('❌ Get video status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get video status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;