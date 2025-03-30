
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { search, Image, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateImage } from "@/hooks/use-ai-api";
import LoadingSpinner from "@/components/LoadingSpinner";

const CaptionToImage = () => {
  const [caption, setCaption] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { mutate: generateImage, isPending } = useGenerateImage();
  
  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
  };
  
  const handleGenerateImage = () => {
    if (!caption.trim()) {
      toast.error("Please enter a caption first");
      return;
    }
    
    generateImage(caption, {
      onSuccess: (data) => {
        setGeneratedImageUrl(data.imageUrl);
        toast.success("Image generated successfully!");
      },
      onError: (error) => {
        toast.error(`Error generating image: ${error.message || "Unknown error"}`);
      }
    });
  };
  
  const handleReset = () => {
    setCaption("");
    setGeneratedImageUrl(null);
  };
  
  const handleDownload = () => {
    if (!generatedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `ai-generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column - Caption Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <search className="h-5 w-5 text-purple" />
              Enter Your Caption
            </h3>
            
            <div className="flex flex-col h-64">
              <Textarea
                ref={textareaRef}
                value={caption}
                onChange={handleCaptionChange}
                placeholder="Enter a detailed description of the image you want to generate..."
                className="flex-1 resize-none text-base p-4"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleGenerateImage} 
                disabled={!caption.trim() || isPending}
                className="w-full ai-gradient-bg hover:opacity-90"
              >
                {isPending ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">◌</span>
                    Generating...
                  </span>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="w-full"
                disabled={isPending}
              >
                Reset
              </Button>
            </div>
          </div>
          
          {/* Right Column - Generated Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Image className="h-5 w-5 text-purple" />
              Generated Image
            </h3>
            
            <div className="border rounded-lg h-64 flex items-center justify-center overflow-hidden">
              {isPending ? (
                <LoadingSpinner text="Generating image..." />
              ) : generatedImageUrl ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={generatedImageUrl}
                  alt="Generated"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                  <p>Enter a caption and click "Generate Image" to see the result here</p>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleDownload} 
              disabled={!generatedImageUrl} 
              variant="outline" 
              className="w-full"
            >
              Download Image
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaptionToImage;
