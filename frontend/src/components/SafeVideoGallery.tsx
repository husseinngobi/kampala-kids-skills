import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Request limiting configuration
const MAX_REQUESTS_PER_MINUTE = 3;
const REQUEST_COOLDOWN = 20000; // 20 seconds

// Global request tracking to prevent infinite loops
const requestHistory = new Map<string, number[]>();
const activeRequests = new Set<string>();

interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  videoUrl: string;
  type: 'video';
  isFeatured: boolean;
  category: string;
  views: number;
  duration?: number;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

interface SafeVideoGalleryProps {
  maxVideos?: number;
  showFeatured?: boolean;
  autoPlay?: boolean;
  className?: string;
}

interface ApiResponse {
  success: boolean;
  data: VideoItem[];
  count: number;
  source: string;
  message?: string;
}

// Rate limiting utility
const canMakeRequest = (endpoint: string): boolean => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  if (!requestHistory.has(endpoint)) {
    requestHistory.set(endpoint, []);
  }
  
  const history = requestHistory.get(endpoint)!;
  const recentRequests = history.filter(time => time > oneMinuteAgo);
  requestHistory.set(endpoint, recentRequests);
  
  return recentRequests.length < MAX_REQUESTS_PER_MINUTE;
};

const recordRequest = (endpoint: string): void => {
  const now = Date.now();
  if (!requestHistory.has(endpoint)) {
    requestHistory.set(endpoint, []);
  }
  requestHistory.get(endpoint)!.push(now);
};

const SafeVideoGallery: React.FC<SafeVideoGalleryProps> = ({
  maxVideos = 3,
  showFeatured = false,
  autoPlay = false,
  className = ''
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState<Record<string, boolean>>({});
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Safe API fetch with comprehensive error handling
  const fetchVideos = useCallback(async (): Promise<void> => {
    // Prevent rapid successive calls
    const now = Date.now();
    if (now - lastFetchTime < REQUEST_COOLDOWN) {
      console.log('🛡️ Request blocked: Too soon since last fetch');
      return;
    }

    const endpoint = `${API_BASE_URL}/api/gallery/media`;
    const requestKey = `${endpoint}?limit=${maxVideos}&type=videos${showFeatured ? '&featured=true' : ''}`;
    
    // Check rate limits
    if (!canMakeRequest(requestKey)) {
      setError('Rate limit exceeded. Please wait before loading more videos.');
      console.log('🚫 Request blocked: Rate limit exceeded');
      return;
    }

    // Check if request is already in progress
    if (activeRequests.has(requestKey)) {
      console.log('🔄 Request already in progress, skipping duplicate');
      return;
    }

    if (!mountedRef.current) {
      console.log('🛑 Component unmounted, skipping request');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      activeRequests.add(requestKey);
      recordRequest(requestKey);
      setLastFetchTime(now);

      console.log('🎬 Fetching videos:', requestKey);
      
      const params = new URLSearchParams({
        limit: maxVideos.toString(),
        type: 'videos'
      });
      
      if (showFeatured) {
        params.append('featured', 'true');
      }

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (!mountedRef.current) return;

      if (data.success && Array.isArray(data.data)) {
        setVideos(data.data.slice(0, maxVideos));
        console.log('✅ Videos loaded successfully:', data.data.length);
      } else {
        throw new Error(data.message || 'Invalid API response');
      }

    } catch (error) {
      if (!mountedRef.current) return;
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load videos';
      setError(errorMessage);
      console.error('❌ Video fetch error:', error);
      
      // Fallback to static content on error
      setVideos([]);
      
    } finally {
      activeRequests.delete(requestKey);
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [maxVideos, showFeatured, lastFetchTime]);

  // Safe effect with cleanup
  useEffect(() => {
    mountedRef.current = true;
    
    // Delay initial fetch to prevent rapid mounting/unmounting issues
    fetchTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && videos.length === 0) {
        fetchVideos();
      }
    }, 500);

    return () => {
      mountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      // Clear any active requests for this component
      activeRequests.clear();
    };
  }, [fetchVideos, videos.length]);

  // Video control handlers
  const handlePlayPause = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    if (video.paused) {
      video.play().catch(error => {
        console.error('Play error:', error);
      });
      setIsPlaying(prev => ({ ...prev, [videoId]: true }));
    } else {
      video.pause();
      setIsPlaying(prev => ({ ...prev, [videoId]: false }));
    }
  };

  const handleMuteToggle = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(prev => ({ ...prev, [videoId]: video.muted }));
  };

  const handleVideoClick = (video: VideoItem) => {
    setCurrentVideo(video);
  };

  const handleRetry = () => {
    setError(null);
    setLastFetchTime(0); // Reset cooldown for retry
    fetchVideos();
  };

  // Video event handlers
  const handleVideoPlay = (videoId: string) => {
    setIsPlaying(prev => ({ ...prev, [videoId]: true }));
  };

  const handleVideoPause = (videoId: string) => {
    setIsPlaying(prev => ({ ...prev, [videoId]: false }));
  };

  const handleVideoError = (videoId: string, error: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video playback error:', videoId, error);
  };

  return (
    <div className={`safe-video-gallery ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {showFeatured ? 'Featured Videos' : 'Skills Videos'}
        </h2>
        <p className="text-gray-600">
          Learn practical life skills through our video tutorials
        </p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={handleRetry}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading videos...</span>
        </div>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No videos available at the moment.</p>
          <Button variant="outline" onClick={handleRetry} className="mt-4">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="relative aspect-video bg-gray-900">
              <video
                ref={(el) => {
                  if (el) videoRefs.current[video.id] = el;
                }}
                src={video.videoUrl}
                poster={video.url}
                className="w-full h-full object-cover"
                onPlay={() => handleVideoPlay(video.id)}
                onPause={() => handleVideoPause(video.id)}
                onError={(e) => handleVideoError(video.id, e)}
                controls={false}
                preload="metadata"
                muted={isMuted[video.id] || false}
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePlayPause(video.id)}
                    className="bg-white/90 hover:bg-white"
                  >
                    {isPlaying[video.id] ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleMuteToggle(video.id)}
                    className="bg-white/90 hover:bg-white"
                  >
                    {isMuted[video.id] ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleVideoClick(video)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Featured Badge */}
              {video.isFeatured && (
                <div className="absolute top-2 left-2">
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Featured
                  </span>
                </div>
              )}

              {/* Duration Badge */}
              {video.duration && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {video.category}
                </span>
                <span>{video.views} views</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Modal for Fullscreen */}
      {currentVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-semibold">{currentVideo.title}</h3>
              <Button
                variant="ghost"
                onClick={() => setCurrentVideo(null)}
                className="text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </div>
            <video
              src={currentVideo.videoUrl}
              controls
              autoPlay
              className="w-full aspect-video"
            />
            <p className="text-white/80 mt-4">{currentVideo.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafeVideoGallery;