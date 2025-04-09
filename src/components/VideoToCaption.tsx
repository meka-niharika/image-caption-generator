
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import VideoUpload from "@/components/VideoUpload";
import { Button } from "@/components/ui/button";
import { useGenerateVideoCaption } from "@/hooks/use-ai-api";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FileText, Video } from "lucide-react";

const VideoToCaption = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [animatedVideoUrl, setAnimatedVideoUrl] = useState<string | null>(null);
  
  const { mutate: generateCaption, isPending } = useGenerateVideoCaption();
  
  const handleVideoSelected = (file: File, url: string) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setCaption(null);
    setSummary(null);
    setAnimatedVideoUrl(null);
  };
  
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption(null);
    setSummary(null);
    setAnimatedVideoUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };
  
  const handleGenerateCaption = () => {
    if (!selectedFile) return;
    
    generateCaption(selectedFile, {
      onSuccess: (data) => {
        setCaption(data.caption);
        setSummary(data.summary);
        if (data.animatedVideoUrl) {
          setAnimatedVideoUrl(data.animatedVideoUrl);
        }
      }
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="p-6 shadow-md">
        <VideoUpload
          onVideoSelected={handleVideoSelected}
          onReset={handleReset}
          previewUrl={previewUrl}
        />
      </Card>
      
      <Card className="p-6 shadow-md">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple" />
            Generated Output
          </h3>
          
          <div className="border rounded-lg min-h-64 flex flex-col overflow-hidden">
            {isPending ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner text="Analyzing video..." />
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {(caption || summary || animatedVideoUrl) ? (
                  <div className="p-4 space-y-6">
                    {caption && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="space-y-2"
                      >
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Caption:</h4>
                        <p className="text-md">{caption}</p>
                      </motion.div>
                    )}
                    
                    {caption && summary && <Separator className="my-4" />}
                    
                    {summary && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="space-y-2"
                      >
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Summary:</h4>
                        <p className="text-md">{summary}</p>
                      </motion.div>
                    )}
                    
                    {animatedVideoUrl && (
                      <>
                        <Separator className="my-4" />
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Animated Video:
                          </h4>
                          <div className="rounded-lg overflow-hidden">
                            <video 
                              controls 
                              className="w-full" 
                              src={animatedVideoUrl}
                            ></video>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center text-gray-500 dark:text-gray-400 p-4">
                    <p>Upload a video and click "Analyze Video" to see the results here</p>
                  </div>
                )}
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
              <span>Analyze Video</span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VideoToCaption;
