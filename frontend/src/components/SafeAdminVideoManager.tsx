import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  Edit, 
  Save, 
  X, 
  Play, 
  Eye, 
  AlertCircle, 
  CheckCircle,
  Video,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Rate limiting to prevent infinite loops
const MAX_REQUESTS_PER_MINUTE = 5;
const REQUEST_COOLDOWN = 12000; // 12 seconds
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

interface VideoStats {
  totalVideos: number;
  featuredVideos: number;
  totalViews: number;
  averageViews: number;
}

const SafeAdminVideoManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [stats, setStats] = useState<VideoStats>({ totalVideos: 0, featuredVideos: 0, totalViews: 0, averageViews: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Rate limiting function
  const canMakeRequest = (requestKey: string): boolean => {
    const now = Date.now();
    const history = requestHistory.get(requestKey) || [];
    const recentRequests = history.filter(timestamp => now - timestamp < 60000); // 1 minute

    if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
      return false;
    }

    if (activeRequests.has(requestKey)) {
      return false;
    }

    recentRequests.push(now);
    requestHistory.set(requestKey, recentRequests);
    return true;
  };

  // Fetch videos with rate limiting
  const fetchVideos = async () => {
    const requestKey = 'fetch-videos';
    
    if (!canMakeRequest(requestKey)) {
      setError('Please wait before making another request to prevent system overload.');
      return;
    }

    setLoading(true);
    setError(null);
    activeRequests.add(requestKey);

    try {
      console.log('🔧 Admin: Fetching videos for management');
      const response = await fetch(`${API_BASE_URL}/api/gallery/media`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setVideos(data.data);
        
        // Calculate stats
        const totalVideos = data.data.length;
        const featuredVideos = data.data.filter((v: VideoItem) => v.isFeatured).length;
        const totalViews = data.data.reduce((sum: number, v: VideoItem) => sum + v.views, 0);
        const averageViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;
        
        setStats({ totalVideos, featuredVideos, totalViews, averageViews });
        console.log(`🔧 Admin: Loaded ${totalVideos} videos for management`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('🔧 Admin: Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
      activeRequests.delete(requestKey);
    }
  };

  // Mock update function (replace with actual API when backend supports it)
  const updateVideo = async (videoId: string, updates: Partial<VideoItem>) => {
    const requestKey = `update-${videoId}`;
    
    if (!canMakeRequest(requestKey)) {
      setError('Please wait before making another update.');
      return;
    }

    try {
      console.log('🔧 Admin: Updating video:', videoId, updates);
      
      // For now, update locally (replace with actual API call later)
      setVideos(prev => prev.map(video => 
        video.id === videoId ? { ...video, ...updates } : video
      ));
      
      setSuccess(`Video "${updates.title || 'video'}" updated successfully!`);
      setEditingVideo(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('🔧 Admin: Error updating video:', err);
      setError(err instanceof Error ? err.message : 'Failed to update video');
    }
  };

  useEffect(() => {
    // Define the fetch function inside useEffect to avoid dependency issues
    const loadVideos = async () => {
      const requestKey = 'fetch-videos';
      
      if (!canMakeRequest(requestKey)) {
        setError('Please wait before making another request to prevent system overload.');
        return;
      }

      setLoading(true);
      setError(null);
      activeRequests.add(requestKey);

      try {
        console.log('🔧 Admin: Fetching videos for management');
        const response = await fetch(`${API_BASE_URL}/api/gallery/media`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setVideos(data.data);
          
          // Calculate stats
          const totalVideos = data.data.length;
          const featuredVideos = data.data.filter((v: VideoItem) => v.isFeatured).length;
          const totalViews = data.data.reduce((sum: number, v: VideoItem) => sum + v.views, 0);
          const averageViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;
          
          setStats({ totalVideos, featuredVideos, totalViews, averageViews });
          console.log(`🔧 Admin: Loaded ${totalVideos} videos for management`);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('🔧 Admin: Error fetching videos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load videos');
      } finally {
        setLoading(false);
        activeRequests.delete(requestKey);
      }
    };

    loadVideos();
  }, []); // Empty dependency array is fine since we define the function inside

  const categories = ['HOUSE_CLEANING', 'PET_CARE', 'SHOE_CARE', 'LAUNDRY', 'CLEANING', 'GARDENING'];
  const filteredVideos = filterCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === filterCategory);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
          <p className="text-gray-600 mt-1">Manage featured videos and content settings</p>
        </div>
        <Button onClick={fetchVideos} disabled={loading}>
          <Video className="w-4 h-4 mr-2" />
          {loading ? 'Loading...' : 'Refresh Videos'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalVideos}</p>
                <p className="text-sm text-gray-600">Total Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.featuredVideos}</p>
                <p className="text-sm text-gray-600">Featured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.averageViews}</p>
                <p className="text-sm text-gray-600">Avg Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Label htmlFor="category-filter">Category:</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline">
              {filteredVideos.length} videos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Videos List */}
      <div className="grid gap-4">
        {filteredVideos.map(video => (
          <Card key={video.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingVideo === video.id ? (
                    <EditVideoForm 
                      video={video} 
                      onSave={(updates) => updateVideo(video.id, updates)}
                      onCancel={() => setEditingVideo(null)}
                    />
                  ) : (
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{video.title}</h3>
                        {video.isFeatured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {video.category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{video.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{video.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Video className="w-4 h-4" />
                          <span>{(video.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {editingVideo !== video.id && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingVideo(video.id)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant={video.isFeatured ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateVideo(video.id, { isFeatured: !video.isFeatured })}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      {video.isFeatured ? 'Unfeature' : 'Feature'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No videos found for the selected category.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Edit form component
const EditVideoForm: React.FC<{
  video: VideoItem;
  onSave: (updates: Partial<VideoItem>) => void;
  onCancel: () => void;
}> = ({ video, onSave, onCancel }) => {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [category, setCategory] = useState(video.category);
  const [isFeatured, setIsFeatured] = useState(video.isFeatured);

  const categories = ['HOUSE_CLEANING', 'PET_CARE', 'SHOE_CARE', 'LAUNDRY', 'CLEANING', 'GARDENING'];

  const handleSave = () => {
    onSave({
      title,
      description,
      category,
      isFeatured
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={isFeatured}
          onCheckedChange={setIsFeatured}
        />
        <Label htmlFor="featured">Featured Video</Label>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={handleSave} size="sm">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SafeAdminVideoManager;