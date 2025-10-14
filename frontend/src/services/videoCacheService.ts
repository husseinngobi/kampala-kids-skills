/**
 * Video Cache Service - Local storage for featured videos
 * Enables offline playback of featured videos using IndexedDB
 */

export interface CachedVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  filename: string;
  views: number;
  isFeatured: boolean;
  uploadedAt: string;
  type: string;
  mediaType: string;
  videoBlob: Blob;
  thumbnailBlob?: Blob;
  videoUrl: string; // Object URL for the blob
  thumbnailUrl?: string; // Object URL for thumbnail blob
  cacheDate: string;
  lastAccessed: string;
}

export interface VideoSyncData {
  id: string;
  title: string;
  description: string;
  category: string;
  filename: string;
  views: number;
  isFeatured: boolean;
  uploadedAt: string;
  type: string;
  mediaType: string;
  url: string;
  thumbnail?: string;
}

class VideoCacheService {
  private dbName = 'KampalaKidsSkillsDB';
  private dbVersion = 1;
  private storeName = 'featuredVideos';
  private db: IDBDatabase | null = null;
  private maxCacheSize = 500 * 1024 * 1024; // 500MB cache limit
  private maxVideos = 10; // Maximum number of videos to cache

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for featured videos
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('isFeatured', 'isFeatured', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
          store.createIndex('cacheDate', 'cacheDate', { unique: false });
          console.log('🗄️ Created video cache object store');
        }
      };
    });
  }

  /**
   * Download and cache a video locally
   */
  async cacheVideo(videoData: VideoSyncData): Promise<boolean> {
    try {
      if (!this.db) {
        await this.init();
      }

      console.log('🔄 Caching video:', videoData.title);

      // Download video file
      const videoResponse = await fetch(videoData.url);
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.status}`);
      }
      const videoBlob = await videoResponse.blob();

      // Download thumbnail if available
      let thumbnailBlob: Blob | undefined;
      let thumbnailUrl: string | undefined;
      if (videoData.thumbnail) {
        try {
          const thumbnailResponse = await fetch(videoData.thumbnail);
          if (thumbnailResponse.ok) {
            thumbnailBlob = await thumbnailResponse.blob();
            thumbnailUrl = URL.createObjectURL(thumbnailBlob);
          }
        } catch (error) {
          console.warn('⚠️ Failed to download thumbnail:', error);
        }
      }

      // Create cached video object
      const cachedVideo: CachedVideo = {
        ...videoData,
        videoBlob,
        thumbnailBlob,
        videoUrl: URL.createObjectURL(videoBlob),
        thumbnailUrl,
        cacheDate: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };

      // Check cache size limits before storing
      await this.enforceStorageLimits();

      // Store in IndexedDB
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await new Promise<void>((resolve, reject) => {
        const request = store.put(cachedVideo);
        request.onsuccess = () => {
          console.log('✅ Video cached successfully:', videoData.title);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to cache video:', error);
      return false;
    }
  }

  /**
   * Get all cached featured videos
   */
  async getCachedVideos(): Promise<CachedVideo[]> {
    try {
      if (!this.db) {
        await this.init();
      }

      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('isFeatured');

      return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(true)); // Get only featured videos
        request.onsuccess = () => {
          const videos = request.result;
          // Update last accessed time
          videos.forEach(video => {
            video.lastAccessed = new Date().toISOString();
          });
          console.log('📦 Retrieved cached videos:', videos.length);
          resolve(videos);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Failed to get cached videos:', error);
      return [];
    }
  }

  /**
   * Check if a video is cached locally
   */
  async isVideoCached(videoId: string): Promise<boolean> {
    try {
      if (!this.db) {
        await this.init();
      }

      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve) => {
        const request = store.get(videoId);
        request.onsuccess = () => {
          resolve(!!request.result);
        };
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('❌ Failed to check cache:', error);
      return false;
    }
  }

  /**
   * Remove a video from cache
   */
  async removeCachedVideo(videoId: string): Promise<boolean> {
    try {
      if (!this.db) {
        await this.init();
      }

      // First get the video to revoke object URLs
      const cachedVideo = await this.getCachedVideo(videoId);
      if (cachedVideo) {
        URL.revokeObjectURL(cachedVideo.videoUrl);
        if (cachedVideo.thumbnailUrl) {
          URL.revokeObjectURL(cachedVideo.thumbnailUrl);
        }
      }

      // Remove from IndexedDB
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve) => {
        const request = store.delete(videoId);
        request.onsuccess = () => {
          console.log('🗑️ Video removed from cache:', videoId);
          resolve(true);
        };
        request.onerror = () => {
          console.error('❌ Failed to remove video from cache:', request.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('❌ Failed to remove cached video:', error);
      return false;
    }
  }

  /**
   * Get a specific cached video
   */
  async getCachedVideo(videoId: string): Promise<CachedVideo | null> {
    try {
      if (!this.db) {
        await this.init();
      }

      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve) => {
        const request = store.get(videoId);
        request.onsuccess = () => {
          const video = request.result;
          if (video) {
            // Update last accessed time
            video.lastAccessed = new Date().toISOString();
          }
          resolve(video || null);
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('❌ Failed to get cached video:', error);
      return null;
    }
  }

  /**
   * Sync featured videos from backend
   */
  async syncFeaturedVideos(apiBaseUrl: string): Promise<void> {
    try {
      console.log('🔄 Syncing featured videos from backend...');
      
      const response = await fetch(`${apiBaseUrl}/api/gallery/media?featured=true&type=videos`);
      if (!response.ok) {
        throw new Error(`Failed to fetch featured videos: ${response.status}`);
      }

      const data = await response.json();
      const featuredVideos: VideoSyncData[] = data.data || [];

      console.log(`📥 Found ${featuredVideos.length} featured videos to sync`);

      // Cache each featured video
      const cachePromises = featuredVideos.map(video => this.cacheVideo(video));
      const results = await Promise.allSettled(cachePromises);

      const successful = results.filter(result => result.status === 'fulfilled').length;
      console.log(`✅ Successfully cached ${successful}/${featuredVideos.length} videos`);

      // Remove videos that are no longer featured
      await this.cleanupUnfeaturedVideos(featuredVideos.map(v => v.id));

    } catch (error) {
      console.error('❌ Failed to sync featured videos:', error);
    }
  }

  /**
   * Remove videos that are no longer featured
   */
  private async cleanupUnfeaturedVideos(currentFeaturedIds: string[]): Promise<void> {
    try {
      const cachedVideos = await this.getCachedVideos();
      const videosToRemove = cachedVideos.filter(video => !currentFeaturedIds.includes(video.id));

      for (const video of videosToRemove) {
        await this.removeCachedVideo(video.id);
      }

      if (videosToRemove.length > 0) {
        console.log(`🧹 Cleaned up ${videosToRemove.length} unfeatured videos`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup unfeatured videos:', error);
    }
  }

  /**
   * Enforce storage limits to prevent excessive cache growth
   */
  private async enforceStorageLimits(): Promise<void> {
    try {
      const cachedVideos = await this.getCachedVideos();
      
      // Remove oldest videos if we exceed the limit
      if (cachedVideos.length >= this.maxVideos) {
        const sortedByAccess = cachedVideos.sort((a, b) => 
          new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime()
        );
        
        const videosToRemove = sortedByAccess.slice(0, cachedVideos.length - this.maxVideos + 1);
        for (const video of videosToRemove) {
          await this.removeCachedVideo(video.id);
        }
        
        console.log(`🧹 Removed ${videosToRemove.length} old videos to maintain cache limits`);
      }
    } catch (error) {
      console.error('❌ Failed to enforce storage limits:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{totalVideos: number, totalSize: number}> {
    try {
      const cachedVideos = await this.getCachedVideos();
      const totalSize = cachedVideos.reduce((size, video) => size + video.videoBlob.size, 0);
      
      return {
        totalVideos: cachedVideos.length,
        totalSize
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return { totalVideos: 0, totalSize: 0 };
    }
  }

  /**
   * Clear all cached videos
   */
  async clearCache(): Promise<boolean> {
    try {
      if (!this.db) {
        await this.init();
      }

      // First revoke all object URLs
      const cachedVideos = await this.getCachedVideos();
      cachedVideos.forEach(video => {
        URL.revokeObjectURL(video.videoUrl);
        if (video.thumbnailUrl) {
          URL.revokeObjectURL(video.thumbnailUrl);
        }
      });

      // Clear the object store
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve) => {
        const request = store.clear();
        request.onsuccess = () => {
          console.log('🧹 Cache cleared successfully');
          resolve(true);
        };
        request.onerror = () => {
          console.error('❌ Failed to clear cache:', request.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      return false;
    }
  }
}

// Export singleton instance
export const videoCacheService = new VideoCacheService();
export default videoCacheService;