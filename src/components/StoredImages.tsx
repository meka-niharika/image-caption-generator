import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useStoredImages } from "@/hooks/use-ai-api";
import { getImageUrl } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ImageIcon } from "lucide-react"; // Removed `Image` import

const StoredImages = () => {
  const { data: images, isLoading, isError, error } = useStoredImages();
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption: string } | null>(null);

  const handleImageClick = (imageUrl: string, caption: string) => {
    setSelectedImage({ url: imageUrl, caption });
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple" />
          Saved Images
        </h2>

        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner text="Loading saved images..." />
          </div>
        ) : isError ? (
          <div className="text-red-500">Error: {error.message}</div>
        ) : images && images.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image._id}
                className="relative cursor-pointer rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                onClick={() => handleImageClick(getImageUrl(image.image_url), image.caption)}
              >
                <img
                  src={getImageUrl(image.image_url)}
                  alt={image.original_filename || "Generated Image"}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white p-2 text-sm">
                  {image.caption.length > 50 ? `${image.caption.substring(0, 50)}...` : image.caption}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            No images saved yet. Generate some images and they will appear here.
          </div>
        )}

        {selectedImage && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-2xl max-h-screen overflow-auto">
              <img src={selectedImage.url} alt="Full Size" className="w-full rounded-md mb-4" />
              <p className="text-lg font-semibold mb-2">Caption:</p>
              <p className="text-gray-700 dark:text-gray-300">{selectedImage.caption}</p>
              <button
                className="mt-4 bg-purple text-white rounded-md px-4 py-2 hover:bg-purple-dark"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoredImages;
