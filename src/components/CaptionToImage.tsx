
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGenerateImage, useGenerateAnimatedVideo } from "@/hooks/use-ai-api";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, FileVideo } from "lucide-react";

const CaptionToImage = () => {
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [animationStyle, setAnimationStyle] = useState<string>("ghibli");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const { mutate: generateImage, isPending: isGeneratingImage } = useGenerateImage();
  const { mutate: generateAnimatedVideo, isPending: isGeneratingVideo } = useGenerateAnimatedVideo();

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
  };

  const handleGenerateMedia = () => {
    if (!caption.trim()) return;

    if (mediaType === "image") {
      generateImage(caption, {
        onSuccess: (data) => {
          setGeneratedImageUrl(data.imageUrl);
          setGeneratedVideoUrl(null);
        }
      });
    } else {
      generateAnimatedVideo({ caption, style: animationStyle }, {
        onSuccess: (data) => {
          setGeneratedVideoUrl(data.videoUrl);
          setGeneratedImageUrl(null);
        }
      });
    }
  };

  const isPending = isGeneratingImage || isGeneratingVideo;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="p-6 shadow-md">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-4">Enter Your Description</h3>

          <Textarea
            placeholder="Describe what you want to see in the generated media..."
            className="min-h-[150px] resize-none"
            value={caption}
            onChange={handleCaptionChange}
          />

          <div className="space-y-4">
            <div>
              <Label htmlFor="media-type">Generate</Label>
              <Tabs 
                defaultValue="image" 
                value={mediaType}
                onValueChange={(value) => setMediaType(value as "image" | "video")}
                className="w-full mt-1"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <FileVideo className="h-4 w-4" />
                    Animated Video
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {mediaType === "video" && (
              <div className="space-y-2">
                <Label htmlFor="animation-style">Animation Style</Label>
                <Select 
                  value={animationStyle} 
                  onValueChange={setAnimationStyle}
                >
                  <SelectTrigger id="animation-style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ghibli">Studio Ghibli</SelectItem>
                    <SelectItem value="pixar">Pixar</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="3d">3D Animation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerateMedia}
            disabled={!caption.trim() || isPending}
            className="w-full ai-gradient-bg hover:opacity-90"
          >
            {isPending ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">◌</span>
                Processing...
              </span>
            ) : (
              <span>Generate {mediaType === "image" ? "Image" : "Video"}</span>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6 shadow-md">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">
            {mediaType === "image" ? (
              <span className="flex items-center gap-2">
                <Image className="h-5 w-5 text-purple" />
                Generated Image
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileVideo className="h-5 w-5 text-purple" />
                Generated Animation
              </span>
            )}
          </h3>

          <div className="border rounded-lg h-[350px] flex items-center justify-center overflow-hidden">
            {isPending ? (
              <LoadingSpinner text={`Generating ${mediaType === "image" ? "image" : "video"}...`} />
            ) : mediaType === "image" && generatedImageUrl ? (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={generatedImageUrl}
                alt={caption}
                className="max-h-full max-w-full object-contain"
              />
            ) : mediaType === "video" && generatedVideoUrl ? (
              <motion.video
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={generatedVideoUrl}
                controls
                className="max-h-full max-w-full"
              />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 p-6">
                <p>
                  {mediaType === "image"
                    ? "Your generated image will appear here"
                    : "Your animated video will appear here"}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CaptionToImage;
