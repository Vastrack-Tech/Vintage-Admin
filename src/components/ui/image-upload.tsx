"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2, Play, FileVideo } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Helper to detect if a URL is a video
  const isVideo = (url: string) => {
    return (
      url.match(/\.(mp4|webm|ogg|mov)$/i) ||
      url.includes("/video/upload") ||
      url.endsWith(".mp4")
    );
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "vintage_admin");

        // 1. Determine correct Cloudinary resource type endpoint
        // Images go to /image/upload, Videos go to /video/upload
        const resourceType = file.type.startsWith("video/") ? "video" : "image";

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (data.secure_url) {
          newUrls.push(data.secure_url);
        } else {
          console.error("Upload error:", data);
        }
      }
      onChange([...value, ...newUrls]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-gray-200 bg-gray-100"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* 2. Preview Logic: Render Video or Image */}
            {isVideo(url) ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black relative group">
                <video
                  src={url}
                  className="w-full h-full object-cover opacity-80"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white fill-white opacity-80" />
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1">
                  <FileVideo className="h-3 w-3" /> Video
                </div>
              </div>
            ) : (
              <Image fill className="object-cover" alt="Uploaded Media" src={url} />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          disabled={disabled || isUploading}
          variant="secondary"
          className="relative overflow-hidden"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4 mr-2" />
          )}
          {isUploading ? "Uploading..." : "Upload Media (Image/Video)"}

          <input
            type="file"
            multiple
            // 3. Update Accept attribute
            accept="image/*,video/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onUpload}
            disabled={disabled || isUploading}
          />
        </Button>
      </div>
    </div>
  );
}