import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  onError?: (error: Error) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  poster,
  autoPlay = false,
  muted = false,
  controls = true,
  className = '',
  onError,
  onPlay,
  onPause,
  onLoadStart,
  onCanPlay
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMuted(muted);
  }, [muted]);

  const handlePlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPause?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    
    console.error('🚨 Video error for:', title);
    console.error('🚨 Video src:', src);
    console.error('🚨 Error details:', error);
    
    let message = 'Unknown video error';
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          message = 'Video playback was aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          message = 'Network error while loading video';
          break;
        case error.MEDIA_ERR_DECODE:
          message = 'Video format not supported';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'Video source not supported';
          break;
        default:
          message = `Video error (code: ${error.code})`;
      }
    }
    
    setHasError(true);
    setErrorMessage(message);
    setIsLoading(false);
    
    const videoError = new Error(message);
    onError?.(videoError);
  };

  const handleLoadStart = () => {
    console.log('🔄 Video loading started:', title);
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  };

  const handleCanPlay = () => {
    console.log('✅ Video can play:', title);
    setIsLoading(false);
    setHasError(false);
    onCanPlay?.();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Play failed:', err);
          setHasError(true);
          setErrorMessage('Failed to play video');
        });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const goFullscreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const retryLoad = () => {
    if (videoRef.current) {
      setHasError(false);
      setErrorMessage('');
      setIsLoading(true);
      videoRef.current.load();
    }
  };

  const getVideoFileExtension = (url: string): string => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const getVideoMimeType = (url: string): string => {
    const ext = getVideoFileExtension(url);
    switch (ext) {
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'ogg':
        return 'video/ogg';
      case 'mov':
        return 'video/quicktime';
      case 'avi':
        return 'video/x-msvideo';
      default:
        return 'video/mp4';
    }
  };

  if (hasError) {
    return (
      <div className={`bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center text-white p-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Video Error</h3>
          <p className="text-sm text-gray-300 mb-4">{errorMessage}</p>
          <div className="space-y-2">
            <Button onClick={retryLoad} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <div className="text-xs text-gray-400">
              <a 
                href={src} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Download video file
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        muted={isMuted}
        autoPlay={autoPlay}
        controls={controls}
        preload="metadata"
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onLoadedData={() => console.log('📊 Video data loaded:', title)}
        onVolumeChange={(e) => {
          const video = e.currentTarget;
          setIsMuted(video.muted);
          console.log('🔊 Volume changed - muted:', video.muted, 'volume:', video.volume);
        }}
        playsInline
      >
        {/* Primary source */}
        <source src={src} type={getVideoMimeType(src)} />
        
        {/* Fallback sources for different formats */}
        {getVideoFileExtension(src) === 'mp4' && (
          <source src={src.replace('.mp4', '.webm')} type="video/webm" />
        )}
        {getVideoFileExtension(src) === 'webm' && (
          <source src={src.replace('.webm', '.mp4')} type="video/mp4" />
        )}
        
        {/* Browser compatibility fallback */}
        <p className="text-white text-center py-8">
          Your browser does not support the video tag.
          <br />
          <a 
            href={src} 
            className="text-blue-400 underline ml-2" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Download {title}
          </a>
        </p>
      </video>

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-sm">Loading video...</div>
          </div>
        </div>
      )}

      {/* Custom controls overlay (only if default controls are disabled) */}
      {!controls && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={togglePlay}
              className="bg-black bg-opacity-70 hover:bg-opacity-90"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleMute}
              className="bg-black bg-opacity-70 hover:bg-opacity-90"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={goFullscreen}
            className="bg-black bg-opacity-70 hover:bg-opacity-90"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;