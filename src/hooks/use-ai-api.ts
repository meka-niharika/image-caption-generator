
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiBaseUrl, getImageUrl } from "@/utils/api";

interface GenerateCaptionResponse {
  caption: string;
  imageUrl?: string;
  id?: string;
}

interface GenerateImageResponse {
  imageUrl: string;
  id?: string;
}

interface ImageData {
  _id: string;
  image_url: string;
  caption: string;
  original_filename: string;
  created_at: string;
}

const apiBaseUrl = getApiBaseUrl();

// Real API calls to our backend
const apiGenerateCaption = async (image: File): Promise<GenerateCaptionResponse> => {
  try {
    const formData = new FormData();
    formData.append("image", image);
    
    const response = await fetch(`${apiBaseUrl}/api/generate-caption`, {
      method: "POST",
      body: formData,
    });
    
    // Check if the response is actually JSON before parsing
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMessage = "Failed to generate caption";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        // If response is not JSON, log the text for debugging
        const errorText = await response.text();
        console.error("Non-JSON error response:", errorText);
        errorMessage = `Server error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error("Unexpected non-JSON response:", text);
      throw new Error("Server returned non-JSON data");
    }
  } catch (error) {
    console.error("Error generating caption:", error);
    throw error;
  }
};

const apiGenerateImage = async (caption: string): Promise<GenerateImageResponse> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ caption }),
    });
    
    // Check if the response is actually JSON before parsing
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMessage = "Failed to generate image";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        // If response is not JSON, log the text for debugging
        const errorText = await response.text();
        console.error("Non-JSON error response:", errorText);
        errorMessage = `Server error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error("Unexpected non-JSON response:", text);
      throw new Error("Server returned non-JSON data");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

const fetchStoredImages = async (): Promise<ImageData[]> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/images`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};

// Hook for generating captions
export const useGenerateCaption = () => {
  return useMutation({
    mutationFn: (image: File) => apiGenerateCaption(image),
    onError: (error: Error) => {
      console.error("Error generating caption:", error);
      toast.error(`Failed to generate caption: ${error.message || "Unknown error"}`);
    }
  });
};

// Hook for generating images
export const useGenerateImage = () => {
  return useMutation({
    mutationFn: (caption: string) => apiGenerateImage(caption),
    onError: (error: Error) => {
      console.error("Error generating image:", error);
      toast.error(`Failed to generate image: ${error.message || "Unknown error"}`);
    }
  });
};

// Hook for retrieving stored images
export const useStoredImages = () => {
  return useQuery({
    queryKey: ['stored-images'],
    queryFn: fetchStoredImages,
    staleTime: 60000, // 1 minute
  });
};
