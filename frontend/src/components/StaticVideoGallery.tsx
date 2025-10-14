import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play,
  Eye,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';

interface StaticVideoGalleryProps {
  maxVideos?: number;
  showFeaturedOnly?: boolean;
}

interface Video {
  id: string;
  title: string;
  description: string;
  filename: string;
  url: string;
  category: string;
  views: number;
  uploadedAt: string;
  duration: string;
}

const StaticVideoGallery: React.FC<StaticVideoGalleryProps> = ({
  maxVideos = 3,
  showFeaturedOnly = false
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Static video data - NO API CALLS AT ALL
  const staticVideos = [
    {
      id: '1',
      title: 'House Cleaning Skills',
      description: 'Children learning essential house cleaning techniques',
      filename: 'house-cleaning.mp4',
      url: 'http://localhost:5000/uploads/videos/house-cleaning.mp4',
      category: 'House Keeping',
      views: 156,
      uploadedAt: '2024-01-15T10:00:00Z',
      duration: '3:24'
    },
    {
      id: '2',
      title: 'Pet Care Basics',
      description: 'Kids learning how to care for pets responsibly',
      filename: 'pet-care.mp4',
      url: 'http://localhost:5000/uploads/videos/pet-care.mp4',
      category: 'Pet Care',
      views: 89,
      uploadedAt: '2024-01-20T14:30:00Z',
      duration: '2:45'
    },
    {
      id: '3',
      title: 'Shoe Care Workshop',
      description: 'Teaching children proper shoe cleaning and care',
      filename: 'shoe-care.mp4',
      url: 'http://localhost:5000/uploads/videos/shoe-care.mp4',
      category: 'Personal Care',
      views: 234,
      uploadedAt: '2024-01-25T09:15:00Z',
      duration: '4:12'
    }
  ];

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setVideoError(null);
    console.log('🎥 Selected video:', video.title);
    console.log('🔗 Video URL:', video.url);
  };

  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = event.target as HTMLVideoElement;
    let errorMessage = 'Unable to load video. ';
    
    if (video.error) {
      switch (video.error.code) {
        case 1:
          errorMessage += 'Video loading was aborted.';
          break;
        case 2:
          errorMessage += 'Network error occurred.';
          break;
        case 3:
          errorMessage += 'Video format not supported.';
          break;
        case 4:
          errorMessage += 'Video source not found.';
          break;
        default:
          errorMessage += 'Unknown error occurred.';
          break;
      }
    }
    
    setVideoError(errorMessage);
    console.error('❌ Video failed to load:', selectedVideo?.url);
    console.error('❌ Error details:', video.error);
  };

  const handleVideoLoad = () => {
    setVideoError(null);
    console.log('✅ Video loaded successfully:', selectedVideo?.title);
  };

  const testVideoConnection = async (url: string) => {
    try {
      console.log('🔍 Testing video URL:', url);
      const response = await fetch(url, { method: 'HEAD' });
      console.log('📡 Video URL response:', response.status, response.statusText);
      console.log('📄 Response headers:', Object.fromEntries(response.headers.entries()));
      return response.ok;
    } catch (error) {
      console.error('❌ Video URL test failed:', error);
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  console.log('🎬 StaticVideoGallery rendered with inline video player');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Featured Video Gallery
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Watch real children developing confidence and practical skills in our hands-on learning environment.
        </p>
        <Badge variant="secondary" className="mt-4">
          Static Content - Enhanced Player
        </Badge>
      </div>

      {/* Video Player */}
      {selectedVideo && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">{selectedVideo.title}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedVideo(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg mb-4 relative">
              {videoError ? (
                <div className="flex items-center justify-center h-full text-white bg-gray-800 rounded-lg">
                  <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p className="text-lg mb-2">Video Unavailable</p>
                    <p className="text-sm text-gray-300 mb-4">{videoError}</p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testVideoConnection(selectedVideo.url)}
                        className="text-white border-white hover:bg-white hover:text-black"
                      >
                        Test Connection
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedVideo.url, '_blank')}
                        className="text-white border-white hover:bg-white hover:text-black"
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  onError={handleVideoError}
                  onLoadedData={handleVideoLoad}
                  preload="metadata"
                  crossOrigin="anonymous"
                  playsInline
                >
                  <source src={selectedVideo.url} type="video/mp4" />
                  <source src={selectedVideo.url.replace('.mp4', '.webm')} type="video/webm" />
                  <source src={selectedVideo.url.replace('.mp4', '.ogg')} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            <p className="text-gray-600 mb-2">{selectedVideo.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Category: {selectedVideo.category}</span>
              <span>Views: {selectedVideo.views}</span>
              <span>Uploaded: {formatDate(selectedVideo.uploadedAt)}</span>
              <span>Duration: {selectedVideo.duration}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staticVideos.slice(0, maxVideos).map((video) => (
          <Card key={video.id} className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <CardHeader className="pb-3" onClick={() => handleVideoSelect(video)}>
              <div className="relative">
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                  <Play className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                {/* Duration Badge */}
                <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">
                  {video.duration}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleVideoSelect(video)}>
                {video.title}
              </CardTitle>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {video.description}
              </p>
              
              {/* Video Meta */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{video.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(video.uploadedAt)}</span>
                </div>
              </div>
              
              {/* Category */}
              <Badge variant="outline" className="text-xs mb-3">
                {video.category}
              </Badge>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleVideoSelect(video)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Play Video
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(video.url, '_blank')}
                  className="text-xs px-2"
                >
                  New Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Message */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          These are just a few examples of the hands-on skills your child will master in our programme.
        </p>
      </div>
    </div>
  );
};

export default StaticVideoGallery;