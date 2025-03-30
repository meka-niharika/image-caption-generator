
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// Updated API endpoints for demonstration
// In a real application, this would be replaced with actual API calls to your backend

interface GenerateCaptionResponse {
  caption: string;
}

interface GenerateImageResponse {
  imageUrl: string;
}

// More relevant captions for demonstration
const sampleCaptions = [
  "A beautiful sunset over the mountains with vibrant orange and purple hues.",
  "A cute golden retriever puppy playing with a red ball in a green field.",
  "A modern kitchen with granite countertops and stainless steel appliances.",
  "A crowded city street with people walking under colorful umbrellas in the rain.",
  "A serene lake surrounded by pine trees reflecting the clear blue sky."
];

// Using more reliable image URLs from Unsplash with direct access
const sampleImages = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&h=600&q=80"
];

// Improved function to simulate API call for generating captions
const apiGenerateCaption = async (image: File): Promise<GenerateCaptionResponse> => {
  return new Promise((resolve) => {
    // Simulate analyzing the image and returning a caption
    setTimeout(() => {
      // Get image type to adjust captions
      const imageType = image.type.split('/')[1];
      let captionIndex = 0;
      
      // Simple logic to pick different captions based on file name
      // In a real app, this would be replaced by actual image analysis
      if (image.name.includes("nature") || image.name.includes("landscape")) {
        captionIndex = 0; // Sunset caption
      } else if (image.name.includes("dog") || image.name.includes("pet")) {
        captionIndex = 1; // Dog caption
      } else if (image.name.includes("kitchen") || image.name.includes("home")) {
        captionIndex = 2; // Kitchen caption
      } else if (image.name.includes("city") || image.name.includes("street")) {
        captionIndex = 3; // City caption
      } else {
        captionIndex = 4; // Lake caption
      }
      
      resolve({ caption: sampleCaptions[captionIndex] });
    }, 1500); // Reduced delay for better UX
  });
};

// Improved function to simulate API call for generating images
const apiGenerateImage = async (caption: string): Promise<GenerateImageResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple logic to map caption keywords to relevant images
      // In a real app, this would be replaced by actual image generation
      let imageIndex = 0;
      const lowerCaption = caption.toLowerCase();
      
      if (lowerCaption.includes("sunset") || lowerCaption.includes("mountain")) {
        imageIndex = 0;
      } else if (lowerCaption.includes("dog") || lowerCaption.includes("puppy") || lowerCaption.includes("pet")) {
        imageIndex = 1;
      } else if (lowerCaption.includes("computer") || lowerCaption.includes("technology")) {
        imageIndex = 2;
      } else if (lowerCaption.includes("code") || lowerCaption.includes("programming")) {
        imageIndex = 3;
      } else if (lowerCaption.includes("laptop") || lowerCaption.includes("work")) {
        imageIndex = 4;
      }
      
      resolve({ imageUrl: sampleImages[imageIndex] });
    }, 2000);
  });
};

// Hook for generating captions
export const useGenerateCaption = () => {
  return useMutation({
    mutationFn: (image: File) => apiGenerateCaption(image),
    onError: (error: Error) => {
      console.error("Error generating caption:", error);
      toast.error("Failed to generate caption. Please try again.");
    }
  });
};

// Hook for generating images
export const useGenerateImage = () => {
  return useMutation({
    mutationFn: (caption: string) => apiGenerateImage(caption),
    onError: (error: Error) => {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
    }
  });
};
