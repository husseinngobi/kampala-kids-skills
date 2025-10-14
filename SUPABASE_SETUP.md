# 🚀 Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "Create a new project"
3. Choose organization and project name: `kampala-kids-skills`
4. Select region closest to you (EU for Uganda)
5. Create a strong database password and save it

## Step 2: Get Your Credentials

After project creation, go to Settings > API:

1. **Project URL** - Copy this
2. **anon/public key** - Copy this
3. **service_role key** - Copy this (keep secret!)

## Step 3: Update Environment Variables

Update your `backend/.env` file:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

## Step 4: Create Database Tables

In Supabase Dashboard > SQL Editor, run this:

```sql
-- Note: auth.users table already has RLS enabled by Supabase
-- We only need to create our custom tables

-- Create custom tables
CREATE TABLE public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'GENERAL',
  featured BOOLEAN DEFAULT false,
  duration INTEGER, -- seconds
  file_size BIGINT,
  mime_type TEXT,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  programme_level TEXT NOT NULL,
  special_requirements TEXT,
  emergency_contact TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'NEW',
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
```

## Step 5: Setup Storage

1. Go to Storage in Supabase Dashboard
2. Create bucket: `videos` (public)
3. Create bucket: `images` (public)

## Step 6: Setup Row Level Security Policies

```sql
-- Allow public read access to videos
CREATE POLICY "Public videos are viewable by everyone" ON public.videos
FOR SELECT USING (status = 'ACTIVE');

-- Allow public read access to published content
CREATE POLICY "Public read access" ON public.videos
FOR SELECT USING (true);

-- Only authenticated users can modify (admin users)
CREATE POLICY "Admin can manage videos" ON public.videos
FOR ALL USING (auth.role() = 'authenticated');

-- Similar policies for other tables...
```

## Benefits of This Setup

✅ **No Admin Conflicts** - Clean separation of concerns
✅ **Professional UI** - Supabase provides beautiful admin interface
✅ **File Management** - Built-in video/image uploads with CDN
✅ **Real-time Updates** - Changes sync automatically
✅ **Scalable** - Handles growth from day 1
✅ **Secure** - Row Level Security built-in
✅ **Fast** - Global CDN for media files
✅ **Free Tier** - Up to 500MB storage, 2GB bandwidth/month

## Next Steps

1. Complete Supabase setup above
2. Update .env with your credentials  
3. Test the clean backend API
4. Restore video gallery functionality

## Admin Access

- **Supabase Dashboard**
- **Admin Panel**: All video uploads, student management, etc. through Supabase
- **Backend**: Pure API - no more frontend conflicts
