import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import useHybridVideo from '@/hooks/useHybridVideo'; // DISABLED to fix infinite loop
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Share2,
  Heart,
  Eye,
  Calendar,
  ExternalLink,
  Wifi,
  WifiOff,
  Download,
  HardDrive,
  FileVideo,
  Database,
  Globe,
  CheckCircle
} from 'lucide-react';

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

interface VideoGalleryProps {
  videos?: Video[];
  showUploadButton?: boolean;
  onVideoSelect?: (video: Video) => void;
}

// Default videos if API fails - moved outside component to avoid dependency issues
const defaultVideos: Video[] = [
  {
    id: 'house-cleaning',
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
    id: 'shoe-care',
    title: 'Personal Care & Hygiene',
    description: 'Teaching children proper shoe care and personal hygiene habits for confidence and self-respect.',
    thumbnail: '/placeholder.svg',
    videoUrl: '/static-videos/shoe-care.mp4',
    url: '/static-videos/shoe-care.mp4',
    duration: '2:30',
    views: 189,
    uploadDate: '2024-11-12',
    category: 'Personal Care'
  },
  {
    id: 'pet-care',
    title: 'Pet & Plant Care',
    description: 'Building responsibility and empathy through caring for pets and nurturing living things.',
    thumbnail: '/placeholder.svg',
    videoUrl: '/static-videos/pet-care.mp4',
    url: '/static-videos/pet-care.mp4',
    duration: '4:20',
    views: 167,
    uploadDate: '2024-11-10',
    category: 'Life Skills'
  }
];

