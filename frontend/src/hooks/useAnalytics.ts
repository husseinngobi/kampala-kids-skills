import { useEffect } from 'react';

// Types
interface AnalyticsEvent {
  event: string;
  timestamp: number;
  data?: Record<string, unknown>;
  sessionId: string;
  userId: string;
}

interface AnalyticsSummary {
  totalEvents: number;
  last24Hours: number;
  pageViews: number;
  videoViews: number;
  enrolments: number;
  contacts: number;
  errors: number;
}

// Analytics tracking utility
class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private sessionId: string;
  private userId: string;
  private startTime: number;
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = Date.now();
    
    // Track session start
    this.track('session_start', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: {
        width: screen.width,
        height: screen.height
      },
      timestamp: this.startTime
    });

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        duration: Date.now() - this.startTime,
        pageViews: this.events.filter(e => e.event === 'page_view').length,
        videoViews: this.events.filter(e => e.event === 'video_view').length
      });
      this.flush();
    });

    // Periodically flush events
    setInterval(() => {
      this.flush();
    }, 30000); // Every 30 seconds
  }

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string {
    let userId = localStorage.getItem('kampala_kids_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('kampala_kids_user_id', userId);
    }
    return userId;
  }

  track(event: string, data?: Record<string, unknown>): void {
    const eventData: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      data,
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.events.push(eventData);
    console.log('📊 Analytics:', event, data);

    // Auto-flush for important events
    if (['video_view', 'enrolment_started', 'contact_submitted'].includes(event)) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // In a real implementation, send to your analytics backend
      // For now, we'll just log locally and store in localStorage for debugging
      const existingData = localStorage.getItem('kampala_kids_analytics') || '[]';
      const allEvents: AnalyticsEvent[] = JSON.parse(existingData);
      allEvents.push(...eventsToSend);
      
      // Keep only last 1000 events to prevent storage overflow
      if (allEvents.length > 1000) {
        allEvents.splice(0, allEvents.length - 1000);
      }
      
      localStorage.setItem('kampala_kids_analytics', JSON.stringify(allEvents));
      
      console.log(`📊 Analytics: Flushed ${eventsToSend.length} events`);
    } catch (error) {
      console.error('📊 Analytics: Failed to flush events', error);
      // Re-add events if flush failed
      this.events.unshift(...eventsToSend);
    }
  }

  // Public tracking methods
  trackPageView(page: string, title?: string): void {
    this.track('page_view', {
      page,
      title,
      url: window.location.href,
      referrer: document.referrer
    });
  }

  trackVideoView(videoId: string, videoTitle: string, duration?: number): void {
    this.track('video_view', {
      videoId,
      videoTitle,
      duration,
      page: window.location.pathname
    });
  }

  trackVideoPlay(videoId: string, videoTitle: string): void {
    this.track('video_play', {
      videoId,
      videoTitle,
      timestamp: Date.now()
    });
  }

  trackVideoPause(videoId: string, currentTime: number): void {
    this.track('video_pause', {
      videoId,
      currentTime,
      timestamp: Date.now()
    });
  }

  trackVideoComplete(videoId: string, totalDuration: number): void {
    this.track('video_complete', {
      videoId,
      totalDuration,
      timestamp: Date.now()
    });
  }

  trackEnrolmentStarted(): void {
    this.track('enrolment_started', {
      page: window.location.pathname,
      timestamp: Date.now()
    });
  }

  trackEnrolmentCompleted(programmeType: string): void {
    this.track('enrolment_completed', {
      programmeType,
      timestamp: Date.now()
    });
  }

  trackContactSubmitted(contactType: string): void {
    this.track('contact_submitted', {
      contactType,
      timestamp: Date.now()
    });
  }

  trackGalleryFilter(filterType: string, filterValue: string): void {
    this.track('gallery_filter', {
      filterType,
      filterValue,
      timestamp: Date.now()
    });
  }

  trackError(error: string, context?: Record<string, unknown>): void {
    this.track('error', {
      error,
      context,
      page: window.location.pathname,
      timestamp: Date.now()
    });
  }

  // Get analytics summary
  getAnalyticsSummary(): AnalyticsSummary | null {
    const data = localStorage.getItem('kampala_kids_analytics');
    if (!data) return null;

    const events: AnalyticsEvent[] = JSON.parse(data);
    const now = Date.now();
    const last24Hours = events.filter((e: AnalyticsEvent) => now - e.timestamp < 24 * 60 * 60 * 1000);
    
    return {
      totalEvents: events.length,
      last24Hours: last24Hours.length,
      pageViews: events.filter((e: AnalyticsEvent) => e.event === 'page_view').length,
      videoViews: events.filter((e: AnalyticsEvent) => e.event === 'video_view').length,
      enrolments: events.filter((e: AnalyticsEvent) => e.event === 'enrolment_completed').length,
      contacts: events.filter((e: AnalyticsEvent) => e.event === 'contact_submitted').length,
      errors: events.filter((e: AnalyticsEvent) => e.event === 'error').length
    };
  }
}

// Export analytics tracker for direct use
export { AnalyticsTracker };

// Page tracking hook
export const usePageTracking = (pageName: string, pageTitle?: string) => {
  useEffect(() => {
    const analytics = AnalyticsTracker.getInstance();
    analytics.trackPageView(pageName, pageTitle);
  }, [pageName, pageTitle]);
};

// Video tracking hook
export const useVideoTracking = () => {
  const analytics = AnalyticsTracker.getInstance();
  
  return {
    trackVideoView: (videoId: string, videoTitle: string, duration?: number) => {
      analytics.trackVideoView(videoId, videoTitle, duration);
    },
    trackVideoPlay: (videoId: string, videoTitle: string) => {
      analytics.trackVideoPlay(videoId, videoTitle);
    },
    trackVideoPause: (videoId: string, currentTime: number) => {
      analytics.trackVideoPause(videoId, currentTime);
    },
    trackVideoComplete: (videoId: string, totalDuration: number) => {
      analytics.trackVideoComplete(videoId, totalDuration);
    }
  };
};

// General analytics hook
export const useAnalytics = () => {
  const analytics = AnalyticsTracker.getInstance();
  
  return {
    track: analytics.track.bind(analytics),
    trackEnrolmentStarted: analytics.trackEnrolmentStarted.bind(analytics),
    trackEnrolmentCompleted: analytics.trackEnrolmentCompleted.bind(analytics),
    trackContactSubmitted: analytics.trackContactSubmitted.bind(analytics),
    trackGalleryFilter: analytics.trackGalleryFilter.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    getSummary: analytics.getAnalyticsSummary.bind(analytics)
  };
};