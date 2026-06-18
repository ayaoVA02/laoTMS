import { Loader2, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  saving: boolean;
  allUploaded: boolean;
  onDraft: () => void;
  onSubmit: () => void;
}

export function FormActions({ saving, allUploaded, onDraft, onSubmit }: FormActionsProps) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={saving}
          onClick={onDraft}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save as Draft
        </Button>
        <Button
          type="button"
          disabled={saving || !allUploaded}
          onClick={onSubmit}
          className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/20"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Submit for Review
        </Button>
      </div>

      {!allUploaded && (
        <p className="text-center text-xs text-amber-500 flex items-center justify-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" /> Still uploading, please wait...
        </p>
      )}
    </div>
  );
}