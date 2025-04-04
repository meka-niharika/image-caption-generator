
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Camera, ImagePlus } from "lucide-react";

interface ImageUploadProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  onReset: () => void;
  previewUrl: string | null;
}

const ImageUpload = ({ onImageSelected, onReset, previewUrl }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
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
    
    onImageSelected(file, URL.createObjectURL(file));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
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
        onClick={triggerFileInput}
        className={`relative h-64 border-2 ${isDragging ? 'border-purple' : 'border-dashed border-gray-300 dark:border-gray-700'} rounded-lg flex flex-col items-center justify-center p-6 transition-all cursor-pointer hover:border-purple hover:bg-purple/5`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-center">
            <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Click to browse or drag & drop your image here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}
      </div>
      
      <div className="flex gap-3">
        <Button 
          onClick={triggerFileInput} 
          variant="outline" 
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Select Image
        </Button>
        
        {previewUrl && (
          <Button 
            onClick={onReset} 
            variant="destructive" 
            className="w-full"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
