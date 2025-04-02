
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface GenerateCaptionResponse {
  caption: string;
}

interface GenerateImageResponse {
  imageUrl: string;
}

// Real API calls to our backend
const apiGenerateCaption = async (image: File): Promise<GenerateCaptionResponse> => {
  try {
    const formData = new FormData();
    formData.append("image", image);
    
    const response = await fetch("/api/generate-caption", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      let errorMessage = "Failed to generate caption";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (jsonError) {
        // If response is not JSON, get text instead
        const errorText = await response.text();
        console.error("Non-JSON error response:", errorText);
        errorMessage = `Server error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating caption:", error);
    throw error;
  }
};

const apiGenerateImage = async (caption: string): Promise<GenerateImageResponse> => {
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ caption }),
    });
    
    if (!response.ok) {
      let errorMessage = "Failed to generate image";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (jsonError) {
        // If response is not JSON, get text instead
        const errorText = await response.text();
        console.error("Non-JSON error response:", errorText);
        errorMessage = `Server error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    // Check if the response is actually JSON before parsing
    const contentType = response.headers.get("content-type");
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
