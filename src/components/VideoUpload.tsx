
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Video, FileVideo } from "lucide-react";
import { formatFileSize } from "@/utils/api";

interface VideoUploadProps {
  onVideoSelected: (file: File, previewUrl: string) => void;
  onReset: () => void;
  previewUrl: string | null;
}

const VideoUpload = ({ onVideoSelected, onReset, previewUrl }: VideoUploadProps) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoInfo, setVideoInfo] = useState<{ duration: string; size: string } | null>(null);

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
    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }
    
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size should be less than 50MB");
      return;
    }
    
    const videoUrl = URL.createObjectURL(file);
    
    // Get video duration and other info
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      
      setVideoInfo({
        duration: `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`,
        size: formatFileSize(file.size)
      });
      
      // Release the video URL
      URL.revokeObjectURL(video.src);
    };
    
    video.src = videoUrl;
    
    onVideoSelected(file, videoUrl);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Video className="h-5 w-5 text-purple" />
        Upload Your Video
      </h3>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative h-64 border-2 ${isDragging ? 'border-purple' : 'border-dashed border-gray-300 dark:border-gray-700'} rounded-lg flex flex-col items-center justify-center p-6 transition-all hover:border-purple hover:bg-purple/5`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {previewUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <video 
              ref={videoRef}
              src={previewUrl} 
              className="max-h-full max-w-full object-contain rounded-lg" 
              controls
            />
            {videoInfo && (
              <div className="mt-2 text-sm text-gray-500">
                <span>Duration: {videoInfo.duration}</span>
                <span className="mx-2">•</span>
                <span>Size: {videoInfo.size}</span>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center"
            onClick={triggerFileInput}
          >
            <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Click to browse or drag & drop your video here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              MP4, MOV, WEBM up to 50MB
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
          Select Video
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

export default VideoUpload;
