"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, Eye, Check, Video, Image as ImageIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import type { ImageItem, VideoItem } from "../../data/attractions";

interface MediaSectionProps {
  images: ImageItem[];
  videos: VideoItem[];
  errors: Set<string>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  videoInputRef: React.RefObject<HTMLInputElement>;
  handleImages: (files: FileList | null) => void;
  handleVideos: (files: FileList | null) => void;
  removeImage: (id: string) => void;
  setThumbnail: (id: string) => void;
  setVideos: (fn: (prev: VideoItem[]) => VideoItem[]) => void;
}

export function MediaSection({
  images,
  videos,
  errors,
  fileInputRef,
  videoInputRef,
  handleImages,
  handleVideos,
  removeImage,
  setThumbnail,
  setVideos,
}: MediaSectionProps) {
  return (
    <Section title="Photos & Videos" icon={<ImageIcon className="w-4 h-4" />}>
      <div className="space-y-5">
        {/* ── Photos ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">
              Photos <span className="text-red-500">*</span>
            </p>
            {errors.has("images") && (
              <span className="text-xs text-red-500">At least 1 photo required</span>
            )}
          </div>

          <div
            onDrop={(e) => {
              e.preventDefault();
              handleImages(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
              errors.has("images")
                ? "border-red-500 bg-red-500/5"
                : "border-muted-foreground/25 hover:border-teal-500/60 hover:bg-teal-500/5"
            }`}
          >
            <Upload className="w-7 h-7 text-muted-foreground mb-1.5" />
            <p className="text-sm text-muted-foreground font-medium">
              Drop photos here or click to browse
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              PNG, JPG, WEBP · Select multiple
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImages(e.target.files)}
            />
          </div>

          {images.length > 0 && (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                <AnimatePresence>
                  {images.map((img) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2"
                      style={{
                        borderColor: img.isThumbnail
                          ? "rgb(20 184 166)"
                          : "transparent",
                      }}
                    >
                      <img
                        src={img.previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                      {img.error && (
                        <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                          <X className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {img.isThumbnail && (
                        <div className="absolute top-1 left-1 bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          COVER
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {!img.isThumbnail && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setThumbnail(img.id);
                            }}
                            className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center"
                          >
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(img.id);
                          }}
                          className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {images.length} photo{images.length !== 1 ? "s" : ""} · Hover → 👁 set
                cover · ✕ remove
              </p>
            </>
          )}
        </div>

        {/* ── Videos ── */}
        <div className="border-t pt-4">
          <p className="text-sm font-semibold mb-2">
            Videos{" "}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </p>

          <div
            onDrop={(e) => {
              e.preventDefault();
              handleVideos(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => videoInputRef.current?.click()}
            className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-teal-500/60 hover:bg-teal-500/5 cursor-pointer transition-all"
          >
            <Video className="w-7 h-7 text-muted-foreground mb-1.5" />
            <p className="text-sm text-muted-foreground font-medium">
              Drop videos or click to browse
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              MP4, WebM · Select multiple
            </p>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={(e) => handleVideos(e.target.files)}
            />
          </div>

          {videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <AnimatePresence>
                {videos.map((vid) => (
                  <motion.div
                    key={vid.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group rounded-xl overflow-hidden border border-border bg-black"
                  >
                    <video
                      src={vid.previewUrl}
                      className="w-full h-36 object-cover"
                      onMouseEnter={(e) => {
                        if (!vid.uploading)
                          (e.target as HTMLVideoElement).play();
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLVideoElement).pause();
                        (e.target as HTMLVideoElement).currentTime = 0;
                      }}
                    />
                    {vid.uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                    {vid.uploadedUrl && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideos((prev) =>
                            prev.filter((v) => v.id !== vid.id)
                          );
                        }}
                        className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-2 py-1.5">
                      <p className="text-xs text-white truncate">{vid.file.name}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}