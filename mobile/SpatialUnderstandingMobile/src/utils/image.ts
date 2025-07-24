export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  type: string;
  base64?: string;
}

// Convert image to base64
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Simple resize function (for now just return original URI)
export const resizeImage = async (
  uri: string,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 80
): Promise<string> => {
  // For now, just return the original URI
  // In a production app, you might want to add a proper image resizing library
  console.log(`Image resize requested: ${maxWidth}x${maxHeight} @ ${quality}% quality`);
  return uri;
};

// Get image dimensions (simplified for now)
export const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
  return Promise.resolve({ width: 800, height: 600 });
};

// Validate image format
export const isValidImageFormat = (type: string): boolean => {
  const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validFormats.some(format => type.toLowerCase().includes(format));
};

// Get file extension from MIME type
export const getFileExtension = (type: string): string => {
  const extensions: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  
  return extensions[type.toLowerCase()] || 'jpg';
};

// Calculate aspect ratio
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

// Calculate scaled dimensions to fit container
export const calculateScaledDimensions = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
): { width: number; height: number; scale: number } => {
  const imageAspectRatio = imageWidth / imageHeight;
  const containerAspectRatio = containerWidth / containerHeight;
  
  let scaledWidth: number;
  let scaledHeight: number;
  let scale: number;
  
  if (imageAspectRatio > containerAspectRatio) {
    // Image is wider, fit to width
    scaledWidth = containerWidth;
    scaledHeight = containerWidth / imageAspectRatio;
    scale = containerWidth / imageWidth;
  } else {
    // Image is taller, fit to height
    scaledHeight = containerHeight;
    scaledWidth = containerHeight * imageAspectRatio;
    scale = containerHeight / imageHeight;
  }
  
  return {
    width: scaledWidth,
    height: scaledHeight,
    scale,
  };
}; 