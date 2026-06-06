import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { SanityAsset } from "@sanity/image-url";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface FoodImageModalProps {
  images: SanityAsset[];
  currentIndex: number;
  onClose: () => void;
  foodName: string;
}
const FoodImageModal = ({
  images,
  currentIndex,
  onClose,
  foodName,
}: FoodImageModalProps) => {
  const [mainImageIndex, setMainImageIndex] = useState(currentIndex);
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button
        className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        aria-label="Close gallery"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
        {mainImageIndex + 1} / {images.length}
      </div>

      <button
        className="absolute left-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        aria-label="Previous image"
        onClick={() => setMainImageIndex((prev) => prev - 1)}
        disabled={mainImageIndex === 0}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-8">
        <div className="relative min-w-md  max-w-5xl max-h-full">
          <Image
            src={urlFor(images[mainImageIndex]).url()}
            alt={`${foodName} ${mainImageIndex + 1}`}
            width={800}
            height={800}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <button
        className="absolute right-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        aria-label="Next image"
        onClick={() => setMainImageIndex((prev) => prev + 1)}
        disabled={mainImageIndex === images.length - 1}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 max-w-full overflow-x-auto px-4 py-2">
        {images.map((image, index) => (
          <button
            key={"thumbnail" + index}
            className={cn(
              "relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ",
              mainImageIndex === index
                ? "border-primary scale-110"
                : "border-white/20 hover:border-white/50",
            )}
            onClick={() => setMainImageIndex(index)}
          >
            <Image
              alt={`Thumbnail ${index + 1}`}
              loading="lazy"
              width="80"
              height="80"
              className={cn(
                "w-full h-full object-cover transition-transform duration-300",
                mainImageIndex === index ? "scale-110" : "",
              )}
              src={urlFor(image).url()}
              style={{ color: "transparent" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FoodImageModal;
