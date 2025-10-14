/**
 * Static Video Service - Offline-first video management
 * Implements hybrid strategy: Static videos → IndexedDB cache → API → Defaults
 */

export interface StaticVideo {
  id: string;
  title: string;
  description: string;
  filename: string;
  thumbnail: string;
  category: string;
  views: number;
  uploadedAt: string;
  duration: string;
  featured: boolean;
  staticPath: string;
  staticThumbnail: string;
}

export interface VideoManifest {
  featured: StaticVideo[];
  gallery: string[];
  lastUpdated: string;
  version: string;
  offlineSupport: boolean;
}

export interface Video {
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

class StaticVideoService {
  private manifestUrl = '/featured-videos.json';
  private apiBaseUrl: string;
  private cachedManifest: VideoManifest | null = null;
  private lastFetchTime = 0;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get featured videos using hybrid strategy
   * Priority: Static manifest → IndexedDB → API → Defaults
   */
  async getFeaturedVideos(): Promise<Video[]> {
    console.log('🎯 Getting featured videos with hybrid strategy...');
    
    try {
      // 1. Try static manifest first (offline-safe)
      const staticVideos = await this.getStaticFeaturedVideos();
      if (staticVideos.length > 0) {
        console.log('✅ Using static featured videos:', staticVideos.length);
        return staticVideos;
      }

      // 2. Fallback to IndexedDB cache
      const cachedVideos = await this.getCachedFeaturedVideos();
      if (cachedVideos.length > 0) {
        console.log('📦 Using cached featured videos:', cachedVideos.length);
        return cachedVideos;
      }

      // 3. Fallback to API
      const apiVideos = await this.getApiFeaturedVideos();
      if (apiVideos.length > 0) {
        console.log('🌐 Using API featured videos:', apiVideos.length);
        return apiVideos;
      }

      // 4. Final fallback to defaults
      console.log('⚠️ Using default featured videos');
      return this.getDefaultFeaturedVideos();

    } catch (error) {
      console.error('❌ Error in hybrid video strategy:', error);
      return this.getDefaultFeaturedVideos();
    }
  }

