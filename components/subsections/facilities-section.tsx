import { Check, Car, Wifi, Utensils, BedDouble, DollarSign, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/ui/section";
import { Field } from "@/components/ui/field";
import { FacilityToggle } from "@/components/ui/facility-toggle";

interface FacilitiesSectionProps {
  hasParking: boolean;
  setHasParking: (v: boolean) => void;
  isFreeParking: boolean;
  setIsFreeParking: (v: boolean) => void;
  parkingPrice: string;
  setParkingPrice: (v: string) => void;
  hasInternet: boolean;
  setHasInternet: (v: boolean) => void;
  isFreeWifi: boolean;
  setIsFreeWifi: (v: boolean) => void;
  guidePhone: string;
  setGuidePhone: (v: string) => void;
  hasRestaurant: boolean;
  setHasRestaurant: (v: boolean) => void;
  hasAccommodation: boolean;
  setHasAccommodation: (v: boolean) => void;
  accPrice: string;
  setAccPrice: (v: string) => void;
}

export function FacilitiesSection({
  hasParking, setHasParking,
  isFreeParking, setIsFreeParking,
  parkingPrice, setParkingPrice,
  hasInternet, setHasInternet,
  isFreeWifi, setIsFreeWifi,
  guidePhone, setGuidePhone,
  hasRestaurant, setHasRestaurant,
  hasAccommodation, setHasAccommodation,
  accPrice, setAccPrice,
}: FacilitiesSectionProps) {
  return (
    <Section title="Facilities & Amenities" icon={<Check className="w-4 h-4" />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Parking */}
        <FacilityToggle
          icon={<Car className="w-4 h-4" />}
          label="Parking Available"
          checked={hasParking}
          onChange={setHasParking}
          subContent={
            <div className="space-y-2">
              <FacilityToggle
                icon={<Car className="w-3.5 h-3.5" />}
                label="Free Parking"
                checked={isFreeParking}
                onChange={setIsFreeParking}
              />
              {!isFreeParking && (
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Parking price (LAK)"
                    value={parkingPrice}
                    onChange={(e) => setParkingPrice(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              )}
            </div>
          }
        />

        {/* Internet */}
        <FacilityToggle
          icon={<Wifi className="w-4 h-4" />}
          label="Internet / WiFi"
          checked={hasInternet}
          onChange={(v) => {
            setHasInternet(v);
            if (v) setGuidePhone("");
          }}
          subContent={
            <FacilityToggle
              icon={<Wifi className="w-3.5 h-3.5" />}
              label="Free WiFi"
              checked={isFreeWifi}
              onChange={setIsFreeWifi}
            />
          }
        />

        {/* Guide phone (shown only when no internet) */}
        {!hasInternet && (
          <div className="sm:col-span-2">
            <Field label="Tour Guide Phone Number">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="+856 20 xx xxx xxx"
                  value={guidePhone}
                  onChange={(e) => setGuidePhone(e.target.value)}
                  className="pl-9"
                />
              </div>
            </Field>
          </div>
        )}

        {/* Restaurant */}
        <FacilityToggle
          icon={<Utensils className="w-4 h-4" />}
          label="Restaurant / Food"
          checked={hasRestaurant}
          onChange={setHasRestaurant}
        />

        {/* Accommodation */}
        <FacilityToggle
          icon={<BedDouble className="w-4 h-4" />}
          label="Accommodation"
          checked={hasAccommodation}
          onChange={setHasAccommodation}
          subContent={
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Price per night (LAK)"
                value={accPrice}
                onChange={(e) => setAccPrice(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          }
        />
      </div>
    </Section>
  );
}