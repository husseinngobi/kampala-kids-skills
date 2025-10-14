/**
 * Static Video Manager - Backend utility to sync featured videos to frontend
 * Automatically copies featured videos to frontend static folder
 */

import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class StaticVideoManager {
  constructor() {
    this.prisma = new PrismaClient();
    this.frontendStaticPath = path.join(__dirname, '../../../frontend/public/static-videos');
    this.frontendThumbnailPath = path.join(__dirname, '../../../frontend/public/static-videos/thumbnails');
    this.manifestPath = path.join(__dirname, '../../../frontend/public/featured-videos.json');
    this.uploadsPath = path.join(__dirname, '../../uploads');
  }

  /**
   * Initialize the static video directories
   */
  async init() {
    try {
      await fs.mkdir(this.frontendStaticPath, { recursive: true });
      await fs.mkdir(this.frontendThumbnailPath, { recursive: true });
      console.log('✅ Static video directories initialized');
    } catch (error) {
      console.error('❌ Failed to initialize static directories:', error);
    }
  }

  /**
   * Sync all featured videos to frontend static folder
   */
  async syncFeaturedVideos() {
    try {
      console.log('🔄 Syncing featured videos to frontend...');

      // Get all featured videos from database
      const featuredVideos = await this.prisma.media.findMany({
        where: {
          type: 'video',
          isFeatured: true
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });

      console.log(`📹 Found ${featuredVideos.length} featured videos to sync`);

      const syncResults = [];

      for (const video of featuredVideos) {
        const result = await this.copyVideoToStatic(video);
        syncResults.push(result);
      }

      // Update the manifest file
      await this.updateManifest(featuredVideos, syncResults);

      const successCount = syncResults.filter(r => r.success).length;
      console.log(`✅ Synced ${successCount}/${featuredVideos.length} featured videos`);

      return {
        total: featuredVideos.length,
        synced: successCount,
        failed: featuredVideos.length - successCount,
        results: syncResults
      };

    } catch (error) {
      console.error('❌ Failed to sync featured videos:', error);
      throw error;
    }
  }

  /**
   * Copy a single video to static folder
   */
  async copyVideoToStatic(video) {
    const result = {
      id: video.id,
      filename: video.filename,
      success: false,
      error: null,
      staticPath: null,
      thumbnailPath: null
    };

    try {
      // Source paths
      const sourceVideoPath = path.join(this.uploadsPath, 'videos', video.filename);
      const sourceThumbnailPath = path.join(this.uploadsPath, 'thumbnails', `${video.id}.jpg`);

      // Destination paths
      const destVideoPath = path.join(this.frontendStaticPath, video.filename);
      const destThumbnailPath = path.join(this.frontendThumbnailPath, `${video.id}.jpg`);

      // Copy video file
      try {
        await fs.access(sourceVideoPath);
        await fs.copyFile(sourceVideoPath, destVideoPath);
        result.staticPath = `/static-videos/${video.filename}`;
        console.log(`📁 Copied video: ${video.filename}`);
      } catch (error) {
        console.error(`❌ Failed to copy video ${video.filename}:`, error.message);
        result.error = `Video file not found: ${error.message}`;
        return result;
      }

      // Copy thumbnail if it exists
      try {
        await fs.access(sourceThumbnailPath);
        await fs.copyFile(sourceThumbnailPath, destThumbnailPath);
        result.thumbnailPath = `/static-videos/thumbnails/${video.id}.jpg`;
        console.log(`🖼️ Copied thumbnail: ${video.id}.jpg`);
      } catch (error) {
        console.warn(`⚠️ No thumbnail found for ${video.filename}, using logo`);
        // Copy logo as fallback thumbnail
        const logoPath = path.join(__dirname, '../../../frontend/src/assets/life-skills-logo.jpeg');
        try {
          await fs.copyFile(logoPath, destThumbnailPath);
          result.thumbnailPath = `/static-videos/thumbnails/${video.id}.jpg`;
        } catch (logoError) {
          console.warn(`⚠️ Failed to copy logo as thumbnail:`, logoError.message);
          result.thumbnailPath = '/placeholder.svg';
        }
      }

      result.success = true;
      return result;

    } catch (error) {
      console.error(`❌ Failed to copy video ${video.filename}:`, error);
      result.error = error.message;
      return result;
    }
  }

  /**
   * Update the frontend manifest file
   */
  async updateManifest(featuredVideos, syncResults) {
    try {
      console.log('📋 Updating manifest file...');

      // Get all videos for gallery list
      const allVideos = await this.prisma.media.findMany({
        where: { type: 'video' },
        select: { filename: true }
      });

      // Build featured videos array with static paths
      const manifestFeatured = featuredVideos.map(video => {
        const syncResult = syncResults.find(r => r.id === video.id);
        
        return {
          id: `${video.id}-featured`,
          title: video.title,
          description: video.description,
          filename: video.filename,
          thumbnail: `${video.id}.jpg`,
          category: video.category,
          views: video.views || 0,
          uploadedAt: video.uploadedAt.toISOString(),
          duration: video.duration || '0:00',
          featured: true,
          staticPath: syncResult?.staticPath || `/static-videos/${video.filename}`,
          staticThumbnail: syncResult?.thumbnailPath || '/placeholder.svg'
        };
      });

      // Build complete manifest
      const manifest = {
        featured: manifestFeatured,
        gallery: allVideos.map(v => v.filename),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        offlineSupport: true,
        syncedAt: new Date().toISOString(),
        totalFeatured: manifestFeatured.length,
        totalGallery: allVideos.length
      };

      // Write manifest file
      await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2));
      console.log('✅ Manifest updated successfully');

      return manifest;

    } catch (error) {
      console.error('❌ Failed to update manifest:', error);
      throw error;
    }
  }

  /**
   * Remove video from static folder when unfeatured
   */
  async removeVideoFromStatic(videoId, filename) {
    try {
      console.log(`🗑️ Removing video from static folder: ${filename}`);

      const videoPath = path.join(this.frontendStaticPath, filename);
      const thumbnailPath = path.join(this.frontendThumbnailPath, `${videoId}.jpg`);

      // Remove video file
      try {
        await fs.unlink(videoPath);
        console.log(`✅ Removed video: ${filename}`);
      } catch (error) {
        console.warn(`⚠️ Video file not found for removal: ${filename}`);
      }

      // Remove thumbnail
      try {
        await fs.unlink(thumbnailPath);
        console.log(`✅ Removed thumbnail: ${videoId}.jpg`);
      } catch (error) {
        console.warn(`⚠️ Thumbnail not found for removal: ${videoId}.jpg`);
      }

      return true;

    } catch (error) {
      console.error(`❌ Failed to remove video ${filename}:`, error);
      return false;
    }
  }

  /**
   * Clean up static folder - remove videos that are no longer featured
   */
  async cleanupStaticFolder() {
    try {
      console.log('🧹 Cleaning up static folder...');

      // Get currently featured videos
      const featuredVideos = await this.prisma.media.findMany({
        where: {
          type: 'video',
          isFeatured: true
        },
        select: { id: true, filename: true }
      });

      const featuredFilenames = new Set(featuredVideos.map(v => v.filename));
      const featuredIds = new Set(featuredVideos.map(v => v.id));

      // Get files in static folder
      const staticFiles = await fs.readdir(this.frontendStaticPath);
      const thumbnailFiles = await fs.readdir(this.frontendThumbnailPath);

      let removedCount = 0;

      // Remove videos not in featured list
      for (const file of staticFiles) {
        if (file.endsWith('.mp4') && !featuredFilenames.has(file)) {
          await fs.unlink(path.join(this.frontendStaticPath, file));
          console.log(`🗑️ Removed unfeatured video: ${file}`);
          removedCount++;
        }
      }

      // Remove thumbnails not in featured list
      for (const file of thumbnailFiles) {
        if (file.endsWith('.jpg')) {
          const videoId = file.replace('.jpg', '');
          if (!featuredIds.has(videoId)) {
            await fs.unlink(path.join(this.frontendThumbnailPath, file));
            console.log(`🗑️ Removed unfeatured thumbnail: ${file}`);
            removedCount++;
          }
        }
      }

      console.log(`✅ Cleanup completed: ${removedCount} files removed`);
      return removedCount;

    } catch (error) {
      console.error('❌ Failed to cleanup static folder:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    try {
      // Get featured videos count from database
      const dbFeaturedCount = await this.prisma.media.count({
        where: {
          type: 'video',
          isFeatured: true
        }
      });

      // Get static files count
      let staticFilesCount = 0;
      try {
        const staticFiles = await fs.readdir(this.frontendStaticPath);
        staticFilesCount = staticFiles.filter(f => f.endsWith('.mp4')).length;
      } catch {
        staticFilesCount = 0;
      }

      // Check manifest
      let manifestExists = false;
      let manifestData = null;
      try {
        const manifestContent = await fs.readFile(this.manifestPath, 'utf8');
        manifestData = JSON.parse(manifestContent);
        manifestExists = true;
      } catch {
        manifestExists = false;
      }

      return {
        inSync: dbFeaturedCount === staticFilesCount,
        dbFeaturedCount,
        staticFilesCount,
        manifestExists,
        lastSyncedAt: manifestData?.syncedAt || null,
        needsSync: dbFeaturedCount !== staticFilesCount || !manifestExists
      };

    } catch (error) {
      console.error('❌ Failed to get sync status:', error);
      return {
        inSync: false,
        dbFeaturedCount: 0,
        staticFilesCount: 0,
        manifestExists: false,
        lastSyncedAt: null,
        needsSync: true,
        error: error.message
      };
    }
  }
}

export default StaticVideoManager;