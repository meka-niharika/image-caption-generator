import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiBaseUrl, getMediaUrl, parseApiResponse } from "@/utils/api";

interface GenerateCaptionResponse {
  caption: string;
  imageUrl?: string;
  id?: string;
}

interface GenerateVideoCaptionResponse {
  caption: string;
  summary: string;
  animatedVideoUrl?: string;
  id?: string;
}

interface GenerateImageResponse {
  imageUrl: string;
  id?: string;
}

interface GenerateAnimatedVideoResponse {
  videoUrl: string;
  id?: string;
}

interface StoredImage {
  _id: string;
  image_url: string;
  caption: string;
  original_filename?: string;
  created_at: string;
}

const apiBaseUrl = getApiBaseUrl();

const apiGetStoredImages = async (): Promise<StoredImage[]> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/images`, {
      method: "GET",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stored images: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching stored images:", error);
    throw error;
  }
};

export const useStoredImages = () => {
  return useQuery({
    queryKey: ['stored-images'],
    queryFn: apiGetStoredImages,
    retry: 1,
  });
};

const apiGenerateCaption = async (image: File): Promise<GenerateCaptionResponse> => {
  try {
    const formData = new FormData();
    formData.append("image", image);
    
    const response = await fetch(`${apiBaseUrl}/api/generate-caption`, {
      method: "POST",
      body: formData,
    });
    
    return await parseApiResponse(response);
  } catch (error) {
    console.error("Error generating caption:", error);
    throw error;
  }
};

const apiGenerateVideoCaption = async (video: File): Promise<GenerateVideoCaptionResponse> => {
  try {
    const formData = new FormData();
    formData.append("video", video);
    
    const response = await fetch(`${apiBaseUrl}/api/generate-video-caption`, {
      method: "POST",
      body: formData,
    });
    
    return await parseApiResponse(response);
  } catch (error) {
    console.error("Error generating video caption:", error);
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
    
    return await parseApiResponse(response);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

const apiGenerateAnimatedVideo = async (caption: string, style: string = 'ghibli'): Promise<GenerateAnimatedVideoResponse> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/generate-animated-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ caption, style }),
    });
    
    return await parseApiResponse(response);
  } catch (error) {
    console.error("Error generating animated video:", error);
    throw error;
  }
};

export const useGenerateCaption = () => {
  return useMutation({
    mutationFn: (image: File) => apiGenerateCaption(image),
    onError: (error: Error) => {
      console.error("Error generating caption:", error);
      toast.error(`Failed to generate caption: ${error.message || "Unknown error"}`);
    }
  });
};

export const useGenerateVideoCaption = () => {
  return useMutation({
    mutationFn: (video: File) => apiGenerateVideoCaption(video),
    onError: (error: Error) => {
      console.error("Error generating video caption:", error);
      toast.error(`Failed to analyze video: ${error.message || "Unknown error"}`);
    }
  });
};

export const useGenerateImage = () => {
  return useMutation({
    mutationFn: (caption: string) => apiGenerateImage(caption),
    onError: (error: Error) => {
      console.error("Error generating image:", error);
      toast.error(`Failed to generate image: ${error.message || "Unknown error"}`);
    }
  });
};

export const useGenerateAnimatedVideo = () => {
  return useMutation({
    mutationFn: ({ caption, style }: { caption: string; style?: string }) => 
      apiGenerateAnimatedVideo(caption, style),
    onError: (error: Error) => {
      console.error("Error generating animated video:", error);
      toast.error(`Failed to generate animated video: ${error.message || "Unknown error"}`);
    }
  });
};