// Move API_BASE_URL outside component to avoid re-declaring
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos = [],
  showUploadButton = false,
  onVideoSelect
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  // DISABLED problematic hybrid video hook to fix infinite loop
  // Use simple static approach for now
  const hybridVideos = defaultVideos;
  const hybridLoading = false;
  const isOnline = navigator.onLine;
  const availabilityStatus = {
    staticAvailable: true,
    cacheAvailable: false,
    apiAvailable: false,
    totalVideos: defaultVideos.length
  };
  const refreshVideos = () => console.log('Refresh disabled');
  const validateStaticVideos = () => console.log('Validation disabled');
  const getVideoSource = () => 'static';

  // Current video source for display
  const videoSource = getVideoSource();
  const featuredVideos = videos.length > 0 ? videos : hybridVideos;

  // Update loading state based on hybrid loading
  useEffect(() => {
    setLoading(hybridLoading);
  }, [hybridLoading]);

  // Display videos logic - prioritize provided videos, then hybrid videos
  const displayVideos = featuredVideos.length > 0 ? featuredVideos : defaultVideos;

  const handleVideoClick = (video: Video) => {
    console.log('🎬 Video clicked:', video);
    console.log('📹 Video URL:', video.url || video.videoUrl);
    console.log('🎭 Video thumbnail:', video.thumbnail);
    setSelectedVideo(video);
    setIsPlaying(true); // Auto-play when selected
    setIsMuted(false); // Ensure sound is enabled
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const shareVideo = (video: Video) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.origin + '/videos/' + video.id
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + '/videos/' + video.id);
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
    
    // Convert seconds to mm:ss format
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {/* Offline/Online Status and Video Source Info */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center space-x-4">
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
          
          {/* Video Source Indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {videoSource === 'static' && (
              <>
                <FileVideo className="w-4 h-4 text-blue-500" />
                <span className="text-blue-600">Static Videos</span>
                <Badge variant="outline" className="text-blue-600">Offline Ready</Badge>
              </>
            )}
            {videoSource === 'cache' && (
              <>
                <Database className="w-4 h-4 text-purple-500" />
                <span className="text-purple-600">Cached Videos</span>
              </>
            )}
            {videoSource === 'api' && (
              <>
                <Globe className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Live API</span>
              </>
            )}
            {videoSource === 'default' && (
              <>
                <HardDrive className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Default Videos</span>
              </>
            )}
          </div>

          {/* Availability Status */}
          <div className="flex items-center space-x-1 text-xs">
            {availabilityStatus.staticAvailable && (
              <div title="Static videos available">
                <CheckCircle className="w-3 h-3 text-green-500" />
              </div>
            )}
            {availabilityStatus.cacheAvailable && (
              <div title="Cached videos available">
                <CheckCircle className="w-3 h-3 text-purple-500" />
              </div>
            )}
            {availabilityStatus.apiAvailable && (
              <div title="API available">
                <CheckCircle className="w-3 h-3 text-blue-500" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isOnline && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshVideos}
              className="gap-2"
              disabled={hybridLoading}
            >
              <Download className="w-4 h-4" />
              {hybridLoading ? 'Refreshing...' : 'Refresh Videos'}
            </Button>
          )}
          
          {availabilityStatus.totalVideos > 0 && (
            <div className="text-sm text-gray-600">
              <span>{availabilityStatus.totalVideos} videos available</span>
            </div>
          )}
          
          {!isOnline && displayVideos.length === 0 && (
            <Badge variant="outline" className="text-orange-600">
              No videos available offline
            </Badge>
          )}
          
          {!isOnline && displayVideos.length > 0 && (
            <Badge variant="outline" className="text-green-600">
              Running offline with {displayVideos.length} videos
            </Badge>
          )}
        </div>
      </div>

      {/* Featured Video Player */}
      {selectedVideo && (
        <div className="mb-8">
          <Card className="overflow-hidden">
            {/* Sound Notice */}
            {isMuted && (
              <div className="bg-blue-50 border-b border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <VolumeX className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">Sound is muted</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const video = document.querySelector('video') as HTMLVideoElement;
                      if (video) {
                        video.muted = false;
                        video.volume = 0.8;
                        setIsMuted(false);
                        console.log('🔊 Sound enabled by user');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Volume2 className="w-4 h-4 mr-1" />
                    Enable Sound
                  </Button>
                </div>
              </div>
            )}
            <div className="relative">
              <video 
                key={selectedVideo.id}
                controls 
                className="w-full aspect-video bg-black"
                poster={selectedVideo.thumbnail}
                muted={isMuted}
                autoPlay={isPlaying}
                onError={(e) => {
                  console.error('❌ Video load error:', e);
                  console.error('📹 Failed video URL:', selectedVideo.url || selectedVideo.videoUrl);
                  console.error('📹 Video object:', selectedVideo);
                  const target = e.currentTarget;
                  const error = target.error;
                  if (error) {
                    console.error('🚨 Video error code:', error.code);
                    console.error('🚨 Video error message:', error.message);
                  }
                }}
                onLoadStart={() => {
                  console.log('🔄 Video loading started:', selectedVideo.url || selectedVideo.videoUrl);
                }}
                onCanPlay={() => {
                  console.log('✅ Video can play:', selectedVideo.url || selectedVideo.videoUrl);
                  // Ensure video plays with sound when ready
                  const video = document.querySelector('video[key="' + selectedVideo.id + '"]') as HTMLVideoElement;
                  if (video && isPlaying && !isMuted) {
                    video.muted = false;
                    video.volume = 0.8;
                    console.log('🔊 Setting video volume to 0.8 and unmuting');
                    video.play().catch(err => console.log('Auto-play failed:', err));
                  }
                }}
                onLoadedData={() => {
                  console.log('📊 Video data loaded:', selectedVideo.url || selectedVideo.videoUrl);
                }}
                onPlay={() => {
                  console.log('▶️ Video started playing');
                }}
                onVolumeChange={(e) => {
                  const video = e.currentTarget;
                  console.log('🔊 Volume changed - muted:', video.muted, 'volume:', video.volume);
                }}
              >
                <source 
                  src={selectedVideo.url || selectedVideo.videoUrl} 
                  type={selectedVideo.mediaType || "video/mp4"} 
                />
                <p className="text-white text-center py-8">
                  Your browser does not support the video tag.
                  <a 
                    href={selectedVideo.url || selectedVideo.videoUrl} 
                    className="text-blue-400 underline ml-2" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Download video
                  </a>
                </p>
              </video>
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
                    {(selectedVideo.uploadDate || selectedVideo.uploadedAt) && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedVideo.uploadDate || selectedVideo.uploadedAt!)}</span>
                      </div>
                    )}
                    {selectedVideo.category && (
                      <Badge variant="secondary">{selectedVideo.category}</Badge>
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
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const video = document.querySelector('video') as HTMLVideoElement;
                      if (video) {
                        video.muted = false;
                        video.volume = 0.8;
                        video.currentTime = 0;
                        setIsMuted(false);
                        setIsPlaying(true);
                        video.play().then(() => {
                          console.log('🔊 Playing with sound!');
                        }).catch(err => console.log('Play failed:', err));
                      }
                    }}
                  >
                    <Volume2 className="w-4 h-4 mr-1" />
                    Play with Sound
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
                    console.error('❌ Thumbnail video error for:', video.title, video.url || video.videoUrl);
                    // If poster fails, try to use a placeholder
                    e.currentTarget.poster = '/placeholder.svg';
                    const target = e.currentTarget;
                    const error = target.error;
                    if (error) {
                      console.error('🚨 Thumbnail error code:', error.code);
                      console.error('🚨 Thumbnail error message:', error.message);
                    }
                  }}
                  onLoadStart={() => {
                    console.log('🔄 Thumbnail loading for:', video.title);
                    // Set a timeout to fallback to placeholder if video doesn't load
                    setTimeout(() => {
                      const videoElement = document.querySelector(`video[data-video-id="${video.id}"]`) as HTMLVideoElement;
                      if (videoElement && videoElement.readyState === 0) {
                        videoElement.poster = '/placeholder.svg';
                      }
                    }, 3000);
                  }}
                  onLoadedMetadata={() => {
                    console.log('📊 Thumbnail loaded for:', video.title);
                  }}
                  data-video-id={video.id}
                >
                  <source 
                    src={video.url || video.videoUrl} 
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
                    {video.duration}
                  </div>
                )}

                {/* Category Badge */}
                {video.category && (
                  <div className="absolute top-2 left-2">
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
                    {(video.uploadDate || video.uploadedAt) && (
                      <span>{formatDate(video.uploadDate || video.uploadedAt!)}</span>
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
            <span>{displayVideos.length} featured videos</span>
            <span>
              {displayVideos.reduce((total, video) => total + (video.views || 0), 0)} total views
            </span>
            <span>Updated regularly with new content</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;