  /**
   * Get featured videos from static manifest (offline-safe)
   */
  private async getStaticFeaturedVideos(): Promise<Video[]> {
    try {
      console.log('📁 Fetching static video manifest...');
      
      const response = await fetch(this.manifestUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.status}`);
      }

      const manifest: VideoManifest = await response.json();
      this.cachedManifest = manifest;
      this.lastFetchTime = Date.now();

      console.log(`📋 Static manifest loaded: ${manifest.featured.length} featured videos`);
      console.log(`📅 Last updated: ${manifest.lastUpdated}`);

      // Convert static videos to Video interface
      return manifest.featured.map(this.convertStaticToVideo);

    } catch (error) {
      console.error('❌ Failed to load static manifest:', error);
      return [];
    }
  }

  /**
   * Get featured videos from IndexedDB cache
   */
  private async getCachedFeaturedVideos(): Promise<Video[]> {
    try {
      // Import dynamically to avoid circular dependency
      const { videoCacheService } = await import('./videoCacheService');
      await videoCacheService.init();
      const cached = await videoCacheService.getCachedVideos();
      
      return cached.map(cachedVideo => ({
        id: cachedVideo.id,
        title: cachedVideo.title,
        description: cachedVideo.description,
        thumbnail: cachedVideo.thumbnailUrl || '/placeholder.svg',
        url: cachedVideo.videoUrl,
        videoUrl: cachedVideo.videoUrl,
        views: cachedVideo.views,
        uploadedAt: cachedVideo.uploadedAt,
        category: cachedVideo.category,
        type: cachedVideo.type,
        mediaType: cachedVideo.mediaType
      }));

    } catch (error) {
      console.error('❌ Failed to load cached videos:', error);
      return [];
    }
  }

  /**
   * Get featured videos from API
   */
  private async getApiFeaturedVideos(): Promise<Video[]> {
    try {
      console.log('🌐 Fetching featured videos from API...');
      
      const response = await fetch(`${this.apiBaseUrl}/api/gallery/media?featured=true&limit=3&type=videos`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(`🎬 API returned ${data.data?.length || 0} featured videos`);

      return data.data || [];

    } catch (error) {
      console.error('❌ Failed to load API videos:', error);
      return [];
    }
  }

  /**
   * Get default featured videos (final fallback)
   */
  private getDefaultFeaturedVideos(): Video[] {
    return [
      {
        id: 'default-house-cleaning',
        title: 'House Cleaning Skills',
        description: 'Children learning proper cleaning techniques, organization, and maintaining a tidy environment.',
        thumbnail: '/placeholder.svg',
        videoUrl: '/static-videos/house-cleaning.mp4',
        url: '/static-videos/house-cleaning.mp4',
        duration: '3:45',
        views: 245,
        uploadDate: '2024-11-15',
        category: 'Cleaning'
      },
      {
        id: 'default-pet-care',
        title: 'Pet & Plant Care',
        description: 'Building responsibility and empathy through caring for pets and nurturing living things.',
        thumbnail: '/placeholder.svg',
        videoUrl: '/static-videos/pet-care.mp4',
        url: '/static-videos/pet-care.mp4',
        duration: '4:20',
        views: 167,
        uploadDate: '2024-11-10',
        category: 'Life Skills'
      },
      {
        id: 'default-shoe-care',
        title: 'Personal Care & Hygiene',
        description: 'Teaching children proper shoe care and personal hygiene habits for confidence and self-respect.',
        thumbnail: '/placeholder.svg',
        videoUrl: '/static-videos/shoe-care.mp4',
        url: '/static-videos/shoe-care.mp4',
        duration: '2:30',
        views: 189,
        uploadDate: '2024-11-12',
        category: 'Personal Care'
      }
    ];
  }

  /**
   * Convert static video to Video interface
   */
  private convertStaticToVideo = (staticVideo: StaticVideo): Video => ({
    id: staticVideo.id,
    title: staticVideo.title,
    description: staticVideo.description,
    thumbnail: staticVideo.staticThumbnail,
    url: staticVideo.staticPath,
    videoUrl: staticVideo.staticPath,
    duration: staticVideo.duration,
    views: staticVideo.views,
    uploadDate: staticVideo.uploadedAt,
    uploadedAt: staticVideo.uploadedAt,
    category: staticVideo.category,
    type: 'video',
    mediaType: 'video/mp4'
  });

  /**
   * Check if videos are available offline
   */
  async isOfflineReady(): Promise<boolean> {
    try {
      // Check if static manifest exists
      const response = await fetch(this.manifestUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get video availability status
   */
  async getAvailabilityStatus(): Promise<{
    staticAvailable: boolean;
    cacheAvailable: boolean;
    apiAvailable: boolean;
    totalVideos: number;
  }> {
    const status = {
      staticAvailable: false,
      cacheAvailable: false,
      apiAvailable: false,
      totalVideos: 0
    };

    try {
      // Check static availability
      const staticVideos = await this.getStaticFeaturedVideos();
      status.staticAvailable = staticVideos.length > 0;
      status.totalVideos += staticVideos.length;

      // Check cache availability
      const cachedVideos = await this.getCachedFeaturedVideos();
      status.cacheAvailable = cachedVideos.length > 0;

      // Check API availability
      try {
        const apiVideos = await this.getApiFeaturedVideos();
        status.apiAvailable = apiVideos.length > 0;
      } catch {
        status.apiAvailable = false;
      }

    } catch (error) {
      console.error('❌ Failed to check availability status:', error);
    }

    return status;
  }

  /**
   * Get cached manifest
   */
  getCachedManifest(): VideoManifest | null {
    if (this.cachedManifest && (Date.now() - this.lastFetchTime) < this.cacheTimeout) {
      return this.cachedManifest;
    }
    return null;
  }

  /**
   * Refresh manifest cache
   */
  async refreshManifest(): Promise<VideoManifest | null> {
    this.cachedManifest = null;
    this.lastFetchTime = 0;
    await this.getStaticFeaturedVideos();
    return this.cachedManifest;
  }

  /**
   * Check if static video files exist
   */
  async validateStaticVideos(): Promise<{ valid: string[]; missing: string[] }> {
    const manifest = await this.getStaticFeaturedVideos();
    const valid: string[] = [];
    const missing: string[] = [];

    for (const video of manifest) {
      try {
        const response = await fetch(video.url || '', { method: 'HEAD' });
        if (response.ok) {
          valid.push(video.id);
        } else {
          missing.push(video.id);
        }
      } catch {
        missing.push(video.id);
      }
    }

    return { valid, missing };
  }
}

// Export service factory function
export const createStaticVideoService = (apiBaseUrl: string) => {
  return new StaticVideoService(apiBaseUrl);
};

export default StaticVideoService;