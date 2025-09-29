import express from 'express';
import { prisma } from '../index.js';
import path from 'path';

const router = express.Router();

// Helper function to generate absolute URLs
const getBaseUrl = (req) => {
  const protocol = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};

// Helper function to generate media URL
const generateMediaUrl = (req, type, filename) => {
  const baseUrl = getBaseUrl(req);
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Test endpoint for debugging media URLs
router.get('/test', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    res.json({
      success: true,
      debug: {
        protocol: req.protocol,
        host: req.get('host'),
        baseUrl: baseUrl,
        sampleImageUrl: generateMediaUrl(req, 'images', 'children-learning-1.jpg'),
        sampleVideoUrl: generateMediaUrl(req, 'videos', 'house-cleaning.mp4')
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get public gallery content (videos and images)
router.get('/media', async (req, res) => {
  try {
    const { category, type = 'all', featured, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const where = {
      isPublic: true,
      status: 'ACTIVE'
    };

    if (category && category !== 'all') {
      where.category = category.toUpperCase();
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Get videos
    let videos = [];
    if (type === 'all' || type === 'videos') {
      videos = await prisma.video.findMany({
        where,
        orderBy: [
          { isFeatured: 'desc' },
          { views: 'desc' },
          { uploadedAt: 'desc' }
        ],
        skip: parseInt(offset),
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          filename: true,
          duration: true,
          views: true,
          isFeatured: true,
          uploadedAt: true
        }
      });

      // Format video data
      videos = videos.map(video => ({
        ...video,
        type: 'video',
        url: generateMediaUrl(req, 'videos', video.filename),
        thumbnail: generateMediaUrl(req, 'thumbnails', `${video.id}.jpg`), // We'll generate these later
        mediaType: 'video'
      }));
    }

    // Get images (when we implement the Image model)
    let images = [];
    if (type === 'all' || type === 'images') {
      images = await prisma.image.findMany({
        where,
        orderBy: [
          { isFeatured: 'desc' },
          { views: 'desc' },
          { uploadedAt: 'desc' }
        ],
        skip: parseInt(offset),
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          filename: true,
          width: true,
          height: true,
          views: true,
          isFeatured: true,
          uploadedAt: true
        }
      });

      // Format image data
      images = images.map(image => ({
        ...image,
        type: 'image',
        url: generateMediaUrl(req, 'images', image.filename),
        thumbnail: generateMediaUrl(req, 'images', image.filename), // Same as main image for images
        mediaType: 'image'
      }));
    }

    // Combine and sort media
    const allMedia = [...videos, ...images].sort((a, b) => {
      // Featured items first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      // Then by views (popularity)
      if (a.views !== b.views) return b.views - a.views;
      // Finally by upload date
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    });

    res.json({
      success: true,
      data: allMedia,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allMedia.length,
        totalPages: Math.ceil(allMedia.length / limit)
      },
      categories: await getAvailableCategories()
    });

  } catch (error) {
    console.error('Error fetching gallery media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery content'
    });
  }
});

// Get featured content for homepage
router.get('/featured', async (req, res) => {
  try {
    const { limit = 3, type } = req.query;

    // If type is specified as 'video', only return videos
    if (type === 'video') {
      const featuredVideos = await prisma.video.findMany({
        where: {
          isPublic: true,
          status: 'ACTIVE',
          isFeatured: true
        },
        orderBy: [
          { views: 'desc' },
          { uploadedAt: 'desc' }
        ],
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          filename: true,
          duration: true,
          views: true,
          uploadedAt: true
        }
      });

      const formattedVideos = featuredVideos.map(video => ({
        ...video,
        type: 'video',
        url: generateMediaUrl(req, 'videos', video.filename),
        thumbnail: generateMediaUrl(req, 'thumbnails', `${video.id}.jpg`),
        mediaType: 'video'
      }));

      return res.json({
        success: true,
        data: formattedVideos
      });
    }

    const [featuredVideos, featuredImages] = await Promise.all([
      prisma.video.findMany({
        where: {
          isPublic: true,
          status: 'ACTIVE',
          isFeatured: true
        },
        orderBy: [
          { views: 'desc' },
          { uploadedAt: 'desc' }
        ],
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          filename: true,
          duration: true,
          views: true,
          uploadedAt: true
        }
      }),
      prisma.image.findMany({
        where: {
          isPublic: true,
          status: 'ACTIVE',
          isFeatured: true
        },
        orderBy: [
          { views: 'desc' },
          { uploadedAt: 'desc' }
        ],
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          filename: true,
          views: true,
          uploadedAt: true
        }
      })
    ]);

    const formattedVideos = featuredVideos.map(video => ({
      ...video,
      type: 'video',
      url: generateMediaUrl(req, 'videos', video.filename),
      thumbnail: generateMediaUrl(req, 'thumbnails', `${video.id}.jpg`),
      mediaType: 'video'
    }));

    const formattedImages = featuredImages.map(image => ({
      ...image,
      type: 'image',
      url: generateMediaUrl(req, 'images', image.filename),
      thumbnail: generateMediaUrl(req, 'images', image.filename),
      mediaType: 'image'
    }));

    // Combine and sort by views and date
    const allMedia = [...formattedVideos, ...formattedImages]
      .sort((a, b) => {
        if (a.views !== b.views) return b.views - a.views;
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      })
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: allMedia
    });

  } catch (error) {
    console.error('Error fetching featured content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured content'
    });
  }
});

