
/**
 * Get base URL for API calls based on environment
 */
export const getApiBaseUrl = (): string => {
  // When deployed on GitHub Pages, your backend will need to be on a separate domain
  // If you're hosting the backend on a service like Render, Heroku, etc.
  if (import.meta.env.PROD) {
    // Replace this URL with your deployed backend URL
    return "https://your-backend-url.com"; // TODO: Change this to your actual deployed backend URL
  }
  
  // For local development
  return "";
};
