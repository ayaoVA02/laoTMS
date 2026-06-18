import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Section } from "@/components/ui/section";
import { Field } from "@/components/ui/field";
import type { AttractionType } from "../../data/attractions";

interface BasicInfoSectionProps {
  nameEn: string;
  setNameEn: (v: string) => void;
  nameLa: string;
  setNameLa: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  activity: string;
  setActivity: (v: string) => void;
  license: string;
  setLicense: (v: string) => void;
  typeId: string;
  setTypeId: (v: string) => void;
  types: AttractionType[];
  errors: Set<string>;
  clearError: (key: string) => void;
  inputCls: (key: string) => string;
}

export function BasicInfoSection({
  nameEn, setNameEn,
  nameLa, setNameLa,
  description, setDescription,
  activity, setActivity,
  license, setLicense,
  typeId, setTypeId,
  types,
  errors,
  clearError,
  inputCls,
}: BasicInfoSectionProps) {
  return (
    <Section title="Basic Information" icon={<Info className="w-4 h-4" />}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name (English)" required hasError={errors.has("nameEn")}>
            <Input
              placeholder="e.g. Kuang Si Waterfall"
              value={nameEn}
              onChange={(e) => {
                setNameEn(e.target.value);
                clearError("nameEn");
              }}
              className={inputCls("nameEn")}
            />
          </Field>
          <Field label="Name (Lao)">
            <Input
              placeholder="ຊື່ພາສາລາວ"
              value={nameLa}
              onChange={(e) => setNameLa(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Category" required hasError={errors.has("typeId")}>
          <Select
            value={typeId}
            onValueChange={(v) => {
              setTypeId(v);
              clearError("typeId");
            }}
          >
            <SelectTrigger className={inputCls("typeId")}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {types.map((tp) => (
                <SelectItem key={tp.type_id} value={tp.type_id}>
                  {tp.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Description" required hasError={errors.has("description")}>
          <Textarea
            placeholder="Describe your attraction in detail..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearError("description");
            }}
            className={`min-h-[110px] resize-none ${inputCls("description")}`}
          />
        </Field>

        <Field label="Activities">
          <Input
            placeholder="e.g. Swimming, hiking, photography"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
        </Field>

        <Field label="License / Permit Number">
          <Input
            placeholder="Official license number (if any)"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
          />
        </Field>
      </div>
    </Section>
  );
}