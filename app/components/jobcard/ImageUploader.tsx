"use client";

import { useState, useRef, useCallback } from "react";

interface UploadedImage {
  url: string;
  key: string;
  name: string;
  localPreview?: string;
}

interface Props {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export function ImageUploader({
  onImagesChange,
  maxImages = 10,
  existingImages,
}: Props) {
  const [images, setImages] = useState<UploadedImage[]>(() => {
    if (existingImages && existingImages.length > 0) {
      return existingImages.map((url, i) => ({
        url,
        key: `existing-${i}`,
        name: url.split("/").pop() || `Image ${i + 1}`,
      }));
    }
    return [];
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      const toUpload = fileArray.slice(0, remaining);
      setUploading(true);
      setError("");

      // Show local previews immediately
      const previews: UploadedImage[] = toUpload.map((f) => ({
        url: "",
        key: `pending-${Date.now()}-${Math.random()}`,
        name: f.name,
        localPreview: URL.createObjectURL(f),
      }));
      const withPreviews = [...images, ...previews];
      setImages(withPreviews);

      try {
        const formData = new FormData();
        toUpload.forEach((f) => formData.append("files", f));

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { images: uploaded } = await res.json();

        // Replace pending previews with real URLs
        const existingReal = images.filter((img) => img.url);
        const newImages: UploadedImage[] = uploaded.map(
          (u: { url: string; key: string; name: string }) => ({
            url: u.url,
            key: u.key,
            name: u.name,
          }),
        );
        const updated = [...existingReal, ...newImages];

        // Revoke old preview URLs
        previews.forEach((p) => {
          if (p.localPreview) URL.revokeObjectURL(p.localPreview);
        });

        setImages(updated);
        onImagesChange(updated.map((img) => img.url));
      } catch (err) {
        // Remove pending previews on error
        previews.forEach((p) => {
          if (p.localPreview) URL.revokeObjectURL(p.localPreview);
        });
        setImages(images);
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [images, maxImages, onImagesChange],
  );

  const removeImage = useCallback(
    (index: number) => {
      const removed = images[index];
      if (removed?.localPreview) URL.revokeObjectURL(removed.localPreview);
      const updated = images.filter((_, i) => i !== index);
      setImages(updated);
      onImagesChange(updated.filter((img) => img.url).map((img) => img.url));

      // Delete from S3 if it was a real upload
      if (removed?.url && removed.key && !removed.key.startsWith("pending-")) {
        // For existing images loaded from URLs, extract the S3 key from the URL
        const s3Key = removed.key.startsWith("existing-")
          ? removed.url.split(".amazonaws.com/")[1]
          : removed.key;
        if (s3Key) {
          fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: s3Key }),
          }).catch(() => {});
        }
      }
    },
    [images, onImagesChange],
  );

  const getDisplayUrl = (img: UploadedImage) => img.localPreview || img.url;

  return (
    <div className="space-y-3">
      {/* Upload buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          Upload Photos
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
            />
          </svg>
          Take Photo
        </button>
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            Uploading...
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && <p className="text-xs text-danger">{error}</p>}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <div
              key={img.key}
              className="relative group aspect-square rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 cursor-pointer"
              onClick={() => setLightboxIndex(idx)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getDisplayUrl(img)}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              {!img.url && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/40 px-1.5 py-0.5">
                <p className="text-[10px] text-white truncate">{img.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-surface-400">
        {images.length}/{maxImages} photos uploaded. JPEG, PNG, WebP accepted.
      </p>

      {/* Lightbox modal */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-100 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white cursor-pointer"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Nav arrows */}
            {lightboxIndex > 0 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(lightboxIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer z-10"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
            )}
            {lightboxIndex < images.length - 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(lightboxIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer z-10"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            )}

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getDisplayUrl(images[lightboxIndex])}
              alt={images[lightboxIndex].name}
              className="w-full max-h-[85vh] object-contain rounded-lg"
            />

            {/* Caption */}
            <div className="text-center mt-2">
              <p className="text-white/70 text-sm">
                {images[lightboxIndex].name}
              </p>
              <p className="text-white/40 text-xs">
                {lightboxIndex + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
