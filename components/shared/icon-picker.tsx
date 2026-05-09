"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import * as LucideIcons from "lucide-react";

const ICON_NAMES = Object.keys(LucideIcons).filter(
  (key) => key !== "createLucideIcon" && key !== "icons" && /^[A-Z]/.test(key)
);

const POPULAR_ICONS = [
  "Landmark", "TreePine", "Mountain", "Palette", "UtensilsCrossed",
  "Waves", "Building2", "Music", "Camera", "Compass", "Coffee",
  "Flower2", "Sun", "CloudRain", "Fish", "Bird", "Tent",
  "Sailboat", "Church", "Castle", "Store", "Wine", "Dumbbell",
  "Droplets", "Leaf", "Globe", "MapPin", "Star", "Heart",
  "Sparkles", "Zap", "Feather", "Anchor", "Ship", "Car",
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredIcons = useMemo(() => {
    if (!search) return POPULAR_ICONS;
    const q = search.toLowerCase();
    return ICON_NAMES.filter((name) => name.toLowerCase().includes(q)).slice(0, 50);
  }, [search]);

  const SelectedIcon = value && (LucideIcons as unknown as Record<string, React.ElementType>)[value]
    ? (LucideIcons as unknown as Record<string, React.ElementType>)[value]
    : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {SelectedIcon ? (
          <>
            <SelectedIcon className="w-4 h-4 text-teal-500" />
            <span>{value}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Pick an icon...</span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-lg border bg-white dark:bg-gray-900 shadow-xl">
          <div className="p-2">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-2 grid grid-cols-6 gap-1">
            {filteredIcons.map((name) => {
              const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[name];
              if (!Icon) return null;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    value === name
                      ? "bg-teal-500 text-white"
                      : "hover:bg-teal-500/10 text-muted-foreground hover:text-teal-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          {value && (
            <div className="p-2 border-t flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Selected:</span>
              {SelectedIcon && <SelectedIcon className="w-4 h-4 text-teal-500" />}
              <span className="text-xs font-medium">{value}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function getLucideIcon(name: string): React.ElementType | null {
  if (!name) return null;
  return (LucideIcons as unknown as Record<string, React.ElementType>)[name] || null;
}
