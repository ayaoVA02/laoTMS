import { Clock, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Section } from "@/components/ui/section";
import { Field } from "@/components/ui/field";
import { FacilityToggle } from "@/components/ui/facility-toggle";
import { BEST_TIMES } from "../../data/attractions";

interface HoursFeesSectionProps {
  openTime: string;
  setOpenTime: (v: string) => void;
  closeTime: string;
  setCloseTime: (v: string) => void;
  isFreeEntry: boolean;
  setIsFreeEntry: (v: boolean) => void;
  entryFeeForeigner: string;
  setEntryFeeForeigner: (v: string) => void;
  bestTimeVisit: string;
  setBestTimeVisit: (v: string) => void;
}

export function HoursFeesSection({
  openTime, setOpenTime,
  closeTime, setCloseTime,
  isFreeEntry, setIsFreeEntry,
  entryFeeForeigner, setEntryFeeForeigner,
  bestTimeVisit, setBestTimeVisit,
}: HoursFeesSectionProps) {
  const { t } = useTranslation();

  return (
    <Section title={t("dashboard.createForm.hours.title", "Hours & Entry Fees")} icon={<Clock className="w-4 h-4" />}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("dashboard.createForm.hours.openingTime", "Opening Time")}>
            <Input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
            />
          </Field>
          <Field label={t("dashboard.createForm.hours.closingTime", "Closing Time")}>
            <Input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
            />
          </Field>
        </div>

        <FacilityToggle
          icon={<DollarSign className="w-4 h-4" />}
          label={t("dashboard.createForm.hours.freeEntry", "Free Entry")}
          checked={isFreeEntry}
          onChange={setIsFreeEntry}
        />

        {!isFreeEntry && (
          <Field label={t("dashboard.createForm.hours.entryFee", "Entry Fee for Foreigners (LAK)")}>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0"
                value={entryFeeForeigner}
                onChange={(e) => setEntryFeeForeigner(e.target.value)}
                className="pl-9"
              />
            </div>
          </Field>
        )}

        <Field label={t("dashboard.createForm.hours.bestTime", "Best Time to Visit")}>
          <Select value={bestTimeVisit} onValueChange={setBestTimeVisit}>
            <SelectTrigger>
              <SelectValue placeholder={t("dashboard.createForm.hours.bestTimePlaceholder", "Select best season")} />
            </SelectTrigger>
            <SelectContent>
              {BEST_TIMES.map((bt) => (
                <SelectItem key={bt} value={bt}>
                  {bt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </Section>
  );
}