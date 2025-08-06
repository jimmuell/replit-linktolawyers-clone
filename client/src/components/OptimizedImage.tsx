import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

/**
 * Optimized image component with progressive enhancement, lazy loading, and SEO features
 * Provides fallback handling, loading states, and accessibility features
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
    console.warn(`Failed to load image: ${src}`);
  };

  if (imageError) {
    return (
      <div 
        className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
        style={{ width, height: height || 200 }}
        role="img"
        aria-label={alt}
      >
        <div className="text-center p-4">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <p className="text-xs text-gray-500">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div 
          className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"
          style={{ width, height: height || 200 }}
        />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        // SEO and accessibility attributes
        itemProp="image"
        data-loading={!imageLoaded}
      />
    </div>
  );
}