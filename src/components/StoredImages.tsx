
import { useStoredImages } from "@/hooks/use-ai-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Gallery, Import, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const StoredImages = () => {
  const { data: images, isLoading, error } = useStoredImages();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gallery className="h-5 w-5 text-purple" />
            Saved Images
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <LoadingSpinner text="Loading saved images..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gallery className="h-5 w-5 text-purple" />
            Saved Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-destructive">
            Error loading saved images: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!images || images.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gallery className="h-5 w-5 text-purple" />
            Saved Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Import className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">No saved images yet</p>
            <p className="text-gray-500">Images you generate will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gallery className="h-5 w-5 text-purple" />
          Saved Images ({images.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <motion.div
              key={image._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="overflow-hidden rounded-lg border bg-card shadow"
            >
              <div className="aspect-square relative overflow-hidden">
                {image.image_url.startsWith('data:image') ? (
                  <img 
                    src={image.image_url} 
                    alt={image.caption} 
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : image.image_url.startsWith('http') ? (
                  <img 
                    src={image.image_url} 
                    alt={image.caption} 
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="mb-2 line-clamp-2 font-medium">"{image.caption}"</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>
                    {image.created_at 
                      ? format(new Date(image.created_at), 'MMM d, yyyy')
                      : 'Unknown date'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoredImages;
