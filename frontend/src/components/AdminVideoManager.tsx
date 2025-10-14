import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Star, 
  Download, 
  Upload, 
  Trash2, 
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  filename: string;
  url: string;
  category: string;
  views: number;
  isFeatured: boolean;
  uploadedAt: string;
  duration?: string;
  type: string;
}

interface FeaturedVideo {
  id: string;
  title: string;
  description: string;
  filename: string;
  staticPath: string;
  category: string;
  views: number;
  uploadedAt?: string;
  duration: string;
  isFeatured: boolean;
}

const AdminVideoManager: React.FC = () => {
  const [galleryVideos, setGalleryVideos] = useState<VideoItem[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const loadGalleryVideos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/gallery/media?type=videos&limit=50`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setGalleryVideos(data.data.filter((item: VideoItem) => item.type === 'video'));
      }
    } catch (error) {
      console.error('❌ Gallery videos error:', error);
      setMessage({ type: 'error', text: `Failed to load gallery videos: ${error}` });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const loadFeaturedVideos = useCallback(async () => {
    try {
      const response = await fetch('/featured.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.featured) {
        setFeaturedVideos(data.featured);
      }
    } catch (error) {
      console.error('❌ Featured videos error:', error);
      setMessage({ type: 'error', text: `Failed to load featured videos: ${error}` });
    }
  }, []);

  const addToFeatured = async (video: VideoItem) => {
    try {
      setActionLoading(video.id);
      
      // Use simplified endpoint for testing (no auth required)
      const updateResponse = await fetch(`${API_BASE_URL}/api/admin-simple/featured-videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'add',
          video: {
            id: video.id,
            title: video.title,
            description: video.description,
            filename: video.filename,
            thumbnail: '/placeholder.svg',
            category: video.category,
            views: video.views,
            uploadDate: video.uploadedAt,
            duration: video.duration || '0:00'
          }
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update featured videos list');
      }

      setMessage({ type: 'success', text: `"${video.title}" has been added to featured videos!` });
      
      // Reload both lists
      await Promise.all([loadGalleryVideos(), loadFeaturedVideos()]);
      
    } catch (error) {
      console.error('❌ Add to featured error:', error);
      setMessage({ type: 'error', text: `Failed to add video to featured: ${error}` });
    } finally {
      setActionLoading(null);
    }
  };

  const removeFromFeatured = async (video: FeaturedVideo) => {
    try {
      setActionLoading(video.id);
      
      // Use simplified endpoint for testing (no auth required)
      const response = await fetch(`${API_BASE_URL}/api/admin-simple/featured-videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'remove',
          videoId: video.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from featured videos');
      }

      setMessage({ type: 'success', text: `"${video.title}" has been removed from featured videos!` });
      
      // Reload both lists
      await Promise.all([loadGalleryVideos(), loadFeaturedVideos()]);
      
    } catch (error) {
      console.error('❌ Remove from featured error:', error);
      setMessage({ type: 'error', text: `Failed to remove video from featured: ${error}` });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadGalleryVideos(), loadFeaturedVideos()]);
    };
    loadData();
  }, [loadGalleryVideos, loadFeaturedVideos]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Video Management Admin</h1>
        <p className="text-gray-600">
          Manage which videos are featured on the homepage. Featured videos are cached locally for offline viewing.
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Featured Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Featured Videos ({featuredVideos.length}/3)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featuredVideos.map((video) => (
                <div key={video.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{video.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Category: {video.category}</span>
                        <span>Views: {video.views}</span>
                        <span>Duration: {video.duration}</span>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-yellow-500">
                      Featured
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(video.staticPath, '_blank')}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromFeatured(video)}
                      disabled={actionLoading === video.id}
                    >
                      {actionLoading === video.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              
              {featuredVideos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No featured videos yet. Add some from the gallery below.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gallery Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-500" />
              <span>All Videos ({galleryVideos.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => Promise.all([loadGalleryVideos(), loadFeaturedVideos()])}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {galleryVideos.map((video) => {
                const isAlreadyFeatured = featuredVideos.some(fv => fv.id === video.id);
                
                return (
                  <div key={video.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Category: {video.category}</span>
                          <span>Views: {video.views}</span>
                          <span>Uploaded: {formatDate(video.uploadedAt)}</span>
                        </div>
                      </div>
                      {isAlreadyFeatured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => addToFeatured(video)}
                        disabled={
                          isAlreadyFeatured || 
                          featuredVideos.length >= 3 || 
                          actionLoading === video.id
                        }
                      >
                        {actionLoading === video.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Star className="w-4 h-4 mr-1" />
                        )}
                        {isAlreadyFeatured ? 'Featured' : 'Add to Featured'}
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {galleryVideos.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No videos found in gallery.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Featured Videos:</strong> Maximum of 3 videos that appear on the homepage and are cached locally for offline viewing.</p>
            <p>• <strong>Gallery Videos:</strong> All videos uploaded to the system, available when the backend is online.</p>
            <p>• <strong>Adding to Featured:</strong> Copies the video file to the frontend's static folder and updates the featured.json manifest.</p>
            <p>• <strong>Removing from Featured:</strong> Removes the video from static storage while keeping it in the main gallery.</p>
            <p>• <strong>Offline Access:</strong> Featured videos work even when the backend is offline, ensuring homepage always displays content.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVideoManager;