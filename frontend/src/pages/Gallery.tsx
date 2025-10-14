import { useState, useEffect, useCallback } from 'react';
import { Play, Eye, Filter, Grid, List, Search, X, Volume2, VolumeX, Maximize, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  views: number;
  isFeatured: boolean;
  uploadedAt: string;
  type: 'video' | 'image';
  mediaType: string;
}

interface Category {
  value: string;
  label: string;
  type: string;
}

const Gallery = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mediaType, setMediaType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchGalleryContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        category: selectedCategory,
        type: mediaType,
        limit: '50'
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`${API_BASE_URL}/api/gallery/media?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setMediaItems(data.data);
      } else {
        throw new Error(data.message || 'Failed to load gallery content');
      }
    } catch (error) {
      console.error('Error fetching gallery content:', error);
      setError(error instanceof Error ? error.message : 'Failed to load gallery content');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, mediaType, searchTerm, API_BASE_URL]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gallery/categories`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          setCategories([
            { value: 'all', label: 'All Categories', type: 'all' },
            ...data.data
          ]);
        }
      } else {
        setCategories([
          { value: 'all', label: 'All Categories', type: 'all' },
          { value: 'LEARNING', label: 'Learning', type: 'category' },
          { value: 'DINING', label: 'Dining', type: 'category' },
          { value: 'ACTIVITIES', label: 'Activities', type: 'category' },
          { value: 'CLEANING', label: 'Cleaning', type: 'category' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        { value: 'all', label: 'All Categories', type: 'all' },
        { value: 'LEARNING', label: 'Learning', type: 'category' },
        { value: 'DINING', label: 'Dining', type: 'category' },
        { value: 'ACTIVITIES', label: 'Activities', type: 'category' },
        { value: 'CLEANING', label: 'Cleaning', type: 'category' }
      ]);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchGalleryContent();
  }, [fetchGalleryContent]);

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = mediaType === 'all' || 
      (mediaType === 'videos' && item.type === 'video') ||
      (mediaType === 'images' && item.type === 'image');
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Separate videos and images for organized display
  const videos = filteredItems.filter(item => item.type === 'video');
  const images = filteredItems.filter(item => item.type === 'image');

  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item);
    if (item.type === 'video') {
      setPlayingVideo(item.id);
      setIsVideoMuted(false); // Ensure sound is enabled when video is clicked
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (duration: number): string => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            Unable to load gallery
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={fetchGalleryContent}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Skills Gallery
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our collection of educational videos and images showcasing essential life skills
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search videos and images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mediaType} onValueChange={setMediaType}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="videos">Videos</SelectItem>
            <SelectItem value="images">Images</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          {videos.length > 0 && (
            <span className="ml-2">
              • <span className="font-medium">{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
            </span>
          )}
          {images.length > 0 && (
            <span className="ml-2">
              • <span className="font-medium">{images.length} image{images.length !== 1 ? 's' : ''}</span>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="ml-2">
              in <Badge variant="secondary">{categories.find(c => c.value === selectedCategory)?.label}</Badge>
            </span>
          )}
        </p>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items match your current filters</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Videos Section */}
          {videos.length > 0 && (mediaType === 'all' || mediaType === 'videos') && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Educational Videos</h2>
                  <p className="text-gray-600">Watch and learn essential life skills through our video tutorials</p>
                </div>
              </div>
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {videos.map((item) => (
                  <Card key={item.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative" onClick={() => handleItemClick(item)}>
                        <div className="relative h-48 bg-gray-900 rounded-t-lg overflow-hidden">
                          <video
                            className="w-full h-full object-cover"
                            poster={item.thumbnail}
                            preload="metadata"
                            onError={(e) => {
                              console.error('🎥 Grid video failed to load:', item.url);
                              console.error('🎥 Grid video error:', e);
                            }}
                            onLoadedMetadata={() => console.log('🎥 Grid video metadata loaded:', item.url)}
                          >
                            <source 
                              src={item.url} 
                              type={item.mediaType || "video/mp4"} 
                            />
                          </video>
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-12 w-12 text-white" fill="currentColor" />
                          </div>
                          {item.duration && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(item.duration)}
                            </div>
                          )}
                          {item.isFeatured && (
                            <Badge className="absolute top-2 left-2">Featured</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <Badge variant="outline">{categories.find(c => c.value === item.category)?.label}</Badge>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatViews(item.views)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Images Section */}
          {images.length > 0 && (mediaType === 'all' || mediaType === 'images') && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
                  <p className="text-gray-600">Visual demonstrations and examples of life skills in action</p>
                </div>
              </div>
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {images.map((item) => (
                  <Card key={item.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative" onClick={() => handleItemClick(item)}>
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.isFeatured && (
                            <Badge className="absolute top-2 left-2">Featured</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <Badge variant="outline">{categories.find(c => c.value === item.category)?.label}</Badge>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatViews(item.views)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedItem?.title}</span>
              <div className="flex items-center space-x-2">
                {selectedItem?.type === 'video' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsVideoMuted(!isVideoMuted)}
                      className="h-8 w-8 p-0"
                    >
                      {isVideoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const video = document.querySelector('#modal-video') as HTMLVideoElement;
                        if (video && video.requestFullscreen) {
                          video.requestFullscreen();
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                {selectedItem.type === 'video' ? (
                  <div className="relative">
                    {videoError && (
                      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                        <div className="text-center text-white p-6">
                          <div className="text-red-400 mb-2">❌ Video Error</div>
                          <div className="mb-4">{videoError}</div>
                          <Button 
                            onClick={() => {
                              setVideoError(null);
                              const video = document.querySelector('#modal-video') as HTMLVideoElement;
                              if (video) video.load();
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Try Again
                          </Button>
                        </div>
                      </div>
                    )}
                    <video
                      id="modal-video"
                      className="w-full h-full aspect-video"
                      controls
                      autoPlay
                      muted={isVideoMuted}
                      poster={selectedItem.thumbnail}
                      onError={(e) => {
                        console.error('🎥 Video failed to load:', selectedItem.url);
                      const target = e.currentTarget as HTMLVideoElement;
                      const error = target.error;
                      let errorMessage = 'Unknown video error';
                      
                      if (error) {
                        console.error('🚨 Video Error Details:');
                        console.error('📍 Error Code:', error.code);
                        console.error('📍 Error Message:', error.message);
                        console.error('📍 Video URL:', selectedItem.url);
                        console.error('📍 Video Object:', selectedItem);
                        
                        switch (error.code) {
                          case error.MEDIA_ERR_ABORTED:
                            errorMessage = 'Video loading was aborted by user';
                            break;
                          case error.MEDIA_ERR_NETWORK:
                            errorMessage = 'Network error while loading video - check your connection';
                            break;
                          case error.MEDIA_ERR_DECODE:
                            errorMessage = 'Video format not supported by your browser';
                            break;
                          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                            errorMessage = 'Video source not found or not supported';
                            break;
                          default:
                            errorMessage = `Video error (code ${error.code}): ${error.message || 'Unknown error'}`;
                        }
                      } else {
                        console.error('🚨 Video error with no error object:', e);
                        errorMessage = 'Video failed to load - unknown error';
                      }
                      setVideoError(errorMessage);
                      }}
                      onLoadStart={() => {
                        console.log('🔄 Video loading started:', selectedItem.url);
                        console.log('🎞️ Video details:', {
                          title: selectedItem.title,
                          type: selectedItem.type,
                          mediaType: selectedItem.mediaType,
                          url: selectedItem.url
                        });
                        setVideoError(null);
                      }}
                      onCanPlay={() => {
                        console.log('✅ Video can play:', selectedItem.url);
                        // Ensure video plays with sound when ready
                        const video = document.querySelector('#modal-video') as HTMLVideoElement;
                        if (video && !isVideoMuted) {
                          video.muted = false;
                          video.volume = 0.8;
                          console.log('🔊 Setting modal video volume to 0.8 and unmuting');
                        }
                      }}
                      onPlay={() => console.log('▶️ Video started playing')}
                      onVolumeChange={(e) => {
                        const video = e.currentTarget;
                        console.log('🔊 Modal video volume changed - muted:', video.muted, 'volume:', video.volume);
                      }}
                      onLoadedData={() => {
                        console.log('📊 Video data loaded:', selectedItem.url);
                      }}
                    >
                      <source 
                        src={selectedItem.url} 
                        type={selectedItem.mediaType || "video/mp4"} 
                      />
                      <p className="text-white text-center py-8">
                        Your browser does not support the video tag. 
                        <a href={selectedItem.url} className="text-blue-400 underline ml-2" target="_blank" rel="noopener noreferrer">
                          Download video
                        </a>
                      </p>
                    </video>
                  </div>
                ) : (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="w-full h-auto max-h-[60vh] object-contain"
                    onError={(e) => {
                      console.error('🖼️ Image failed to load:', selectedItem.url);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                    onLoad={() => console.log('🖼️ Image loaded successfully:', selectedItem.url)}
                  />
                )}
              </div>
              
              {selectedItem.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">About this {selectedItem.type}</h4>
                  <p className="text-gray-600">{selectedItem.description}</p>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Badge variant="secondary" className="text-sm">
                  {categories.find(c => c.value === selectedItem.category)?.label || selectedItem.category}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {selectedItem.type?.toUpperCase()}
                </Badge>
                {selectedItem.isFeatured && (
                  <Badge className="bg-orange-100 text-orange-800 text-sm">
                    ⭐ Featured Content
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-gray-500">
                  <Eye className="h-4 w-4" />
                  {formatViews(selectedItem.views)} views
                </div>
                {selectedItem.duration && (
                  <div className="text-gray-500">
                    🕒 {formatDuration(selectedItem.duration)}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedItem?.url) {
                      window.open(selectedItem.url, '_blank');
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;