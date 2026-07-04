import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Trash2, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import { ImageItem } from "@/hooks/useProductImageGallery";

// --- Inside Form Render ---
interface ProductFormImageViewerProps {
  images: ImageItem[];
  dragActiveIndex: number | null;
  handleDrag: (e: React.DragEvent, index: number) => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  handleFileSelect: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  handleMakeCover: (index: number) => void;
  handleDeleteSlot: (index: number) => void;
  isPending: boolean;
}

function ProductFormImageViewer({
  images,
  dragActiveIndex,
  handleDrag,
  handleDrop,
  handleFileSelect,
  handleMakeCover,
  handleDeleteSlot,
  isPending,
}: ProductFormImageViewerProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Product Image Gallery (Up to 6)
      </Label>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img, index) => {
          const isCover = index === 0;
          const hasImage = !!img.url;
          const isDragActive = dragActiveIndex === index;

          return (
            <div
              key={index}
              className={`relative group border border-dashed rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-200 ${
                isCover
                  ? "col-span-3 h-48 bg-slate-50/50"
                  : "col-span-1 aspect-square bg-slate-50"
              } ${
                hasImage
                  ? "border-solid border-border"
                  : isDragActive
                    ? "border-solid border-2 border-primary scale-[1.01] bg-primary/5" // 👈 Single active border state on outer container
                    : "border-dashed border-slate-300 hover:border-primary/50 cursor-pointer"
              }`}
            >
              {img.isUploading ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <span className="text-[10px] text-muted-foreground">
                    Uploading...
                  </span>
                </div>
              ) : hasImage ? (
                <>
                  <Image
                    src={img.url}
                    alt={`Slot ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes={isCover ? "500px" : "150px"}
                  />
                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    {!isCover && (
                      <Button
                        type="button"
                        onClick={() => handleMakeCover(index)}
                        variant="secondary"
                        size="icon-sm"
                        className="h-8 w-8 hover:cursor-pointer"
                        title="Set as Main Cover"
                      >
                        <Star className="size-4 text-amber-500 fill-current" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => handleDeleteSlot(index)}
                      variant="destructive"
                      size="icon-sm"
                      className="h-8 w-8 hover:cursor-pointer"
                      title="Remove Image"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {isCover && (
                    <span className="absolute bottom-2 left-2 px-2.5 py-1 bg-primary text-[10px] font-bold text-white rounded-md shadow-xs">
                      COVER IMAGE
                    </span>
                  )}
                </>
              ) : (
                <label
                  tabIndex={0}
                  role="button"
                  aria-label={
                    isCover
                      ? "Upload Cover Image"
                      : `Upload Image Slot ${index + 1}`
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.currentTarget.querySelector("input")?.click();
                    }
                  }}
                  onDragEnter={(e) => handleDrag(e, index)}
                  onDragOver={(e) => handleDrag(e, index)}
                  onDragLeave={(e) => handleDrag(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl`}
                >
                  <Camera
                    className={`size-5 mb-1 transition-colors ${isDragActive ? "text-primary" : "text-slate-400 group-hover:text-primary"}`}
                  />
                  <span
                    className={`text-[10px] text-center transition-colors ${isDragActive ? "text-primary font-medium" : "text-slate-500 group-hover:text-primary"}`}
                  >
                    {isDragActive ? (
                      <span className="text-sm font-semibold mt-4">
                        &apos;Drop file here&apos;
                      </span>
                    ) : isCover ? (
                      "Upload Cover Image"
                    ) : (
                      `Slot ${index + 1}`
                    )}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleFileSelect(e, index);
                    }}
                    disabled={isPending}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductFormImageViewer;
