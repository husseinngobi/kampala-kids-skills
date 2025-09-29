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
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import galleryRoutes from './routes/gallery.js';

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

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
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

// Apply rate limiting to all requests
app.use(limiter);

// Serve uploaded files with proper headers for mobile compatibility
app.use('/uploads', (req, res, next) => {
  // Add mobile-friendly headers
  res.set({
    'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    'Access-Control-Allow-Origin': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });
  next();
}, express.static(path.join(process.cwd(), 'uploads')));

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
app.use('/api/gallery', galleryRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Serve admin dashboard static files (we'll create this later)
app.use('/admin', express.static(path.join(__dirname, '../admin-dashboard')));

// Catch-all for admin dashboard SPA
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-dashboard/index.html'));
});

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