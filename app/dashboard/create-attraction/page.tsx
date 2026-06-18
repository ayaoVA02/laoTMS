"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { useAttractionForm } from "../../../hooks/use-attraction-form";
import { BasicInfoSection } from "@/components/subsections/basic-info-section";
import { MediaSection } from "@/components/subsections//media-section";
import { LocationSection } from "@/components/subsections/location-section";
import { HoursFeesSection } from "@/components/subsections/hours-fees-section";
import { FacilitiesSection } from "@/components/subsections/facilities-section";
import { SettingsSection } from "@/components/subsections/settings-section";
import { FormActions } from "@/components/subsections/form-actions";

const MapPickerDialog = dynamic(
  () => import("@/components/shared/Mappickerdialog"),
  { ssr: false }
);

export default function CreateAttractionPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const form = useAttractionForm();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <DashboardLayout
      title={t("sidebar.createAttraction", "Create Attraction")}
      subtitle="Submit a new attraction for review"
    >
      <div className="space-y-4 sm:space-y-5 max-w-3xl mx-auto pb-10">

        <BasicInfoSection
          nameEn={form.nameEn} setNameEn={form.setNameEn}
          nameLa={form.nameLa} setNameLa={form.setNameLa}
          description={form.description} setDescription={form.setDescription}
          activity={form.activity} setActivity={form.setActivity}
          license={form.license} setLicense={form.setLicense}
          typeId={form.typeId} setTypeId={form.setTypeId}
          types={form.types}
          errors={form.errors}
          clearError={form.clearError}
          inputCls={form.inputCls}
        />

        <MediaSection
          images={form.images}
          videos={form.videos}
          errors={form.errors}
          fileInputRef={form.fileInputRef}
          videoInputRef={form.videoInputRef}
          handleImages={form.handleImages}
          handleVideos={form.handleVideos}
          removeImage={form.removeImage}
          setThumbnail={form.setThumbnail}
          setVideos={form.setVideos}
        />

        <LocationSection
          pickOnMap={form.pickOnMap} setPickOnMap={form.setPickOnMap}
          province={form.province} setProvince={form.setProvince}
          district={form.district} setDistrict={form.setDistrict}
          village={form.village} setVillage={form.setVillage}
          location={form.location} setLocation={form.setLocation}
          latitude={form.latitude} setLatitude={form.setLatitude}
          longitude={form.longitude} setLongitude={form.setLongitude}
          setMapOpen={form.setMapOpen}
        />

        <HoursFeesSection
          openTime={form.openTime} setOpenTime={form.setOpenTime}
          closeTime={form.closeTime} setCloseTime={form.setCloseTime}
          isFreeEntry={form.isFreeEntry} setIsFreeEntry={form.setIsFreeEntry}
          entryFeeForeigner={form.entryFeeForeigner}
          setEntryFeeForeigner={form.setEntryFeeForeigner}
          bestTimeVisit={form.bestTimeVisit}
          setBestTimeVisit={form.setBestTimeVisit}
        />

        <FacilitiesSection
          hasParking={form.hasParking} setHasParking={form.setHasParking}
          isFreeParking={form.isFreeParking} setIsFreeParking={form.setIsFreeParking}
          parkingPrice={form.parkingPrice} setParkingPrice={form.setParkingPrice}
          hasInternet={form.hasInternet} setHasInternet={form.setHasInternet}
          isFreeWifi={form.isFreeWifi} setIsFreeWifi={form.setIsFreeWifi}
          guidePhone={form.guidePhone} setGuidePhone={form.setGuidePhone}
          hasRestaurant={form.hasRestaurant} setHasRestaurant={form.setHasRestaurant}
          hasAccommodation={form.hasAccommodation}
          setHasAccommodation={form.setHasAccommodation}
          accPrice={form.accPrice} setAccPrice={form.setAccPrice}
        />

        <SettingsSection
          socialShare={form.socialShare} setSocialShare={form.setSocialShare}
          postFacebook={form.postFacebook} setPostFacebook={form.setPostFacebook}
          postTiktok={form.postTiktok} setPostTiktok={form.setPostTiktok}
          postInstagram={form.postInstagram} setPostInstagram={form.setPostInstagram}
          socialCaption={form.socialCaption} setSocialCaption={form.setSocialCaption}
          generatingSocial={form.generatingSocial}
          handleGenerateSocialCaption={form.handleGenerateSocialCaption}
          images={form.images}
          socialImageIds={form.socialImageIds}
          toggleSocialImage={form.toggleSocialImage}
          selectCoverSocialImage={form.selectCoverSocialImage}
          selectAllSocialImages={form.selectAllSocialImages}
          clearSocialImages={form.clearSocialImages}
        />

        <FormActions
          saving={form.saving}
          allUploaded={form.allUploaded}
          onDraft={() => form.handleSubmit("draft")}
          onSubmit={() => form.handleSubmit("pending")}
        />
      </div>

      <MapPickerDialog
        open={form.mapOpen}
        onClose={() => form.setMapOpen(false)}
        initialLat={form.latitude ? parseFloat(form.latitude) : undefined}
        initialLng={form.longitude ? parseFloat(form.longitude) : undefined}
        onConfirm={(coords, address) => {
          form.setPickOnMap(true);
          form.setLatitude(String(coords.lat));
          form.setLongitude(String(coords.lng));
          if (address) form.setLocation(address);
        }}
      />
    </DashboardLayout>
  );
}