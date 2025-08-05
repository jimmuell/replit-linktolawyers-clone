/**
 * Converts cloud storage URLs to our local serving endpoints
 * This ensures images are served through our application's image serving infrastructure
 */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;

  // If it's already a relative URL (our serving endpoint), return as-is
  if (imageUrl.startsWith('/images/') || imageUrl.startsWith('/public-objects/')) {
    return imageUrl;
  }

  // If it's a cloud storage URL, convert it to our serving endpoint
  if (imageUrl.startsWith('https://storage.googleapis.com/')) {
    // Extract the object path from the cloud storage URL
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      
      // Skip bucket name and get the object path
      if (pathParts.length >= 3) {
        const objectPath = pathParts.slice(2).join('/');
        
        // Check if it's from the private object directory (uploaded files)
        if (objectPath.includes('uploads/')) {
          // Remove the private directory prefix and serve through our endpoint
          const finalPath = objectPath.replace(/^.*?uploads\//, 'uploads/');
          return `/images/${finalPath}`;
        }
      }
    } catch (error) {
      console.error('Error parsing image URL:', error);
    }
  }

  // For external URLs or other formats, return as-is
  return imageUrl;
}

/**
 * Optimizes image loading with error handling
 */
export function createImageErrorHandler() {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    
    // If already showing fallback, don't retry
    if (img.src.includes('data:image/svg+xml')) {
      return;
    }
    
    // Set fallback placeholder
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMjgiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIxMDAiIHk9IjY0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LXNpemU9IjE0Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
    img.alt = 'Image not available';
  };
}