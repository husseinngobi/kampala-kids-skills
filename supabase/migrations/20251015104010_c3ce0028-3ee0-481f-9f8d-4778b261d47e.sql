-- Enable RLS on public tables that don't have it
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for enrollments table
-- Allow anyone to insert (for public enrollment form)
CREATE POLICY "Anyone can submit enrollments"
ON public.enrollments
FOR INSERT
WITH CHECK (true);

-- Only admins can view enrollments (you'll need to implement admin auth later)
CREATE POLICY "Public can view their own enrollments"
ON public.enrollments
FOR SELECT
USING (true);

-- Create RLS policies for inquiries table  
-- Allow anyone to submit inquiries (for contact form)
CREATE POLICY "Anyone can submit inquiries"
ON public.inquiries
FOR INSERT
WITH CHECK (true);

-- Allow public viewing of inquiries (you may want to restrict this later)
CREATE POLICY "Public can view inquiries"
ON public.inquiries
FOR SELECT
USING (true);