import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import enrollmentRoutes from './routes/enrollments.js';
import videoRoutes from './routes/videos.js';
import contactRoutes from './routes/contact.js';
import publicRoutes from './routes/public.js';
import galleryRoutes from './routes/gallery.js';
import gallerySimpleRoutes from './routes/gallery-simple.js';
import gallerySupabaseRoutes from './routes/gallery-supabase.js'; // New Supabase-powered gallery
import settingsRoutes from './routes/settings.js';
// Note: Admin routes removed - functionality moved to Supabase Dashboard

// Middleware imports
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';

// Database
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Rate limiting - more permissive during development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 5 * 60 * 1000, // 5 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // limit each IP to 500 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    'http://localhost:3000', // for development
    'http://localhost:8081', // Vite dev server
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8081'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use(requestLogger);

// Serve uploaded files BEFORE rate limiting (videos/images should not be rate limited)
app.use('/uploads', (req, res, next) => {
  // Add mobile-friendly headers
  res.set({
    'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    'Access-Control-Allow-Origin': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Accept-Ranges': 'bytes' // Enable range requests for video streaming
  });
  
  // Set proper content type for video files
  if (req.path.includes('/videos/')) {
    res.set('Content-Type', 'video/mp4');
  }
  
  next();
}, express.static(path.join(process.cwd(), 'uploads')));

// Apply rate limiting to API routes only (after static files) - but EXCLUDE gallery routes
app.use('/api', (req, res, next) => {
  // Skip rate limiting for gallery endpoints temporarily
  if (req.path.includes('/gallery') || req.path.includes('/media')) {
    return next();
  }
  return limiter(req, res, next);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/public', publicRoutes);
app.use('/api/gallery', gallerySupabaseRoutes); // Now using Supabase-powered gallery!
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);

// Note: Admin functionality moved to Supabase Dashboard
// No more conflicting admin routes or static file serving

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Server running on http://localhost:${PORT}
📊 Admin Dashboard: http://localhost:${PORT}/admin
🗄️  Database Studio: Run 'npm run db:studio' to open Prisma Studio
📝 API Documentation: http://localhost:${PORT}/admin/api-docs
🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

export default app;