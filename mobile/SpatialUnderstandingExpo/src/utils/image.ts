import * as ImageManipulator from 'expo-image-manipulator';

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

// Resize image for faster backend processing (matches backend logic)
export const resizeImage = async (
  uri: string,
  maxSize: number = 800,   // Max dimension (width or height)
  quality: number = 0.8    // Higher quality for better analysis
): Promise<string> => {
  try {
    console.log('🔄 Resizing image to match backend (800px max dimension)...');
    
    // First get current dimensions
    const { width: originalWidth, height: originalHeight } = await getImageDimensions(uri);
    console.log(`Original dimensions: ${originalWidth}x${originalHeight}`);
    
    // Calculate new dimensions preserving aspect ratio (like backend)
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    
    if (originalWidth > maxSize || originalHeight > maxSize) {
      const scale = Math.min(maxSize / originalWidth, maxSize / originalHeight);
      newWidth = Math.round(originalWidth * scale);
      newHeight = Math.round(originalHeight * scale);
      console.log(`Scaling by ${scale.toFixed(3)} to: ${newWidth}x${newHeight}`);
    } else {
      console.log('Image already within size limits, no resize needed');
      return uri;
    }
    
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: newWidth,
            height: newHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log(`✅ Image resized: ${manipResult.width}x${manipResult.height}`);
    return manipResult.uri;
  } catch (error) {
    console.error('❌ Error resizing image:', error);
    // Fallback to original URI if resizing fails
    return uri;
  }
};

// Get actual image dimensions
export const getImageDimensions = async (uri: string): Promise<{ width: number; height: number }> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(uri, [], {});
    return { width: manipResult.width, height: manipResult.height };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 800, height: 600 }; // Fallback dimensions
  }
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