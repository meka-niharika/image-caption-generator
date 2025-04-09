
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageToCaption from "@/components/ImageToCaption";
import CaptionToImage from "@/components/CaptionToImage";
import VideoToCaption from "@/components/VideoToCaption";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("image-to-caption");
  
  const handleChangeTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6 space-y-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple to-aiblue-dark">
            AI Media Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate captions from images/videos or create media from text with our AI-powered tools
          </p>
        </div>

        <Tabs
          defaultValue="image-to-caption"
          value={activeTab}
          onValueChange={handleChangeTab}
          className="w-full max-w-4xl mx-auto"
        >
          <TabsList className="grid grid-cols-3 w-full mb-8">
            <TabsTrigger value="image-to-caption" className="text-base py-3">
              Image to Caption
            </TabsTrigger>
            <TabsTrigger value="video-to-caption" className="text-base py-3">
              Video to Caption
            </TabsTrigger>
            <TabsTrigger value="caption-to-image" className="text-base py-3">
              Caption to Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image-to-caption">
            <ImageToCaption />
          </TabsContent>

          <TabsContent value="video-to-caption">
            <VideoToCaption />
          </TabsContent>
          
          <TabsContent value="caption-to-image">
            <CaptionToImage />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