// Get single media item details
router.get('/media/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find video first
    let media = await prisma.video.findFirst({
      where: {
        id,
        isPublic: true,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        filename: true,
        duration: true,
        views: true,
        isFeatured: true,
        uploadedAt: true
      }
    });

    if (media) {
      // Increment view count for video
      await prisma.video.update({
        where: { id },
        data: { views: { increment: 1 } }
      });

      return res.json({
        success: true,
        data: {
          ...media,
          type: 'video',
          url: `/uploads/videos/${media.filename}`,
          thumbnail: `/uploads/thumbnails/${media.id}.jpg`,
          mediaType: 'video'
        }
      });
    }

    // If not found in videos, try images
    media = await prisma.image.findFirst({
      where: {
        id,
        isPublic: true,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        filename: true,
        views: true,
        isFeatured: true,
        uploadedAt: true
      }
    });

    if (media) {
      // Increment view count for image
      await prisma.image.update({
        where: { id },
        data: { views: { increment: 1 } }
      });

      return res.json({
        success: true,
        data: {
          ...media,
          type: 'image',
          url: `/uploads/images/${media.filename}`,
          thumbnail: `/uploads/images/${media.filename}`,
          mediaType: 'image'
        }
      });
    }

    // Not found in either collection
    return res.status(404).json({
      success: false,
      message: 'Media not found'
    });

  } catch (error) {
    console.error('Error fetching media details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media details'
    });
  }
});

// Get available categories
async function getAvailableCategories() {
  try {
    const [videoCategories, imageCategories] = await Promise.all([
      prisma.video.findMany({
        where: {
          isPublic: true,
          status: 'ACTIVE'
        },
        select: {
          category: true
        },
        distinct: ['category']
      }),
      prisma.image.findMany({
        where: {
          isPublic: true,
          status: 'ACTIVE'
        },
        select: {
          category: true
        },
        distinct: ['category']
      })
    ]);

    const allCategories = [
      ...videoCategories.map(v => ({
        value: v.category,
        label: formatCategoryName(v.category),
        type: 'video'
      })),
      ...imageCategories.map(i => ({
        value: i.category,
        label: formatCategoryName(i.category),
        type: 'image'
      }))
    ];

    // Remove duplicates and sort
    const uniqueCategories = allCategories.reduce((acc, current) => {
      const existing = acc.find(item => item.value === current.value);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueCategories.sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Helper function to format category names
function formatCategoryName(category) {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export default router;