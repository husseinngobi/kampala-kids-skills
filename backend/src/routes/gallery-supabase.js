import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Rate limiting protection against infinite loops
const requestHistory = new Map();
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get media/videos from Supabase
router.get('/media', async (req, res) => {
  console.log('📹 Supabase gallery endpoint called');
  
  // Rate limiting check
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const history = requestHistory.get(clientIP) || [];
  
  // Remove old requests outside the window
  const recentRequests = history.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    console.warn(`🚫 Rate limit exceeded for IP: ${clientIP}. Requests in last minute: ${recentRequests.length}`);
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait before making more requests.',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
    });
  }
  
  // Update request history
  recentRequests.push(now);
  requestHistory.set(clientIP, recentRequests);
  console.log(`📊 Request count for IP ${clientIP}: ${recentRequests.length}/${MAX_REQUESTS_PER_MINUTE}`);
  
  try {
    const { featured, limit = 20, type } = req.query;
    
    // Build the query
    let query = supabase
      .from('videos')
      .select('*')
      .eq('status', 'ACTIVE');
    
    // Filter by featured if requested
    if (featured === 'true') {
      query = query.eq('featured', true);
    }
    
    // Filter by type (for future expansion - images, documents, etc.)
    if (type === 'videos') {
      // Already filtering videos table, no need to add extra filter
    }
    
    // Apply limit
    if (limit && !isNaN(limit)) {
      query = query.limit(parseInt(limit));
    }
    
    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });
    
    const { data: videos, error } = await query;
    
    if (error) {
      console.error('❌ Supabase query error:', error);
      return res.status(500).json({
        success: false,
        error: 'Database query failed',
        details: error.message
      });
    }
    
    // Format videos for frontend compatibility
    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      filename: video.filename,
      // Use Supabase Storage URLs (updated during upload)
      url: video.url,
      videoUrl: video.url,
      type: 'video',
      isFeatured: video.featured,
      category: video.category,
      views: video.views || 0,
      duration: video.duration,
      fileSize: video.file_size,
      mimeType: video.mime_type,
      createdAt: video.created_at,
      updatedAt: video.updated_at
    }));
    
    console.log(`✅ Successfully fetched ${formattedVideos.length} videos from Supabase`);
    
    res.json({
      success: true,
      data: formattedVideos,
      count: formattedVideos.length,
      source: 'supabase'
    });
    
  } catch (error) {
    console.error('❌ Gallery endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get single video by ID
router.get('/media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('status', 'ACTIVE')
      .single();
    
    if (error || !video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }
    
    // Format single video
    const formattedVideo = {
      id: video.id,
      title: video.title,
      description: video.description,
      filename: video.filename,
      url: video.url,
      videoUrl: video.url,
      type: 'video',
      isFeatured: video.featured,
      category: video.category,
      views: video.views || 0,
      duration: video.duration,
      fileSize: video.file_size,
      mimeType: video.mime_type,
      createdAt: video.created_at,
      updatedAt: video.updated_at
    };
    
    res.json({
      success: true,
      data: formattedVideo
    });
    
  } catch (error) {
    console.error('❌ Single video fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Track video view
router.post('/media/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Increment view count
    const { error } = await supabase
      .from('videos')
      .update({ 
        views: supabase.raw('views + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error updating view count:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update view count'
      });
    }
    
    res.json({
      success: true,
      message: 'View count updated'
    });
    
  } catch (error) {
    console.error('❌ View tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;