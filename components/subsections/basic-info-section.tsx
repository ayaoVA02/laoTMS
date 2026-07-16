import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();

  return (
    <Section title={t("dashboard.createForm.basicInfo.title", "Basic Information")} icon={<Info className="w-4 h-4" />}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t("dashboard.createForm.basicInfo.nameEn", "Name (English)")} required hasError={errors.has("nameEn")}>
            <Input
              placeholder={t("dashboard.createForm.basicInfo.nameEnPlaceholder", "e.g. Kuang Si Waterfall")}
              value={nameEn}
              onChange={(e) => {
                setNameEn(e.target.value);
                clearError("nameEn");
              }}
              className={inputCls("nameEn")}
            />
          </Field>
          <Field label={t("dashboard.createForm.basicInfo.nameLa", "Name (Lao)")}>
            <Input
              placeholder={t("dashboard.createForm.basicInfo.nameLaPlaceholder", "ຊື່ພາສາລາວ")}
              value={nameLa}
              onChange={(e) => setNameLa(e.target.value)}
            />
          </Field>
        </div>

        <Field label={t("dashboard.createForm.basicInfo.category", "Category")} required hasError={errors.has("typeId")}>
          <Select
            value={typeId}
            onValueChange={(v) => {
              setTypeId(v);
              clearError("typeId");
            }}
          >
            <SelectTrigger className={inputCls("typeId")}>
              <SelectValue placeholder={t("dashboard.createForm.basicInfo.categoryPlaceholder", "Select category")} />
            </SelectTrigger>
            <SelectContent>
              {types.map((tp) => (
                <SelectItem key={tp.type_id} value={tp.type_id}>
                  { i18n.language === "la" ? tp.name_la : tp.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t("dashboard.createForm.basicInfo.description", "Description")} required hasError={errors.has("description")}>
          <Textarea
            placeholder={t("dashboard.createForm.basicInfo.descriptionPlaceholder", "Describe your attraction in detail...")}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearError("description");
            }}
            className={`min-h-[110px] resize-none ${inputCls("description")}`}
          />
        </Field>

        <Field label={t("dashboard.createForm.basicInfo.activities", "Activities")}>
          <Input
            placeholder={t("dashboard.createForm.basicInfo.activitiesPlaceholder", "e.g. Swimming, hiking, photography")}
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
        </Field>

        <Field label={t("dashboard.createForm.basicInfo.license", "License / Permit Number")}>
          <Input
            placeholder={t("dashboard.createForm.basicInfo.licensePlaceholder", "Official license number (if any)")}
            value={license}
            onChange={(e) => setLicense(e.target.value)}
          />
        </Field>
      </div>
    </Section>
  );
}