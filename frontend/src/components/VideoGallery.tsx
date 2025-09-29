import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ExternalLink
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
    videoUrl: '/videos/house-cleaning.mp4',
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
    videoUrl: '/videos/shoe-care.mp4',
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
    videoUrl: '/videos/pet-care.mp4',
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
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured videos from backend - run only once on mount
  useEffect(() => {
    let isCancelled = false;

    const fetchFeaturedVideos = async () => {
      if (isCancelled) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/gallery/featured?limit=3&type=video`);
        
        if (!isCancelled && response.ok) {
          const data = await response.json();
          setFeaturedVideos(data.data || []);
        } else if (!isCancelled) {
          console.error('Failed to fetch featured videos');
          setFeaturedVideos(defaultVideos);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching featured videos:', error);
          setFeaturedVideos(defaultVideos);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    // Only fetch if no videos provided as props (on mount only)
    if (videos.length === 0) {
      fetchFeaturedVideos();
    } else {
      setFeaturedVideos(videos);
      setLoading(false);
    }

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  // Update videos when prop changes
  useEffect(() => {
    if (videos.length > 0) {
      setFeaturedVideos(videos);
      setLoading(false);
    }
  }, [videos]);

  const displayVideos = featuredVideos.length > 0 ? featuredVideos : defaultVideos;

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
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
      {/* Featured Video Player */}
      {selectedVideo && (
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="relative">
              <video 
                key={selectedVideo.id}
                controls 
                className="w-full aspect-video bg-black"
                poster={selectedVideo.thumbnail}
                muted={isMuted}
                autoPlay={isPlaying}
              >
                <source 
                  src={selectedVideo.url || selectedVideo.videoUrl} 
                  type={selectedVideo.mediaType || "video/mp4"} 
                />
                Your browser does not support the video tag.
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