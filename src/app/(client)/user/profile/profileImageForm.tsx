"use client";

import { Button } from "@/components/ui/button";
import { Link2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { User } from "../../../../../types/sanityTypes";

interface ProfileImageFormProps {
  user: User;
  previewUrl: string;
  setPreviewUrl: (url: string) => void;
  setImageFile: (file: File | null) => void;
}

const ProfileImageForm = ({
  previewUrl,
  setPreviewUrl,
  setImageFile,
  user,
}: ProfileImageFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const name = user.name;

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max size 2MB");
      return;
    }

    setImageFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const applyUrl = () => {
    if (!urlValue.trim()) return;

    setImageFile(null);
    setPreviewUrl(urlValue.trim());
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <span className="relative h-24 w-24 overflow-hidden rounded-full border">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile"
            fill
            className="object-cover"
            sizes="100%"
            loading="eager"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-semibold">
            {name?.split(" ")[0].charAt(0).toUpperCase() +
              "-" +
              name?.split(" ")[1].charAt(0).toUpperCase()}
          </div>
        )}
      </span>
      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={handleSelectImage}
      />
      {/* buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUrlInput(!showUrlInput)}
        >
          <Link2 className="mr-2 h-4 w-4" />
          Use URL
        </Button>

        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setPreviewUrl("");
              setImageFile(null);
            }}
          >
            Remove
          </Button>
        )}
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="w-full space-y-2">
          <input
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />

          <Button type="button" className="w-full" onClick={applyUrl}>
            Apply Image URL
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileImageForm;
