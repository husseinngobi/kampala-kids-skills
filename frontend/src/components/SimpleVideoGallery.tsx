import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, AlertCircle, Wifi, WifiOff } from 'lucide-react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Emergency circuit breaker - completely stops all requests when triggered
let EMERGENCY_STOP = false;
let emergencyStopUntil = 0;

// Global request cache and loading state to prevent duplicate API calls
const requestCache = new Map<string, { promise: Promise<Response>; timestamp: number }>();
const activeRequests = new Set<string>();
const requestHistory = new Map<string, number[]>(); // Track request timestamps
const REQUEST_CACHE_TTL = 30000; // 30 seconds
const MAX_REQUESTS_PER_MINUTE = 5; // Maximum 5 requests per minute per URL
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// Global rate limit block state
const rateLimitedUrls = new Map<string, number>(); // URL -> timestamp when rate limited

// Global singleton state to prevent multiple components from loading simultaneously
const globalState = {
  loading: false,
  videosCache: null as Video[] | null,
  cacheTimestamp: 0
};

// Global function to make cached API requests
const makeApiRequest = async (url: string): Promise<Response> => {
  const now = Date.now();
  
  // Emergency circuit breaker
  if (EMERGENCY_STOP || now < emergencyStopUntil) {
    const remainingSeconds = Math.ceil((emergencyStopUntil - now) / 1000);
    console.warn(`🛑 EMERGENCY STOP ACTIVE - blocking all requests for ${remainingSeconds} more seconds`);
    throw new Error(`Emergency stop active. Requests blocked for ${remainingSeconds} seconds.`);
  }
  
  // Check if this URL is currently rate limited
  const rateLimitExpiry = rateLimitedUrls.get(url);
  if (rateLimitExpiry && now < rateLimitExpiry) {
    const remainingSeconds = Math.ceil((rateLimitExpiry - now) / 1000);
    console.warn(`⏸️ URL is rate limited for ${remainingSeconds} more seconds:`, url);
    throw new Error(`Rate limited. Please wait ${remainingSeconds} seconds before retrying.`);
  }
  
  // Rate limiting check
  const history = requestHistory.get(url) || [];
  const recentRequests = history.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    console.warn('🚫 Rate limit exceeded for URL:', url);
    // TRIGGER EMERGENCY STOP
    EMERGENCY_STOP = true;
    emergencyStopUntil = now + 60000; // Block for 1 minute
    console.error('🛑 EMERGENCY STOP TRIGGERED - Blocking all requests for 60 seconds due to infinite loop!');
    throw new Error('EMERGENCY STOP: Infinite loop detected. All requests blocked for 60 seconds.');
  }
  
  // Update request history
  recentRequests.push(now);
  requestHistory.set(url, recentRequests);
  
  // Check if request is already active
  if (activeRequests.has(url)) {
    console.log('⏳ Request already in progress, waiting:', url);
    // Wait for the active request to complete
    while (activeRequests.has(url)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    // After waiting, check cache again
    const cached = requestCache.get(url);
    if (cached && (now - cached.timestamp) < REQUEST_CACHE_TTL) {
      console.log('📦 Using cache after wait:', url);
      return cached.promise;
    }
  }
  
  // Check cache first
  const cached = requestCache.get(url);
  if (cached && (now - cached.timestamp) < REQUEST_CACHE_TTL) {
    console.log('📦 Using cached request for:', url);
    return cached.promise;
  }
  
  console.log('🆕 Making new request for:', url);
  activeRequests.add(url);
  
  const fetchPromise = fetch(url).then(response => {
    // Handle rate limiting responses
    if (response.status === 429) {
      console.warn('🚫 Server returned 429 - triggering emergency stop:', url);
      EMERGENCY_STOP = true;
      emergencyStopUntil = now + 60000; // Block for 1 minute
      console.error('🛑 EMERGENCY STOP TRIGGERED - Server rate limiting detected!');
    }
    return response;
  });
  
  requestCache.set(url, { promise: fetchPromise, timestamp: now });
  
  // Clear from active requests when done
  fetchPromise.finally(() => {
    activeRequests.delete(url);
  });
  
  // Clear cache after TTL
  setTimeout(() => {
    const entry = requestCache.get(url);
    if (entry && (Date.now() - entry.timestamp) >= REQUEST_CACHE_TTL) {
      requestCache.delete(url);
      console.log('🗑️ Cache cleared for:', url);
    }
  }, REQUEST_CACHE_TTL);
  
  return fetchPromise;
};

