import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  Download,
  Link as LinkIcon,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

interface VideoUploadProps {
  onVideoUploaded?: (videoData: {
    file: File;
    title: string;
    description: string;
    thumbnail?: string;
  }) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onVideoUploaded,
  maxSizeMB = 100, // 100MB default limit
  acceptedFormats = ['.mp4', '.mov', '.avi', '.wmv']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleVideoFile = (file: File) => {
    // Reset previous states
    setErrorMessage('');
    setUploadStatus('idle');

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`File size must be less than ${maxSizeMB}MB`);
      setUploadStatus('error');
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      setErrorMessage(`Only ${acceptedFormats.join(', ')} files are supported`);
      setUploadStatus('error');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
    setUploadedVideo(file);
    setVideoTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleVideoFile(e.target.files[0]);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSubmit = () => {
    if (uploadedVideo && videoTitle.trim()) {
      setUploadStatus('uploading');
      
      // Simulate upload process (replace with actual upload logic)
      setTimeout(() => {
        setUploadStatus('success');
        if (onVideoUploaded) {
          onVideoUploaded({
            file: uploadedVideo,
            title: videoTitle,
            description: videoDescription,
            thumbnail: videoPreview || undefined
          });
        }
      }, 2000);
    }
  };

  const clearVideo = () => {
    setUploadedVideo(null);
    setVideoPreview(null);
    setVideoTitle('');
    setVideoDescription('');
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyVideoLink = () => {
    if (videoPreview) {
      navigator.clipboard.writeText(videoPreview);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Video Upload</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!uploadedVideo ? (
          /* Upload Area */
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              Drag and drop your video here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: {acceptedFormats.join(', ')} • Max size: {maxSizeMB}MB
            </p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={acceptedFormats.join(',')}
              onChange={handleFileInput}
              aria-label="Select video file to upload"
              title="Choose a video file to upload"
            />
          </div>
        ) : (
          /* Video Preview & Details */
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={videoPreview || undefined}
                className="w-full aspect-video object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={togglePlay}
                  className="bg-black/50 hover:bg-black/70"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-black/50 hover:bg-black/70"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearVideo}
                className="absolute top-2 right-2 text-white hover:bg-black/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Video Details Form */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="videoTitle">Video Title *</Label>
                  <Input
                    id="videoTitle"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="videoDescription">Description</Label>
                  <Textarea
                    id="videoDescription"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Describe what this video shows..."
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">File Information</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {uploadedVideo.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Size:</strong> {(uploadedVideo.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Type:</strong> {uploadedVideo.type}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={!videoTitle.trim() || uploadStatus === 'uploading'}
                    className="w-full"
                  >
                    {uploadStatus === 'uploading' ? (
                      'Uploading...'
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={copyVideoLink}
                    className="w-full"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copy Preview Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus === 'success' && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <Check className="w-5 h-5" />
            <span>Video uploaded successfully!</span>
          </div>
        )}

        {uploadStatus === 'error' && errorMessage && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Usage Tips */}
        <div className="text-sm text-gray-500 space-y-1">
          <p><strong>💡 Tips for best results:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use MP4 format for best compatibility</li>
            <li>Keep videos under 50MB for faster upload</li>
            <li>Add descriptive titles for better organization</li>
            <li>Include relevant keywords in descriptions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;