"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";

interface FacilityToggleProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  subContent?: React.ReactNode;
}

export function FacilityToggle({
  icon,
  label,
  checked,
  onChange,
  subContent,
}: FacilityToggleProps) {
  return (
    <div
      className={`rounded-xl border-2 transition-all p-3 ${
        checked
          ? "border-teal-500 bg-teal-500/5"
          : "border-border hover:border-teal-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={checked ? "text-teal-500" : "text-muted-foreground"}>
            {icon}
          </span>
          {label}
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
      <AnimatePresence>
        {checked && subContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden"
          >
            {subContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}