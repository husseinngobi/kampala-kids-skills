# Kampala Kids Skills - AI Agent Instructions

## 🏗️ Architecture Overview

This is a **full-stack educational platform** with React frontend and Express.js backend, migrated from Prisma to **Supabase** for video storage and database.

### Key System Boundaries
- **Frontend**: React + TypeScript + Vite (port 8081) using Shadcn UI components
- **Backend**: Express.js + ES modules (port 5000) with Supabase integration  
- **Storage**: Supabase for videos/images, PostgreSQL database
- **Rate Limiting**: Multi-layer protection against infinite API loops

## 🚨 Critical Anti-Infinite Loop Patterns

**NEVER modify these components without rate limiting:**
- Any component making API calls must implement request deduplication
- Use `SafeVideoGallery.tsx` pattern: global request tracking with `requestHistory` Map
- Backend routes use IP-based rate limiting (10 req/min) in `gallery-supabase.js`
- Frontend components limit to 3 requests/minute with 20-second cooldowns

```tsx
// Required pattern for API components
const requestHistory = new Map<string, number[]>();
const activeRequests = new Set<string>();
```

## 🎬 Video Gallery System Architecture

The gallery system has **three implementations** - use the correct one:
1. **SafeVideoGallery.tsx** - Production component with rate limiting (use this)
2. **EnhancedGalleryPage.tsx** - Full gallery page with search/filters
3. **Gallery.tsx** - DISABLED (causes infinite loops)

### Video Data Flow
```
Supabase Storage → backend/routes/gallery-supabase.js → frontend API calls → SafeVideoGallery
```

Key files:
- `backend/src/routes/gallery-supabase.js` - Main API endpoint `/api/gallery/media`
- `frontend/src/components/SafeVideoGallery.tsx` - Safe gallery component
- `frontend/src/pages/EnhancedGalleryPage.tsx` - Full gallery with filters

## 🛠️ Development Workflows

### Starting the Application
```bash
# Root directory - starts both frontend and backend
npm run dev  # Frontend: localhost:8081, Backend: localhost:5000

# Individual components
npm run dev:frontend  # Vite dev server
npm run dev:backend   # Express with nodemon
```

### Critical Environment Setup
- Backend requires `.env` with `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Frontend uses `VITE_API_BASE_URL=http://localhost:5000`
- PowerShell-specific scripts in `package.json` (Windows environment)

## 📁 Project-Specific Conventions

### Component Architecture
- **Temporary Components**: `Temp*Block.tsx` components replace problematic ones
- **UI Components**: All use Shadcn UI from `@/components/ui/`
- **Page Components**: React Router pages in `src/pages/`
- **Safe Patterns**: Always use TypeScript interfaces for API responses

### API Patterns
```javascript
// Backend route pattern with rate limiting
const requestHistory = new Map();
const MAX_REQUESTS_PER_MINUTE = 10;

router.get('/endpoint', async (req, res) => {
  // IP-based rate limiting logic
  const clientIP = req.ip || req.connection.remoteAddress;
  // ... rate limiting implementation
});
```

### Data Models
```typescript
// Standard video interface
interface VideoItem {
  id: string;
  title: string;
  url: string;        // Supabase storage URL
  videoUrl: string;   // Same as url
  isFeatured: boolean;
  category: string;
  views: number;
}
```

## 🔗 Integration Points

### Supabase Integration
- **Videos Table**: `select * from videos` via Supabase client
- **Storage**: Public bucket `videos` for MP4 files
- **Featured Videos**: `isFeatured: true` flag determines homepage display
- **Categories**: ENUM values (HOUSE_CLEANING, PET_CARE, SHOE_CARE, etc.)

### Critical Dependencies
- `@supabase/supabase-js` - Database and storage client
- `@tanstack/react-query` - Frontend state management
- `express-rate-limit` - Backend API protection
- `shadcn/ui` - UI component system

## 🚀 Deployment Notes

- **Concurrently**: Root package.json uses `concurrently` to run both apps
- **Build Process**: Separate frontend/backend builds with `npm run build`
- **Production**: Uses `npm run start` with vite preview + express server
- **Health Check**: `health-check.js` validates both services

## ⚠️ Common Pitfalls

1. **Never bypass rate limiting** - causes infinite loops that crash the app
2. **Always use absolute imports** - `@/components/ui/button` not relative paths  
3. **Check for disabled components** - Some components are intentionally blocked
4. **Supabase vs Prisma** - This project migrated to Supabase, old Prisma code may exist but is unused
5. **Port conflicts** - Backend (5000) and Frontend (8081) must not conflict