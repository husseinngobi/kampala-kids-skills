import { useState, useEffect } from 'react';
import logoImage from '@/assets/life-skills-logo.jpeg';

interface WatermarkConfig {
  id: string;
  name: string;
  url: string;
  localPath: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size: 'small' | 'medium' | 'large';
  isActive: boolean;
}

interface UseWatermarkReturn {
  watermarkConfig: WatermarkConfig | null;
  isLoading: boolean;
  error: string | null;
  refreshWatermark: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Default watermark configurations with local fallbacks
const DEFAULT_WATERMARKS: WatermarkConfig[] = [
  {
    id: 'logo-main',
    name: 'Kampala Kids Skills Logo',
    url: logoImage, // Use imported asset instead of path
    localPath: logoImage,
    position: 'bottom-right',
    opacity: 0.8,
    size: 'medium',
    isActive: true
  },
  {
    id: 'children-learning',
    name: 'Children Learning',
    url: logoImage, // Fallback to logo for now
    localPath: logoImage,
    position: 'bottom-right',
    opacity: 0.6,
    size: 'medium',
    isActive: false
  },
  {
    id: 'logo-transparent',
    name: 'Transparent Logo',
    url: logoImage,
    localPath: logoImage,
    position: 'center',
    opacity: 0.1,
    size: 'large',
    isActive: false
  }
];

export const useWatermark = (): UseWatermarkReturn => {
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWatermarkConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from backend first
      const response = await fetch(`${API_BASE_URL}/api/settings/watermark`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.watermark) {
          console.log('✅ Loaded watermark config from backend:', data.watermark);
          setWatermarkConfig(data.watermark);
          return;
        }
      }

      // Fallback to default watermark if backend fails or returns no data
      console.log('🔄 Using default watermark config (backend unavailable or no config)');
      const defaultWatermark = DEFAULT_WATERMARKS.find(w => w.isActive) || DEFAULT_WATERMARKS[0];
      setWatermarkConfig(defaultWatermark);

    } catch (error) {
      console.warn('⚠️ Failed to load watermark from backend, using default:', error);
      setError('Using default watermark configuration');
      
      // Use default watermark on error
      const defaultWatermark = DEFAULT_WATERMARKS.find(w => w.isActive) || DEFAULT_WATERMARKS[0];
      setWatermarkConfig(defaultWatermark);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWatermark = async () => {
    await loadWatermarkConfig();
  };

  useEffect(() => {
    loadWatermarkConfig();
  }, []);

  return {
    watermarkConfig,
    isLoading,
    error,
    refreshWatermark
  };
};

export default useWatermark;