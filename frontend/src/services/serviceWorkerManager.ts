/**
 * Service Worker registration and management
 */

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isRegistered = false;

  /**
   * Register the service worker
   */
  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Workers not supported in this browser');
      return false;
    }

    try {
      console.log('🔧 Registering Service Worker...');
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered successfully');
      this.isRegistered = true;

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New Service Worker available - refresh to update');
              this.notifyUpdate();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);

      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, data, message, error } = event.data;

    switch (type) {
      case 'SYNC_START':
        console.log('🔄 Background sync started');
        this.dispatchCustomEvent('sw-sync-start', { message });
        break;

      case 'SYNC_SUCCESS':
        console.log('✅ Background sync completed');
        this.dispatchCustomEvent('sw-sync-success', { data, message });
        break;

      case 'SYNC_ERROR':
        console.error('❌ Background sync failed:', error);
        this.dispatchCustomEvent('sw-sync-error', { error, message });
        break;

      case 'CACHE_CLEARED':
        console.log('🧹 Cache cleared by service worker');
        this.dispatchCustomEvent('sw-cache-cleared', { message });
        break;

      default:
        console.log('📨 Unknown message from service worker:', event.data);
    }
  };

  /**
   * Dispatch custom events for service worker notifications
   */
  private dispatchCustomEvent(eventName: string, detail: Record<string, unknown>) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  /**
   * Notify about service worker updates
   */
  private notifyUpdate() {
    this.dispatchCustomEvent('sw-update-available', {
      message: 'A new version is available. Refresh to update.'
    });
  }

  /**
   * Register for background sync
   */
  async registerBackgroundSync(tag: string): Promise<boolean> {
    if (!this.registration) {
      console.warn('⚠️ Background Sync not supported - no registration');
      return false;
    }

    try {
      // Type assertion for background sync API
      const registration = this.registration as ServiceWorkerRegistration & {
        sync: { register: (tag: string) => Promise<void> };
      };
      
      if ('sync' in registration) {
        await registration.sync.register(tag);
        console.log('✅ Background sync registered:', tag);
        return true;
      } else {
        console.warn('⚠️ Background Sync not supported in this browser');
        return false;
      }
    } catch (error) {
      console.error('❌ Background sync registration failed:', error);
      return false;
    }
  }

  /**
   * Request a specific video to be cached
   */
  async cacheVideo(videoUrl: string, videoId: string): Promise<void> {
    if (!this.isRegistered || !navigator.serviceWorker.controller) {
      console.warn('⚠️ Service Worker not available for caching');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_VIDEO',
      videoUrl,
      videoId
    });

    console.log('📤 Requested video caching:', videoId);
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    if (!this.isRegistered || !navigator.serviceWorker.controller) {
      console.warn('⚠️ Service Worker not available for cache clearing');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE'
    });

    console.log('📤 Requested cache clearing');
  }

  /**
   * Update the service worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      console.warn('⚠️ No service worker registration to update');
      return;
    }

    try {
      await this.registration.update();
      console.log('🔄 Service Worker update check completed');
    } catch (error) {
      console.error('❌ Service Worker update failed:', error);
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      console.warn('⚠️ No service worker registration to unregister');
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('🗑️ Service Worker unregistered');
      this.registration = null;
      this.isRegistered = false;
      return result;
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Get service worker status
   */
  getStatus(): {
    isRegistered: boolean;
    isControlling: boolean;
    state: string | null;
  } {
    return {
      isRegistered: this.isRegistered,
      isControlling: !!navigator.serviceWorker.controller,
      state: this.registration?.active?.state || null
    };
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();
export default serviceWorkerManager;