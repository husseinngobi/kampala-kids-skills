import React, { useEffect } from 'react';
import { AnalyticsTracker } from '@/hooks/useAnalytics';

// Analytics component for initialization
const Analytics: React.FC = () => {
  useEffect(() => {
    // Initialize analytics tracker
    AnalyticsTracker.getInstance();
    
    // Track initial page load
    const analytics = AnalyticsTracker.getInstance();
    analytics.trackPageView(window.location.pathname, document.title);
    
    // Track navigation changes (for SPA)
    const handlePopState = () => {
      analytics.trackPageView(window.location.pathname, document.title);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default Analytics;