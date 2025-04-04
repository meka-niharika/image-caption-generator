
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateCaption } from "@/hooks/use-ai-api";
import ImageUpload from "@/components/ImageUpload";
import CaptionDisplay from "@/components/CaptionDisplay";

const ImageToCaption = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { mutate: generateCaption, isPending } = useGenerateCaption();

  const handleImageSelected = (file: File, preview: string) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setCaption(null);
  };
  
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption(null);
  };
  
  const handleGenerateCaption = () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    generateCaption(selectedFile, {
      onSuccess: (data) => {
        setCaption(data.caption);
        toast.success("Caption generated successfully!");
      },
      onError: (error) => {
        toast.error(`Error generating caption: ${error.message || "Unknown error"}`);
      }
    });
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column - Image Upload */}
          <ImageUpload 
            onImageSelected={handleImageSelected}
            onReset={handleReset}
            previewUrl={previewUrl}
          />
          
          {/* Right Column - Generated Caption */}
          <CaptionDisplay 
            caption={caption}
            isPending={isPending}
            onGenerateCaption={handleGenerateCaption}
            isButtonDisabled={!selectedFile || isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageToCaption;
