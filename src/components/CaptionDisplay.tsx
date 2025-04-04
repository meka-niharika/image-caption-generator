
import { Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CaptionDisplayProps {
  caption: string | null;
  isPending: boolean;
  onGenerateCaption: () => void;
  isButtonDisabled: boolean;
}

const CaptionDisplay = ({ 
  caption, 
  isPending, 
  onGenerateCaption, 
  isButtonDisabled 
}: CaptionDisplayProps) => {
  return (
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
        onClick={onGenerateCaption} 
        disabled={isButtonDisabled} 
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
  );
};

export default CaptionDisplay;
