
/**
 * Get base URL for API calls based on environment
 */
export const getApiBaseUrl = (): string => {
  // When deployed on GitHub Pages or other platforms, use your deployed backend URL
  if (import.meta.env.PROD) {
    // If you've deployed your backend, replace this with your actual URL
    // For example: "https://your-app-name.onrender.com" or "https://your-app-name.pythonanywhere.com"
    return ""; // Leave empty to use relative URLs which will work if frontend and backend are on same domain
  }
  
  // For local development
  return "";
};
