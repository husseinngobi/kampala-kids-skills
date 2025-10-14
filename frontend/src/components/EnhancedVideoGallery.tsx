import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VideoPlayer from '@/components/VideoPlayer';
import useFeaturedVideos from '@/hooks/useFeaturedVideos';
// DISABLED TO FIX INFINITE LOOP - import useHybridVideo from '@/hooks/useHybridVideo';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Share2,
  Eye,
  Calendar,
  ExternalLink,
  Wifi,
  WifiOff,
  HardDrive,
  FileVideo,
  Database,
  Globe,
  CheckCircle
} from 'lucide-react';

// Unified video interface that includes all possible properties
interface VideoItem {
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
  isFeatured?: boolean;
  staticPath?: string;
  filename?: string;
}

interface EnhancedVideoGalleryProps {
  showUploadButton?: boolean;
  onVideoSelect?: (video: VideoItem) => void;
  maxFeaturedVideos?: number;
}

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const EnhancedVideoGallery: React.FC<EnhancedVideoGalleryProps> = ({
  showUploadButton = false,
  onVideoSelect,
  maxFeaturedVideos = 3
}) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load featured videos (always available offline)
  const { 
    featuredVideos, 
    isLoading: featuredLoading, 
    error: featuredError,
    refreshFeaturedVideos 
  } = useFeaturedVideos();

  // Load dynamic gallery videos from backend (when online) - DISABLED TO FIX INFINITE LOOP
  // const { 
  //   videos: galleryVideos, 
  //   isLoading: galleryLoading,
  //   refreshVideos: refreshGalleryVideos
  // } = useHybridVideo(API_BASE_URL);
  
  // Use static data instead to prevent infinite loop
  const galleryVideos = React.useMemo(() => [] as VideoItem[], []);
  const galleryLoading = false;
  const refreshGalleryVideos = () => {};

  // Monitor online status
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Combine featured and gallery videos, removing duplicates
  const allVideos = React.useMemo(() => {
    const featured = featuredVideos.slice(0, maxFeaturedVideos) as VideoItem[];
    const gallery = galleryVideos.filter(video => 
      !featured.some(fv => fv.id === video.id)
    ) as VideoItem[];
    return [...featured, ...gallery] as VideoItem[];
  }, [featuredVideos, galleryVideos, maxFeaturedVideos]);

  // Display videos - prioritize featured videos
  const displayVideos: VideoItem[] = allVideos.length > 0 ? allVideos : (featuredVideos as VideoItem[]);

  const handleVideoClick = (video: VideoItem) => {
    console.log('🎬 Video clicked:', video);
    console.log('📹 Video URL:', video.url || video.videoUrl || video.staticPath);
    setSelectedVideo(video);
    setIsPlaying(true);
    setIsMuted(false);
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  const shareVideo = (video: VideoItem) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: `${window.location.origin}/videos/${video.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/videos/${video.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (duration: string | number | undefined) => {
    if (!duration) return '';
    if (typeof duration === 'string') return duration;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVideoSource = (video: VideoItem) => {
    return video.staticPath || video.url || video.videoUrl || '';
  };

  const loading = featuredLoading || galleryLoading;

  return (
    <div className="w-full">
      {/* Status and Source Indicators */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center space-x-4">
          {/* Online/Offline Status */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">Offline Mode</span>
              </>
            )}
          </div>
          
          {/* Video Sources */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileVideo className="w-4 h-4 text-blue-500" />
            <span className="text-blue-600">Featured Videos</span>
            <Badge variant="outline" className="text-blue-600">Always Available</Badge>
            
            {isOnline && galleryVideos.length > 0 && (
              <>
                <Globe className="w-4 h-4 text-green-500" />
                <span className="text-green-600">+ Gallery Videos</span>
              </>
            )}
          </div>
        </div>

        {/* Video Count */}
        <div className="flex items-center space-x-1 text-sm">
          <span>{displayVideos.length} videos available</span>
          {!isOnline && (
            <Badge variant="outline" className="text-orange-600 ml-2">
              Offline Ready
            </Badge>
          )}
        </div>
      </div>

      {/* Featured Video Player */}
      {selectedVideo && (
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="relative">
              <VideoPlayer
                src={getVideoSource(selectedVideo)}
                title={selectedVideo.title}
                poster={selectedVideo.thumbnail}
                autoPlay={isPlaying}
                muted={isMuted}
                controls={true}
                className="w-full aspect-video bg-black"
                onError={(error) => {
                  console.error('❌ Enhanced video player error:', error);
                  console.error('📹 Failed video URL:', getVideoSource(selectedVideo));
                }}
                onLoadStart={() => {
                  console.log('🔄 Enhanced video loading started:', getVideoSource(selectedVideo));
                }}
                onCanPlay={() => {
                  console.log('✅ Enhanced video can play:', getVideoSource(selectedVideo));
                }}
                onPlay={() => {
                  console.log('▶️ Enhanced video started playing');
                  setIsPlaying(true);
                }}
                onPause={() => {
                  console.log('⏸️ Enhanced video paused');
                  setIsPlaying(false);
                }}
              />
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {selectedVideo.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedVideo.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {selectedVideo.views && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{selectedVideo.views} views</span>
                      </div>
                    )}
                    {selectedVideo.uploadDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedVideo.uploadDate)}</span>
                      </div>
                    )}
                    {selectedVideo.category && (
                      <Badge variant="secondary">{selectedVideo.category}</Badge>
                    )}
                    {selectedVideo.isFeatured === true && (
                      <Badge variant="default" className="bg-blue-600">Featured</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareVideo(selectedVideo)}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayVideos.map((video) => (
          <Card 
            key={video.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleVideoClick(video)}
          >
            <div className="relative overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                {/* Video Thumbnail */}
                <video
                  className="w-full h-full object-cover"
                  poster={video.thumbnail}
                  muted
                  preload="metadata"
                  onError={(e) => {
                    console.error('❌ Thumbnail video error for:', video.title);
                    e.currentTarget.poster = '/placeholder.svg';
                  }}
                >
                  <source 
                    src={getVideoSource(video)} 
                    type={video.mediaType || "video/mp4"} 
                  />
                </video>
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}

                {/* Featured Badge */}
                {video.isFeatured === true && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="text-xs bg-blue-600">
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Category Badge */}
                {video.category && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {video.category}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h4 className="font-semibold text-lg mb-2 text-primary group-hover:text-primary/80 transition-colors">
                  {video.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {video.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    {video.views && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{video.views}</span>
                      </div>
                    )}
                    {video.uploadDate && (
                      <span>{formatDate(video.uploadDate)}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      shareVideo(video);
                    }}
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}

        {/* Upload Button Card */}
        {showUploadButton && (
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-dashed border-2 border-gray-300 hover:border-primary">
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Play className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Upload New Video</h4>
                <p className="text-sm text-gray-500">Add programme highlights and activities</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* View All Gallery Button */}
      <div className="mt-8 text-center">
        <Link to="/gallery">
          <Button size="lg" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            View All Gallery
          </Button>
        </Link>
      </div>

      {/* Video Stats Summary */}
      {displayVideos.length > 0 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <span>{featuredVideos.length} featured videos</span>
            {isOnline && galleryVideos.length > 0 && (
              <span>{galleryVideos.length} gallery videos</span>
            )}
            <span>
              {displayVideos.reduce((total, video) => total + (video.views || 0), 0)} total views
            </span>
            <span>Updated regularly with new content</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <Database className="w-5 h-5 animate-pulse" />
            <span>Loading videos...</span>
          </div>
        </div>
      )}

      {/* Error States */}
      {featuredError && !isOnline && (
        <div className="text-center py-8">
          <div className="text-orange-600">
            ⚠️ Unable to load featured videos while offline
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoGallery;