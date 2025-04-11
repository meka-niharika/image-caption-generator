/**
 * Get base URL for API calls based on environment
 */
export const getApiBaseUrl = (): string => {
  // When deployed on platforms like Render, use your deployed backend URL
  if ((import.meta as any).env.PROD) {
    console.log("Running in production mode, using remote API");
    // Replace this with your actual deployed backend URL
    return "https://image-caption-backend.onrender.com";
  }
  
  // For local development
  console.log("Running in development mode, using local API");
  return "http://localhost:5000";
};

// Log the API base URL for debugging
console.log("API Base URL:", getApiBaseUrl());

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
  console.log("API Response status:", response.status);
  console.log("API Response headers:", Object.fromEntries([...response.headers.entries()]));
  
  if (!response.ok) {
    let errorMessage = `Server error: ${response.status}`;
    try {
      const contentType = response.headers.get("content-type");
      console.log("Error response content-type:", contentType);
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error("JSON error response:", errorData);
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
  console.log("Success response content-type:", contentType);
  
  if (contentType && contentType.includes("application/json")) {
    try {
      const jsonData = await response.json();
      console.log("API response data:", jsonData);
      return jsonData;
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

// Create a simple function to test API connectivity
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const apiUrl = getApiBaseUrl();
    console.log(`Testing connection to API at: ${apiUrl}`);
    
    // Use a shorter timeout for faster feedback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Also try the root path if /health fails
    if (!response.ok) {
      const rootController = new AbortController();
      const rootTimeoutId = setTimeout(() => rootController.abort(), 5000);
      
      const rootResponse = await fetch(`${apiUrl}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: rootController.signal
      });
      
      clearTimeout(rootTimeoutId);
      console.log(`Root path test result: ${rootResponse.status} ${rootResponse.statusText}`);
      return rootResponse.ok;
    }
    
    console.log(`API connection test result: ${response.status} ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};
