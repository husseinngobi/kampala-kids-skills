import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, Grid, List, Play, Star, Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SafeVideoGallery from '@/components/SafeVideoGallery';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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

interface GalleryFilters {
  category: string;
  featured: boolean | null;
  sortBy: 'newest' | 'popular' | 'title';
  search: string;
}

const CATEGORIES = [
  'ALL',
  'CLEANING', 
  'LAUNDRY',
  'GARDENING',
  'DINING',
  'COOKING',
  'MAINTENANCE'
];

const EnhancedGalleryPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  
  const [filters, setFilters] = useState<GalleryFilters>({
    category: 'ALL',
    featured: null,
    sortBy: 'newest',
    search: ''
  });

  const videosPerPage = 12;
  const mountedRef = useRef(true);

  // Fetch videos with safe API call
  const fetchVideos = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: '50', // Get more videos for local filtering
        type: 'videos'
      });

      const response = await fetch(`${API_BASE_URL}/api/gallery/media?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!mountedRef.current) return;

      if (data.success && Array.isArray(data.data)) {
        setVideos(data.data);
        console.log('✅ Gallery videos loaded:', data.data.length);
      } else {
        throw new Error('Invalid API response');
      }

    } catch (error) {
      if (!mountedRef.current) return;
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load videos';
      setError(errorMessage);
      console.error('❌ Gallery fetch error:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Filter and sort videos
  const applyFilters = useCallback(() => {
    let filtered = [...videos];

    // Apply category filter
    if (filters.category !== 'ALL') {
      filtered = filtered.filter(video => video.category === filters.category);
    }

    // Apply featured filter
    if (filters.featured !== null) {
      filtered = filtered.filter(video => video.isFeatured === filters.featured);
    }

    // Apply search filter
    if (filters.search.trim()) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(search) ||
        video.description.toLowerCase().includes(search) ||
        video.category.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredVideos(filtered);
    setTotalPages(Math.ceil(filtered.length / videosPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [videos, filters, videosPerPage]);

  // Get current page videos
  const getCurrentPageVideos = () => {
    const startIndex = (currentPage - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    return filteredVideos.slice(startIndex, endIndex);
  };

  // Effects
  useEffect(() => {
    mountedRef.current = true;
    fetchVideos();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchVideos]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Event handlers
  const handleFilterChange = (key: keyof GalleryFilters, value: string | boolean | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleVideoSelect = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPageVideos = getCurrentPageVideos();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Skills Gallery</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive collection of life skills videos. Learn practical skills 
              that will help you in your daily life.
            </p>
          </div>

          {/* Featured Videos Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Featured Videos</h2>
            <SafeVideoGallery 
              maxVideos={3}
              showFeatured={true}
              autoPlay={false}
              className="mb-8"
            />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search videos..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select 
                value={filters.category} 
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.featured === null ? 'all' : filters.featured.toString()} 
                onValueChange={(value) => handleFilterChange('featured', value === 'all' ? null : value === 'true')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Videos</SelectItem>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Regular</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-md">
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
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
              {filters.category !== 'ALL' && ` in ${filters.category}`}
            </span>
            {totalPages > 1 && (
              <span>Page {currentPage} of {totalPages}</span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading videos...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={fetchVideos} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Videos Grid/List */}
        {!loading && !error && (
          <>
            {currentPageVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No videos found matching your criteria.</p>
                <Button 
                  onClick={() => setFilters({ category: 'ALL', featured: null, sortBy: 'newest', search: '' })}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
              }>
                {currentPageVideos.map((video) => (
                  <VideoCard 
                    key={video.id} 
                    video={video} 
                    viewMode={viewMode}
                    onSelect={handleVideoSelect}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  if (page > totalPages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </div>
  );
};

// Video Card Component
interface VideoCardProps {
  video: VideoItem;
  viewMode: 'grid' | 'list';
  onSelect: (video: VideoItem) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, viewMode, onSelect }) => {
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex">
          <div className="relative w-48 h-32 bg-gray-900 flex-shrink-0">
            <video
              src={video.videoUrl}
              className="w-full h-full object-cover"
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelect(video)}
                className="bg-white/90 hover:bg-white"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
            {video.isFeatured && (
              <Star className="absolute top-2 left-2 h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                {video.title}
              </h3>
              <Badge variant="secondary" className="ml-2">
                {video.category}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {video.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {video.views} views
              </span>
              {video.duration && (
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(video)}>
      <div className="relative aspect-video bg-gray-900">
        <video
          src={video.videoUrl}
          className="w-full h-full object-cover"
          preload="metadata"
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
        {video.isFeatured && (
          <Star className="absolute top-2 left-2 h-4 w-4 text-yellow-500 fill-current" />
        )}
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
          <Badge variant="secondary">{video.category}</Badge>
          <span className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            {video.views}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Video Modal Component
interface VideoModalProps {
  video: VideoItem;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full max-h-full overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-white text-xl font-semibold">{video.title}</h3>
            {video.isFeatured && (
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            )}
            <Badge variant="secondary">{video.category}</Badge>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            ✕
          </Button>
        </div>
        
        <video
          src={video.videoUrl}
          controls
          autoPlay
          className="w-full aspect-video rounded-lg mb-4"
        />
        
        <div className="text-white">
          <p className="text-white/80 mb-4">{video.description}</p>
          <div className="flex items-center space-x-6 text-sm text-white/60">
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {video.views} views
            </span>
            {video.duration && (
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
            <span>Category: {video.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedGalleryPage;