
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Image, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateCaption } from "@/hooks/use-ai-api";
import LoadingSpinner from "@/components/LoadingSpinner";

const ImageToCaption = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
  const queryClient = useQueryClient();
  const { mutate: generateCaption, isPending } = useGenerateCaption();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCaption(null);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add("drag-over");
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove("drag-over");
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove("drag-over");
    }
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image file");
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCaption(null);
    }
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
  
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column - Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple" />
              Upload Your Image
            </h3>
            
            <div
              ref={dropAreaRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="relative h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center p-6 transition-all file-input-container"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              />
              
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Drag & drop your image here or click to browse
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
              
              {previewUrl && (
                <Button 
                  onClick={handleReset} 
                  variant="destructive" 
                  className="w-full"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
          
          {/* Right Column - Generated Caption */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Image className="h-5 w-5 text-purple" />
              Generated Caption
            </h3>
            
            <div className="border rounded-lg h-64 flex flex-col">
              {isPending ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner text="Generating caption..." />
                </div>
              ) : caption ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex-1 p-4 flex items-center justify-center"
                >
                  <p className="text-lg text-center">"{caption}"</p>
                </motion.div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-gray-500 dark:text-gray-400 p-4">
                  <p>Upload an image and click "Generate Caption" to see the result here</p>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleGenerateCaption} 
              disabled={!selectedFile || isPending} 
              className="w-full ai-gradient-bg hover:opacity-90"
            >
              {isPending ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">◌</span>
                  Processing...
                </span>
              ) : (
                <span>Generate Caption</span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageToCaption;
