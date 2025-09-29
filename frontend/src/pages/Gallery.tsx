import { useState, useEffect, useCallback } from 'react';
import { Play, Eye, Filter, Grid, List, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

      const response = await fetch(`${API_BASE_URL}/api/gallery/media?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery content');
      }

      const data = await response.json();
      setMediaItems(data.data || []);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Gallery fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, mediaType, searchTerm, API_BASE_URL]);

  useEffect(() => {
    fetchGalleryContent();
  }, [fetchGalleryContent]);

  const handleItemClick = async (item: MediaItem) => {
    // Track view
    try {
      await fetch(`${API_BASE_URL}/api/gallery/media/${item.id}`, { method: 'GET' });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
    
    setSelectedItem(item);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const filteredItems = mediaItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Skills Gallery
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our collection of educational videos and images showcasing essential life skills
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search videos and images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
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

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          {selectedCategory !== 'all' && (
            <span className="ml-2">
              in <Badge variant="secondary">{categories.find(c => c.value === selectedCategory)?.label}</Badge>
            </span>
          )}
        </p>
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items match your current filters</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredItems.map((item) => (
            <Card key={item.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative" onClick={() => handleItemClick(item)}>
                  {item.type === 'video' ? (
                    <div className="relative h-48 bg-gray-900 rounded-t-lg overflow-hidden">
                      <video
                        className="w-full h-full object-cover"
                        poster={item.thumbnail}
                        preload="metadata"
                      >
                        <source src={`${API_BASE_URL}${item.url}`} type={item.mediaType} />
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
                  ) : (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={`${API_BASE_URL}${item.url}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.isFeatured && (
                        <Badge className="absolute top-2 left-2">Featured</Badge>
                      )}
                    </div>
                  )}
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
      )}

      {/* Media Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedItem?.title}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItem(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {selectedItem.type === 'video' ? (
                  <video
                    className="w-full h-full"
                    controls
                    autoPlay
                    poster={selectedItem.thumbnail}
                  >
                    <source src={`${API_BASE_URL}${selectedItem.url}`} type={selectedItem.mediaType} />
                  </video>
                ) : (
                  <img
                    src={`${API_BASE_URL}${selectedItem.url}`}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              {selectedItem.description && (
                <p className="text-gray-600">{selectedItem.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <Badge>{categories.find(c => c.value === selectedItem.category)?.label}</Badge>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatViews(selectedItem.views)} views
                </div>
                {selectedItem.duration && (
                  <span>{formatDuration(selectedItem.duration)}</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;