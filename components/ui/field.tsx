import { Label } from "@/components/ui/label";

interface FieldProps {
  label: string;
  required?: boolean;
  hasError?: boolean;
  children: React.ReactNode;
}

export function Field({ label, required, hasError, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hasError && (
          <span className="text-red-500 ml-2 text-xs font-normal">Required</span>
        )}
      </Label>
      {children}
    </div>
  );
}