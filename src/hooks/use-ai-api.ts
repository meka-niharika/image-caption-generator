
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// Mock API endpoints for demonstration
// In a real application, this would be replaced with actual API calls to your backend

interface GenerateCaptionResponse {
  caption: string;
}

interface GenerateImageResponse {
  imageUrl: string;
}

// Sample captions for demonstration
const sampleCaptions = [
  "A beautiful sunset over the mountains with vibrant orange and purple hues.",
  "A cute golden retriever puppy playing with a red ball in a green field.",
  "A modern kitchen with granite countertops and stainless steel appliances.",
  "A crowded city street with people walking under colorful umbrellas in the rain.",
  "A serene lake surrounded by pine trees reflecting the clear blue sky."
];

// Sample image URLs for demonstration
const sampleImages = [
  "https://source.unsplash.com/random/800x600/?nature",
  "https://source.unsplash.com/random/800x600/?city",
  "https://source.unsplash.com/random/800x600/?people",
  "https://source.unsplash.com/random/800x600/?technology",
  "https://source.unsplash.com/random/800x600/?animals"
];

// Function to simulate API call for generating captions
const apiGenerateCaption = async (image: File): Promise<GenerateCaptionResponse> => {
  // In a real app, you would upload the image to the server and get a caption back
  // This is a mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * sampleCaptions.length);
      resolve({ caption: sampleCaptions[randomIndex] });
    }, 2000); // Simulate network delay
  });
};

// Function to simulate API call for generating images
const apiGenerateImage = async (caption: string): Promise<GenerateImageResponse> => {
  // In a real app, you would send the caption to the server and get an image URL back
  // This is a mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * sampleImages.length);
      resolve({ imageUrl: sampleImages[randomIndex] });
    }, 3000); // Simulate network delay
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
