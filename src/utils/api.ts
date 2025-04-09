
/**
 * Get base URL for API calls based on environment
 */
export const getApiBaseUrl = (): string => {
  // When deployed on platforms like PythonAnywhere, use your deployed backend URL
  if ((import.meta as any).env.PROD) {
    // Replace this with your actual PythonAnywhere URL when deployed
    // For example: "https://yourusername.pythonanywhere.com"
    return ""; // Leave empty to use relative URLs which will work if frontend and backend are on same domain
  }
  
  // For local development
  return "";
};

// Image/Video URL helper to handle Cloudinary URLs or base64 images/videos
export const getMediaUrl = (mediaData: string): string => {
  // If it's already a full URL (Cloudinary), return as is
  if (mediaData && mediaData.startsWith('http')) {
    return mediaData;
  }
  
  // For base64 data
  return mediaData || '';
};

// Added function to handle image URLs specifically
export const getImageUrl = (imageData: string): string => {
  return getMediaUrl(imageData);
};

// Get media type (image or video)
export const getMediaType = (file: File): 'image' | 'video' | null => {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('video/')) {
    return 'video';
  }
  return null;
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to safely parse API responses
export const parseApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Server error: ${response.status}`;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        // Try to get text error if not JSON
        const errorText = await response.text();
        console.error("Non-JSON error response:", errorText);
        if (errorText && errorText.length < 100) {
          errorMessage = `Server error: ${errorText}`;
        }
      }
    } catch (e) {
      console.error("Failed to parse error response:", e);
    }
    throw new Error(errorMessage);
  }
  
  // First check if we have a JSON response
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      const text = await response.text();
      console.error("Raw response:", text);
      throw new Error("Server returned invalid JSON data");
    }
  } else {
    // If not JSON, get the text content and log it
    const text = await response.text();
    console.error("Unexpected non-JSON response:", text);
    throw new Error("Server returned non-JSON data");
  }
};
