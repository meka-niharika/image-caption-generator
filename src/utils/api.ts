
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

// Image URL helper to handle Cloudinary URLs or base64 images
export const getImageUrl = (imageData: string): string => {
  // If it's already a full URL (Cloudinary), return as is
  if (imageData.startsWith('http')) {
    return imageData;
  }
  
  // For base64 data
  return imageData;
};
