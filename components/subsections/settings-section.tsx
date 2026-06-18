"use client";

import { Globe, Share2, Loader2, Sparkles, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Section } from "@/components/ui/section";
import type { ImageItem } from "../../data/attractions";

interface SettingsSectionProps {
  socialShare: boolean;
  setSocialShare: (v: boolean) => void;
  postFacebook: boolean;
  setPostFacebook: (v: boolean) => void;
  postTiktok: boolean;
  setPostTiktok: (v: boolean) => void;
  postInstagram: boolean;
  setPostInstagram: (v: boolean) => void;
  socialCaption: string;
  setSocialCaption: (v: string) => void;
  generatingSocial: boolean;
  handleGenerateSocialCaption: () => void;
  images: ImageItem[];
  socialImageIds: Set<string>;
  toggleSocialImage: (id: string) => void;
  selectCoverSocialImage: () => void;
  selectAllSocialImages: () => void;
  clearSocialImages: () => void;
}

export function SettingsSection({
  socialShare, setSocialShare,
  postFacebook, setPostFacebook,
  postTiktok, setPostTiktok,
  postInstagram, setPostInstagram,
  socialCaption, setSocialCaption,
  generatingSocial,
  handleGenerateSocialCaption,
  images,
  socialImageIds,
  toggleSocialImage,
  selectCoverSocialImage,
  selectAllSocialImages,
  clearSocialImages,
}: SettingsSectionProps) {
  return (
    <Section
      title="Settings"
      icon={<Globe className="w-4 h-4" />}
      defaultOpen={false}
    >
      {/* Social sharing toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
        <div className="flex items-center gap-3">
          <Share2 className="w-4 h-4 text-teal-500 shrink-0" />
          <div>
            <p className="text-sm font-medium">Social Sharing</p>
            <p className="text-xs text-muted-foreground">
              Allow visitors to share this attraction
            </p>
          </div>
        </div>
        <Switch checked={socialShare} onCheckedChange={setSocialShare} />
      </div>

      {socialShare && (
        <div className="mt-4 space-y-4">
          {/* Platform checkboxes */}
          <div className="p-3 rounded-xl border bg-card">
            <p className="text-sm font-semibold mb-2">Post to</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border cursor-pointer">
                <Checkbox
                  checked={postFacebook}
                  onCheckedChange={(v) => setPostFacebook(Boolean(v))}
                />
                <span className="text-sm">Facebook</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border cursor-pointer">
                <Checkbox
                  checked={postTiktok}
                  disabled
                  onCheckedChange={(v) => setPostTiktok(Boolean(v))}
                />
                <span className="text-sm">TikTok</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border cursor-pointer">
                <Checkbox
                  checked={postInstagram}
                  disabled
                  onCheckedChange={(v) => setPostInstagram(Boolean(v))}
                />
                <span className="text-sm">Instagram</span>
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              This only saves a social draft. Actual posting will be added later.
            </p>
          </div>

          {/* Caption */}
          <div className="p-3 rounded-xl border bg-card space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Social caption</p>
                <p className="text-[11px] text-muted-foreground">
                  Write your own, or generate with AI.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9"
                disabled={generatingSocial}
                onClick={handleGenerateSocialCaption}
              >
                {generatingSocial ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate AI
              </Button>
            </div>
            <Textarea
              placeholder="Short, interesting caption for social media..."
              value={socialCaption}
              onChange={(e) => setSocialCaption(e.target.value)}
              className="min-h-[110px] resize-none"
            />
          </div>

          {/* Image picker */}
          <div className="p-3 rounded-xl border bg-card">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-semibold">Social images</p>
                <p className="text-[11px] text-muted-foreground">
                  Pick from the photos you already selected (no re-upload).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={selectCoverSocialImage}
                >
                  Use cover
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={selectAllSocialImages}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={clearSocialImages}
                >
                  Clear
                </Button>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="p-4 rounded-xl bg-muted/40 border border-dashed text-center text-xs text-muted-foreground">
                Add photos in the Photos & Videos section first.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {images.map((img) => {
                  const checked = socialImageIds.has(img.id);
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => toggleSocialImage(img.id)}
                      className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                        checked
                          ? "border-teal-500"
                          : "border-transparent hover:border-teal-500/40"
                      }`}
                      title="Click to select"
                    >
                      <img
                        src={img.previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {img.isThumbnail && (
                        <div className="absolute top-1 left-1 bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          COVER
                        </div>
                      )}
                      {checked && (
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <p className="text-[11px] text-muted-foreground mt-2">
              Selected: {socialImageIds.size}
            </p>
          </div>
        </div>
      )}
    </Section>
  );
}