/**
 * Enhanced video hook with hybrid static/cache/API strategy
 */

import { useState, useEffect, useCallback } from 'react';
import { createStaticVideoService } from '../services/staticVideoService';
import type { Video } from '../services/staticVideoService';

interface UseHybridVideo {
  videos: Video[];
  isLoading: boolean;
  isOnline: boolean;
  availabilityStatus: {
    staticAvailable: boolean;
    cacheAvailable: boolean;
    apiAvailable: boolean;
    totalVideos: number;
  };
  refreshVideos: () => Promise<void>;
  validateStaticVideos: () => Promise<{ valid: string[]; missing: string[] }>;
  getVideoSource: () => 'static' | 'cache' | 'api' | 'default';
}

export const useHybridVideo = (apiBaseUrl: string): UseHybridVideo => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [availabilityStatus, setAvailabilityStatus] = useState({
    staticAvailable: false,
    cacheAvailable: false, 
    apiAvailable: false,
    totalVideos: 0
  });
  const [videoSource, setVideoSource] = useState<'static' | 'cache' | 'api' | 'default'>('default');

  const staticVideoService = createStaticVideoService(apiBaseUrl);

  // Load videos using hybrid strategy
  const loadVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading videos with hybrid strategy...');

      // Get videos using hybrid fallback
      const loadedVideos = await staticVideoService.getFeaturedVideos();
      setVideos(loadedVideos);

      // Determine which source was used
      if (loadedVideos.length > 0) {
        if (loadedVideos[0].url?.includes('/static-videos/')) {
          setVideoSource('static');
        } else if (loadedVideos[0].url?.startsWith('blob:')) {
          setVideoSource('cache');
        } else if (loadedVideos[0].url?.includes('localhost:5000')) {
          setVideoSource('api');
        } else {
          setVideoSource('default');
        }
      }

      // Update availability status
      const status = await staticVideoService.getAvailabilityStatus();
      setAvailabilityStatus(status);

      console.log('✅ Videos loaded successfully:', loadedVideos.length);
      console.log('📊 Source used:', videoSource);
      console.log('📈 Availability status:', status);

    } catch (error) {
      console.error('❌ Failed to load videos:', error);
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, [staticVideoService, videoSource]);

  // Refresh videos manually
  const refreshVideos = useCallback(async () => {
    console.log('🔄 Manual refresh requested...');
    await staticVideoService.refreshManifest();
    await loadVideos();
  }, [staticVideoService, loadVideos]);

  // Validate static video files
  const validateStaticVideos = useCallback(async () => {
    return await staticVideoService.validateStaticVideos();
  }, [staticVideoService]);

  // Get current video source
  const getVideoSource = useCallback((): 'static' | 'cache' | 'api' | 'default' => {
    return videoSource;
  }, [videoSource]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Back online - refreshing videos...');
      loadVideos();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Gone offline - using cached/static videos');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadVideos]);

  // Initial load
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Periodic refresh when online (every 10 minutes)
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      console.log('🔄 Periodic refresh triggered');
      refreshVideos();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [isOnline, refreshVideos]);

  return {
    videos,
    isLoading,
    isOnline,
    availabilityStatus,
    refreshVideos,
    validateStaticVideos,
    getVideoSource
  };
};

export default useHybridVideo;