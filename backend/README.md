# Children's Life Skills Programme - Backend API

A comprehensive Node.js backend API for managing the Children's Life Skills Holiday Programme in Kampala, Uganda.

## Features

- 🔐 **Authentication & Authorization**: JWT-based admin authentication
- 📝 **Enrollment Management**: Complete parent/child registration system
- 📹 **Video Management**: Upload, organize, and stream educational videos
- 📞 **Contact System**: Handle inquiries, feedback, and testimonials
- 📊 **Admin Dashboard**: Full admin interface with statistics and reports
- 🔄 **Database Management**: SQLite with Prisma ORM
- 🛡️ **Security**: Rate limiting, CORS, helmet security headers
- 📱 **Mobile Optimized**: API designed for mobile-first frontend

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Uploads**: Multer for video file handling
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Custom request logging middleware

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
  bash
   npm install
2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize the database**:

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

### Initial Admin Access

After seeding the database:

- **Email**: `admin@kampala-kids-skills.com`
- **Password**: `admin123`
- **Admin Dashboard**: `http://localhost:5000/admin`

## API Endpoints

### Public Endpoints

- `GET /api/public/videos` - Get public videos
- `GET /api/public/programme-levels` - Get programme levels
- `GET /api/public/sessions` - Get upcoming sessions
- `GET /api/public/stats` - Get public statistics
- `POST /api/public/contact` - Submit contact form

### Enrollment Endpoints

- `POST /api/enrollments` - Create new enrollment
- `POST /api/enrollments/check-status` - Check enrollment status
- `GET /api/enrollments/programme-levels` - Get available levels
- `GET /api/enrollments/sessions` - Get available sessions

### Contact Endpoints

- `POST /api/contact` - Submit contact inquiry
- `GET /api/contact/status/:referenceNumber` - Check inquiry status
- `GET /api/contact/faq` - Get FAQ data
- `POST /api/contact/feedback` - Submit feedback
- `GET /api/contact/testimonials` - Get public testimonials

### Admin Endpoints (Authentication Required)

- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/enrollments` - Manage enrollments
- `PATCH /api/admin/enrollments/:id` - Update enrollment
- `GET /api/admin/inquiries` - Manage inquiries
- `PATCH /api/admin/inquiries/:id/respond` - Respond to inquiry
- `GET /api/admin/export/:type` - Export data (CSV)

### Video Management (Admin)

- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get single video
- `POST /api/videos/upload` - Upload new video
- `PUT /api/videos/:id` - Update video details
- `DELETE /api/videos/:id` - Delete video
- `GET /api/videos/stats/categories` - Get video categories

## Database Schema

### Core Models

- **Parent**: Parent information and authentication
- **Child**: Child profiles linked to parents
- **Enrollment**: Programme enrollments with status tracking
- **ProgrammeLevel**: Different age-based programme levels
- **ProgrammeSession**: Scheduled programme sessions
- **Video**: Educational video content management
- **ContactInquiry**: Contact form submissions
- **Feedback**: User feedback and testimonials
- **Admin**: Admin user management

## File Structure

```text
backend/
├── src/
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js        # JWT authentication
│   │   ├── errorHandler.js # Global error handling
│   │   ├── logger.js      # Request logging
│   │   └── upload.js      # File upload handling
│   ├── routes/            # API route handlers
│   │   ├── admin.js       # Admin management
│   │   ├── contact.js     # Contact & feedback
│   │   ├── enrollments.js # Enrollment handling
│   │   ├── public.js      # Public endpoints
│   │   └── videos.js      # Video management
│   └── index.js           # Main server file
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js           # Database seeding
├── uploads/               # File storage (videos)
├── .env                  # Environment variables
└── package.json
```

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Open database studio
npm run db:studio

# Seed with sample data
npm run db:seed

# Reset database (development only)
npm run db:reset
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:8080` |
| `MAX_FILE_SIZE` | Max upload size in bytes | `104857600` (100MB) |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | `15` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Security Features

- **JWT Authentication**: Secure admin access with token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse with configurable limits
- **CORS Protection**: Configured for specific frontend origins
- **Helmet Security**: Security headers for protection
- **Input Validation**: Comprehensive validation with express-validator
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Database Studio

Open Prisma Studio to browse and edit data:

```bash
npm run db:studio
```

## Production Deployment

1. **Environment Setup**:
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure proper `DATABASE_URL`
   - Set up SMTP for email notifications

2. **Database Migration**:

   ```bash
   npm run db:deploy
   ```

3. **Process Management**:
   Use PM2 or similar process manager:

   ```bash
   npm install -g pm2
   pm2 start src/index.js --name kampala-kids-api
   ```

## API Documentation

Once running, visit `http://localhost:5000/admin/api-docs` for interactive API documentation.

## Support

For issues and questions:

- Check the logs: Server logs are output to console
- Database Studio: Use `npm run db:studio` for database inspection
- Environment: Verify all environment variables are set correctly

## License

Private - Children's Life Skills Programme, Kampala
