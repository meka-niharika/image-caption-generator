
/**
 * Get base URL for API calls based on environment
 */
export const getApiBaseUrl = (): string => {
  // When deployed on GitHub Pages, use your deployed backend URL
  if (import.meta.env.PROD) {
    // Replace this URL with your actual deployed backend URL
    return "https://YOUR-BACKEND-URL-HERE"; // Make sure to update this with your real backend URL
  }
  
  // For local development
  return "";
};
