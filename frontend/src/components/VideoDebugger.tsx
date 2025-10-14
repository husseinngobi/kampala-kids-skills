import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VideoItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  views?: number;
  type?: string;
}

interface FeaturedVideo {
  id: string;
  title: string;
  staticPath: string;
  category?: string;
  views?: number;
}

interface TestResult {
  url: string;
  title: string;
  status: number;
  statusText: string;
  contentType: string | null;
  success: boolean;
  error?: string;
}

const VideoDebugger: React.FC = () => {
  const [galleryVideos, setGalleryVideos] = useState<VideoItem[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const loadGalleryVideos = useCallback(async () => {
    try {
      console.log('🔄 Fetching gallery videos from:', `${API_BASE_URL}/api/gallery/media?limit=5`);
      const response = await fetch(`${API_BASE_URL}/api/gallery/media?limit=5`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📹 Gallery API response:', data);
      
      if (data.success && data.data) {
        setGalleryVideos(data.data.filter((item: VideoItem) => item.type === 'video'));
      }
    } catch (error) {
      console.error('❌ Gallery videos error:', error);
    }
  }, [API_BASE_URL]);

  const loadFeaturedVideos = useCallback(async () => {
    try {
      console.log('🔄 Fetching featured videos from: /featured.json');
      const response = await fetch('/featured.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('⭐ Featured videos response:', data);
      
      if (data.featured) {
        setFeaturedVideos(data.featured);
      }
    } catch (error) {
      console.error('❌ Featured videos error:', error);
    }
  }, []);

  const testVideoUrl = async (url: string, title: string) => {
    try {
      console.log(`🧪 Testing video URL: ${url}`);
      const response = await fetch(url, { method: 'HEAD' });
      
      return {
        url,
        title,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        success: response.ok
      };
    } catch (error) {
      return {
        url,
        title,
        status: 0,
        statusText: 'Network Error',
        contentType: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Load videos
      await Promise.all([loadGalleryVideos(), loadFeaturedVideos()]);
      
      // Test all video URLs
      const allVideos = [
        ...galleryVideos.map(v => ({ url: v.url, title: v.title, source: 'Gallery' })),
        ...featuredVideos.map(v => ({ url: v.staticPath, title: v.title, source: 'Featured' }))
      ];
      
      const results = await Promise.all(
        allVideos.map(v => testVideoUrl(v.url, `${v.source}: ${v.title}`))
      );
      
      setTestResults(results);
      console.log('🧪 Test results:', results);
    } catch (error) {
      console.error('❌ Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryVideos();
    loadFeaturedVideos();
  }, [loadGalleryVideos, loadFeaturedVideos]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Debug Tool</CardTitle>
          <div className="flex space-x-4">
            <Button onClick={runAllTests} disabled={loading}>
              {loading ? 'Testing...' : 'Test All Videos'}
            </Button>
            <Button variant="outline" onClick={loadGalleryVideos}>
              Reload Gallery
            </Button>
            <Button variant="outline" onClick={loadFeaturedVideos}>
              Reload Featured
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gallery Videos */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Gallery Videos ({galleryVideos.length})</h3>
              <div className="space-y-2">
                {galleryVideos.map((video, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="font-medium">{video.title}</div>
                    <div className="text-sm text-gray-600">{video.url}</div>
                    <div className="text-xs text-gray-500">
                      Category: {video.category} | Views: {video.views}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Videos */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Featured Videos ({featuredVideos.length})</h3>
              <div className="space-y-2">
                {featuredVideos.map((video, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="font-medium">{video.title}</div>
                    <div className="text-sm text-gray-600">{video.staticPath}</div>
                    <div className="text-xs text-gray-500">
                      Category: {video.category} | Views: {video.views}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Test Results</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 border rounded ${
                      result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{result.title}</div>
                        <div className="text-sm text-gray-600">{result.url}</div>
                      </div>
                      <div className={`text-sm font-medium ${
                        result.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.status} {result.statusText}
                      </div>
                    </div>
                    {result.contentType && (
                      <div className="text-xs text-gray-500 mt-1">
                        Content-Type: {result.contentType}
                      </div>
                    )}
                    {result.error && (
                      <div className="text-xs text-red-600 mt-1">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Video Test */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Live Video Test</h3>
            <div className="grid gap-4">
              {galleryVideos.slice(0, 2).map((video, index) => (
                <div key={index} className="border rounded p-4">
                  <h4 className="font-medium mb-2">{video.title}</h4>
                  <video 
                    controls 
                    className="w-full h-48 bg-black"
                    preload="metadata"
                    onError={(e) => {
                      console.error('🚨 Video error:', e);
                      console.error('🚨 Video URL:', video.url);
                    }}
                    onLoadStart={() => console.log('🔄 Loading:', video.url)}
                    onCanPlay={() => console.log('✅ Can play:', video.url)}
                  >
                    <source src={video.url} type="video/mp4" />
                    <p>Cannot play video: {video.url}</p>
                  </video>
                </div>
              ))}
              
              {featuredVideos.slice(0, 1).map((video, index) => (
                <div key={`featured-${index}`} className="border rounded p-4">
                  <h4 className="font-medium mb-2">{video.title} (Featured)</h4>
                  <video 
                    controls 
                    className="w-full h-48 bg-black"
                    preload="metadata"
                    onError={(e) => {
                      console.error('🚨 Featured video error:', e);
                      console.error('🚨 Featured video URL:', video.staticPath);
                    }}
                    onLoadStart={() => console.log('🔄 Loading featured:', video.staticPath)}
                    onCanPlay={() => console.log('✅ Can play featured:', video.staticPath)}
                  >
                    <source src={video.staticPath} type="video/mp4" />
                    <p>Cannot play featured video: {video.staticPath}</p>
                  </video>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoDebugger;