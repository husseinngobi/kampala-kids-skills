import { useState, useEffect } from 'react';

interface FeaturedVideo {
  id: string;
  title: string;
  description: string;
  filename: string;
  thumbnail?: string;
  category: string;
  views: number;
  uploadDate: string;
  uploadedAt?: string;
  duration: string;
  isFeatured: boolean;
  staticPath: string;
  url?: string;
  videoUrl?: string;
  type?: string;
  mediaType?: string;
}

interface UseFeaturedVideosReturn {
  featuredVideos: FeaturedVideo[];
  isLoading: boolean;
  error: string | null;
  refreshFeaturedVideos: () => void;
}

const useFeaturedVideos = (): UseFeaturedVideosReturn => {
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeaturedVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📹 Loading featured videos from static manifest...');
      
      // Load from static featured.json manifest
      const response = await fetch('/featured.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load featured videos: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.featured || !Array.isArray(data.featured)) {
        throw new Error('Invalid featured videos manifest format');
      }

      // Transform and add required video properties
      const transformedVideos = data.featured.map((video: FeaturedVideo) => ({
        ...video,
        url: video.staticPath,
        videoUrl: video.staticPath,
        type: 'video',
        mediaType: 'video/mp4'
      }));

      console.log('✅ Featured videos loaded:', transformedVideos.length);
      setFeaturedVideos(transformedVideos);

    } catch (err) {
      console.error('❌ Failed to load featured videos:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to empty array instead of default videos
      setFeaturedVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFeaturedVideos = () => {
    loadFeaturedVideos();
  };

  useEffect(() => {
    loadFeaturedVideos();
  }, []);

  return {
    featuredVideos,
    isLoading,
    error,
    refreshFeaturedVideos
  };
};

export default useFeaturedVideos;