interface Video {
  id: string;
  title: string;
  description: string;
  filename: string;
  url: string;
  category: string;
  views: number;
  uploadedAt: string;
  featured: boolean;
  published: boolean;
  fileSize: number;
  duration: number;
  thumbnailUrl: string;
  type: string;
}

interface SimpleVideoGalleryProps {
  maxVideos?: number;
  showFeaturedOnly?: boolean;
}

const SimpleVideoGallery: React.FC<SimpleVideoGalleryProps> = ({
  maxVideos = 6,
  showFeaturedOnly = false
}) => {
  console.log('🎬 SimpleVideoGallery: Component rendering/mounting');
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Refs to prevent infinite loops
  const mountedRef = useRef(false);
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getVideoUrl = (video: Video): string => {
    // Try multiple URL patterns
    const encodedFilename = encodeURIComponent(video.filename);
    return `${API_BASE_URL}/uploads/videos/${encodedFilename}`;
  };

  const getAlternativeVideoUrl = (video: Video): string => {
    // Alternative with simple space replacement
    const altFilename = video.filename.replace(/\s+/g, '%20');
    return `${API_BASE_URL}/uploads/videos/${altFilename}`;
  };

  const loadVideos = async () => {
    // Check global cache first
    const now = Date.now();
    if (globalState.videosCache && (now - globalState.cacheTimestamp) < REQUEST_CACHE_TTL) {
      console.log('🌐 Using global video cache');
      setVideos(globalState.videosCache);
      setLoading(false);
      hasLoadedRef.current = true;
      return;
    }

    // Prevent multiple simultaneous loads globally
    if (globalState.loading || loadingRef.current || hasLoadedRef.current) {
      console.log('⏭️ Load already in progress globally or locally, skipping');
      return;
    }

    globalState.loading = true;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    console.log('📡 Loading videos from API...');
    console.log('🔗 API URL:', `${API_BASE_URL}/api/gallery/media`);
    
    try {
      const params = new URLSearchParams();
      if (showFeaturedOnly) params.append('featured', 'true');
      if (maxVideos) params.append('limit', maxVideos.toString());
      params.append('type', 'videos');
      
      const url = `${API_BASE_URL}/api/gallery/media?${params.toString()}`;
      console.log('🔗 Full request URL:', url);
      
      // Use the global cached request function
      const response = await makeApiRequest(url);
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📹 Raw API response:', data);
      
      // Handle both direct array and wrapped response formats
      let videosArray: Video[] = [];
      
      if (Array.isArray(data)) {
        // Direct array format (old format)
        videosArray = data;
      } else if (data && data.success && Array.isArray(data.data)) {
        // Wrapped response format (current Supabase format)
        videosArray = data.data;
      } else {
        throw new Error('Invalid response format - expected array or {success: true, data: array}');
      }
      
      // Update global cache
      globalState.videosCache = videosArray;
      globalState.cacheTimestamp = Date.now();
      
      setVideos(videosArray);
      hasLoadedRef.current = true;
      
      // Auto-select first video
      if (videosArray.length > 0 && !selectedVideo) {
        setSelectedVideo(videosArray[0]);
        console.log('🎯 Auto-selected first video:', videosArray[0].title);
      }
      console.log('✅ Videos loaded:', videosArray.length);
      
    } catch (err) {
      console.error('❌ Failed to load videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
      setVideos([]);
      hasLoadedRef.current = false; // Allow retry on error
    } finally {
      setLoading(false);
      loadingRef.current = false;
      globalState.loading = false; // Reset global loading state
    }
  };

  // Load videos only once on mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log('🚀 SimpleVideoGallery: Initial mount, loading videos');
      loadVideos();
    }
    
    // Cleanup function
    return () => {
      console.log('🧹 SimpleVideoGallery: Component unmounting');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // COMPLETELY empty dependency array - run only once

  // Monitor online status without triggering reloads
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    console.log('🎥 Selected video:', video.title);
    console.log('🔗 Video URL:', getVideoUrl(video));
    console.log('🔗 Video object:', video);
  };

  const testVideoUrl = (video: Video) => {
    const url = getVideoUrl(video);
    console.log('🧪 Testing video URL in new tab:', url);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-300 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-700">
          <strong>Error loading videos:</strong> {error}
          <Button
            variant="outline"
            size="sm"
            onClick={loadVideos}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status indicator */}
      <div className="flex items-center space-x-2 text-sm">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-600" />
            <span className="text-red-600">Offline</span>
          </>
        )}
        <span className="text-gray-500">•</span>
        <span className="text-gray-600">{videos.length} videos loaded</span>
      </div>

      {/* Video player */}
      {selectedVideo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedVideo.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg mb-4">
              <video
                controls
                className="w-full h-full"
                poster="/placeholder.svg"
                playsInline
                preload="metadata"
                onError={(e) => {
                  console.error('❌ Video error:', e);
                  console.error('❌ Video URL that failed:', getVideoUrl(selectedVideo));
                  const video = e.target as HTMLVideoElement;
                  if (video.error) {
                    console.error('❌ Video error code:', video.error.code);
                    console.error('❌ Video error message:', video.error.message);
                    console.error('❌ Network state:', video.networkState);
                    console.error('❌ Ready state:', video.readyState);
                  }
                  
                  // Try alternative URL on error if not already tried
                  const currentSrc = video.currentSrc || video.src;
                  const altUrl = getAlternativeVideoUrl(selectedVideo);
                  if (currentSrc !== altUrl && !currentSrc.includes(altUrl)) {
                    console.log('🔄 Trying alternative URL:', altUrl);
                    video.src = altUrl;
                    video.load();
                  }
                }}
                onLoadStart={() => console.log('🔄 Video loading started:', getVideoUrl(selectedVideo))}
                onLoadedData={() => console.log('✅ Video loaded successfully:', getVideoUrl(selectedVideo))}
                onCanPlay={() => console.log('✅ Video can play:', getVideoUrl(selectedVideo))}
                onProgress={() => console.log('📊 Video progress update')}
              >
                <source src={getVideoUrl(selectedVideo)} type="video/mp4" />
                <source src={getAlternativeVideoUrl(selectedVideo)} type="video/mp4" />
                <source src={`${API_BASE_URL}/uploads/videos/${selectedVideo.filename.replace(/\s+/g, '%20')}`} type="video/mp4" />
                <source src={`${API_BASE_URL}/uploads/videos/${selectedVideo.filename.replace(/\s+/g, '_')}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-gray-600 mb-2">{selectedVideo.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Category: {selectedVideo.category}</span>
              <span>Views: {selectedVideo.views}</span>
              <span>Uploaded: {formatDate(selectedVideo.uploadedAt)}</span>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testVideoUrl(selectedVideo)}
              >
                Test URL in New Tab
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card 
            key={video.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedVideo?.id === video.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleVideoSelect(video)}
          >
            <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Play className="w-12 h-12 text-blue-600" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <Play className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
              </div>
              
              {video.featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                  Featured
                </Badge>
              )}
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {video.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{video.views} views</span>
                <span>{formatDate(video.uploadedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {videos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Play className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos available</h3>
          <p className="text-gray-600 mb-4">There are no videos to display at the moment.</p>
          <Button onClick={loadVideos} variant="outline">
            Refresh Videos
          </Button>
        </div>
      )}
    </div>
  );
};

export default SimpleVideoGallery;