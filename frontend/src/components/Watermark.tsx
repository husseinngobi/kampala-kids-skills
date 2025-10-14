import React from 'react';
import useWatermark from '@/hooks/useWatermark';

interface WatermarkProps {
  className?: string;
  page?: 'home' | 'gallery' | 'about' | 'contact';
}

const Watermark: React.FC<WatermarkProps> = ({ 
  className = '', 
  page = 'home' 
}) => {
  const { watermarkConfig, isLoading } = useWatermark();

  // Generate opacity class name
  const opacityClass = watermarkConfig ? `watermark-opacity-${Math.round(watermarkConfig.opacity * 100)}` : '';
  
  // Inject styles dynamically for this specific opacity (must be before early return)
  React.useEffect(() => {
    if (!watermarkConfig) return;
    
    const styleId = 'watermark-dynamic-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    const css = `.${opacityClass} { opacity: ${watermarkConfig.opacity} !important; }`;
    if (!styleElement.textContent?.includes(`.${opacityClass}`)) {
      styleElement.textContent = (styleElement.textContent || '') + css;
    }
  }, [watermarkConfig, opacityClass]);

  if (isLoading || !watermarkConfig) {
    return null;
  }

  const getPositionClasses = () => {
    switch (watermarkConfig.position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getSizeClasses = () => {
    switch (watermarkConfig.size) {
      case 'small':
        return 'w-16 h-16';
      case 'medium':
        return 'w-24 h-24';
      case 'large':
        return 'w-32 h-32';
      default:
        return 'w-24 h-24';
    }
  };

  return (
    <div 
      className={`fixed ${getPositionClasses()} pointer-events-none z-10 ${className} ${opacityClass}`}
    >
      <img
        src={watermarkConfig.url}
        alt={watermarkConfig.name}
        className={`${getSizeClasses()} object-contain drop-shadow-sm`}
        onError={(e) => {
          // Fallback to local asset if remote URL fails
          const target = e.target as HTMLImageElement;
          if (target.src !== watermarkConfig.localPath) {
            console.log('🔄 Watermark URL failed, falling back to local asset');
            target.src = watermarkConfig.localPath;
          }
        }}
        onLoad={() => {
          console.log('✅ Watermark loaded successfully:', watermarkConfig.name);
        }}
      />
    </div>
  );
};

export default Watermark;