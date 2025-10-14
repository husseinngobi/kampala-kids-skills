/**
 * Custom hook for managing video cache and offline functionality
 */

import { useState, useEffect, useCallback } from 'react';
import videoCacheService, { CachedVideo } from '../services/videoCacheService';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  videoUrl?: string;
  url?: string;
  duration?: string | number;
  views?: number;
  uploadDate?: string;
  uploadedAt?: string;
  category?: string;
  type?: string;
  mediaType?: string;
}

interface UseVideoCache {
  cachedVideos: Video[];
  isLoading: boolean;
  isOnline: boolean;
  cacheStats: { totalVideos: number; totalSize: number };
  syncVideos: () => Promise<void>;
  clearCache: () => Promise<void>;
  refreshCache: () => Promise<void>;
}

export const useVideoCache = (apiBaseUrl: string): UseVideoCache => {
  const [cachedVideos, setCachedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStats, setCacheStats] = useState({ totalVideos: 0, totalSize: 0 });

  // Convert cached video to Video interface
  const convertCachedVideo = useCallback((cachedVideo: CachedVideo): Video => ({
    id: cachedVideo.id,
    title: cachedVideo.title,
    description: cachedVideo.description,
    thumbnail: cachedVideo.thumbnailUrl || '/placeholder.svg',
    url: cachedVideo.videoUrl,
    videoUrl: cachedVideo.videoUrl,
    duration: undefined, // Could be extracted from video metadata
    views: cachedVideo.views,
    uploadDate: cachedVideo.uploadedAt,
    uploadedAt: cachedVideo.uploadedAt,
    category: cachedVideo.category,
    type: cachedVideo.type,
    mediaType: cachedVideo.mediaType
  }), []);

  // Update cache statistics
  const updateCacheStats = useCallback(async () => {
    try {
      const stats = await videoCacheService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
    }
  }, []);

  // Load cached videos on mount
  const loadCachedVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      await videoCacheService.init();
      const cached = await videoCacheService.getCachedVideos();
      const converted = cached.map(convertCachedVideo);
      setCachedVideos(converted);
      console.log('📦 Loaded cached videos:', converted.length);
    } catch (error) {
      console.error('❌ Failed to load cached videos:', error);
      setCachedVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, [convertCachedVideo]);

  // Sync videos from backend
  const syncVideos = useCallback(async () => {
    try {
      if (!isOnline) {
        console.log('📴 Offline - skipping sync');
        return;
      }

      console.log('🔄 Syncing videos from backend...');
      await videoCacheService.syncFeaturedVideos(apiBaseUrl);
      await loadCachedVideos(); // Reload cached videos after sync
      await updateCacheStats();
      console.log('✅ Video sync completed');
    } catch (error) {
      console.error('❌ Failed to sync videos:', error);
    }
  }, [apiBaseUrl, isOnline, loadCachedVideos, updateCacheStats]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      await videoCacheService.clearCache();
      setCachedVideos([]);
      setCacheStats({ totalVideos: 0, totalSize: 0 });
      console.log('🧹 Cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }, []);

  // Refresh cache (reload from IndexedDB)
  const refreshCache = useCallback(async () => {
    await loadCachedVideos();
    await updateCacheStats();
  }, [loadCachedVideos, updateCacheStats]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Back online - syncing videos...');
      syncVideos();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Gone offline - using cached videos');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncVideos]);

  // Initial load and sync
  useEffect(() => {
    const initializeCache = async () => {
      await loadCachedVideos();
      await updateCacheStats();
      
      // Sync if online
      if (isOnline) {
        await syncVideos();
      }
    };

    initializeCache();
  }, [loadCachedVideos, updateCacheStats, syncVideos, isOnline]);

  // Periodic sync when online (every 5 minutes)
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      console.log('🔄 Periodic sync triggered');
      syncVideos();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isOnline, syncVideos]);

  return {
    cachedVideos,
    isLoading,
    isOnline,
    cacheStats,
    syncVideos,
    clearCache,
    refreshCache
  };
};

export default useVideoCache;