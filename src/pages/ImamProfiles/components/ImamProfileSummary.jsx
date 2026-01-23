import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../components/Common/DeleteConfirmationModal";
import useDeleteConfirmation from "../../../hooks/useDeleteConfirmation";
import { useRole } from "../../../helpers/useRole";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import MapPicker from "../../../components/Common/MapPicker";

const ImamProfileSummary = ({ imamProfile, lookupData, onUpdate, showAlert }) => {
  const { isOrgExecutive, isAppAdmin, isGlobalAdmin } = useRole();
  const isAdmin = isAppAdmin || isGlobalAdmin;
  const [modalOpen, setModalOpen] = useState(false);

  // Delete confirmation hook
  const {
    deleteModalOpen,
    deleteItem,
    deleteLoading,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    confirmDelete
  } = useDeleteConfirmation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm();
  
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);
  
  // Add New Modal States
  const [addCountryModal, setAddCountryModal] = useState(false);
  const [addProvinceModal, setAddProvinceModal] = useState(false);
  const [addSuburbModal, setAddSuburbModal] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");
  const [newProvinceName, setNewProvinceName] = useState("");
  const [newSuburbName, setNewSuburbName] = useState("");
  const [addingCountry, setAddingCountry] = useState(false);
  const [addingProvince, setAddingProvince] = useState(false);
  const [addingSuburb, setAddingSuburb] = useState(false);

  const handleFormError = (formErrors) => {
    const firstError = Object.keys(formErrors)[0];
    if (firstError) {
      showAlert(formErrors[firstError]?.message || "Please fix the form errors", "danger");
    }
  };

  // Helper function to parse error messages and return user-friendly messages
  const parseErrorMessage = (error) => {
    if (!error) return "An unexpected error occurred";
    
    // Check for error in response.data.error or response.data.message
    const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || "";
    
    // Check for duplicate email constraint
    if (errorMessage.includes("uq_imam_email") || (errorMessage.includes("duplicate key value violates unique constraint") && errorMessage.includes("email"))) {
      return "This email address is already registered. Please use a different email address.";
    }
    
    // Check for duplicate employee profile
    if (errorMessage.includes("employee_id") && errorMessage.includes("duplicate")) {
      return "You already have an imam profile. Please update your existing profile instead.";
    }
    
    // Check for other unique constraint violations
    if (errorMessage.includes("duplicate key value violates unique constraint")) {
      return "This information already exists in the system. Please check your input and try again.";
    }
    
    // Return the original error message if no specific pattern matches
    // Clean up nested error messages
    if (errorMessage.includes("Error creating record in Imam_Profiles:")) {
      const cleaned = errorMessage.replace(/Error creating record in Imam_Profiles:\s*/g, "");
      return cleaned || "Failed to save imam profile";
    }
    
    if (errorMessage.includes("Error updating record in Imam_Profiles:")) {
      const cleaned = errorMessage.replace(/Error updating record in Imam_Profiles:\s*/g, "");
      return cleaned || "Failed to update imam profile";
    }
    
    return errorMessage || "An unexpected error occurred";
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Filter provinces based on selected country
  useEffect(() => {
    if (selectedCountryId && lookupData.province) {
      const filtered = lookupData.province.filter(
        (p) => Number(p.country_id) === Number(selectedCountryId)
      );
      setFilteredProvinces(filtered);
      // Reset province and suburb when country changes
      if (selectedProvinceId && !filtered.find((p) => Number(p.id) === Number(selectedProvinceId))) {
        setSelectedProvinceId(null);
        setValue("province_id", "");
        setValue("suburb_id", "");
      }
    } else {
      setFilteredProvinces([]);
      if (!selectedCountryId) {
        setSelectedProvinceId(null);
        setValue("province_id", "");
        setValue("suburb_id", "");
      }
    }
  }, [selectedCountryId, lookupData.province, selectedProvinceId, setValue]);

  // Track previous province ID to detect actual changes
  const prevProvinceIdRef = useRef(selectedProvinceId);

  // Filter suburbs based on selected province
  useEffect(() => {
    if (selectedProvinceId && lookupData.suburb) {
      const filtered = lookupData.suburb.filter(
        (s) => Number(s.province_id) === Number(selectedProvinceId)
      );
      setFilteredSuburbs(filtered);
      
      // Only reset suburb when province actually changes, not when lookupData updates
      if (prevProvinceIdRef.current !== selectedProvinceId && prevProvinceIdRef.current !== null) {
        setValue("suburb_id", "");
      }
      prevProvinceIdRef.current = selectedProvinceId;
    } else {
      setFilteredSuburbs([]);
      if (!selectedProvinceId) {
        setValue("suburb_id", "");
        prevProvinceIdRef.current = null;
      }
    }
  }, [selectedProvinceId, lookupData.suburb, setValue]);

  // Initialize selectedCountryId and selectedProvinceId from form values
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "country_id") {
        setSelectedCountryId(value.country_id ? String(value.country_id) : null);
      }
      if (name === "province_id") {
        setSelectedProvinceId(value.province_id ? String(value.province_id) : null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Watch Masjid_Image to show/hide map
  const masjidImage = watch("Masjid_Image");
  const existingMasjidImage = imamProfile?.masjid_image || imamProfile?.Masjid_Image;
  const showMap = (masjidImage && masjidImage.length > 0) || existingMasjidImage;

  useEffect(() => {
    if (imamProfile && modalOpen) {
      // Derive country_id from province_id if available
      let derivedCountryId = "";
      if (imamProfile.province_id && lookupData.province) {
        const province = lookupData.province.find(
          (p) => Number(p.id) === Number(imamProfile.province_id)
        );
        if (province && province.country_id) {
          derivedCountryId = String(province.country_id);
        }
      }

      const formData = {
        Name: imamProfile.name || "",
        Surname: imamProfile.surname || "",
        Email: imamProfile.email || "",
        ID_Number: imamProfile.id_number || "",
        File_Number: imamProfile.file_number || "",
        Cell_Number: imamProfile.cell_number || "",
        Title: imamProfile.title ? String(imamProfile.title) : "",
        DOB: formatDateForInput(imamProfile.dob),
        Race: imamProfile.race ? String(imamProfile.race) : "",
        Gender: imamProfile.gender ? String(imamProfile.gender) : "",
        Marital_Status: imamProfile.marital_status ? String(imamProfile.marital_status) : "",
        Madhab: imamProfile.madhab ? String(imamProfile.madhab) : "",
        nationality_id: imamProfile.nationality_id ? String(imamProfile.nationality_id) : "",
        country_id: derivedCountryId,
        province_id: imamProfile.province_id ? String(imamProfile.province_id) : "",
        suburb_id: imamProfile.suburb_id ? String(imamProfile.suburb_id) : "",
        status_id: imamProfile.status_id ? String(imamProfile.status_id) : "1",
        Employment_Type: imamProfile.employment_type ? String(imamProfile.employment_type) : "",
        Lead_Salah_In_Masjid: imamProfile.lead_salah_in_masjid ? String(imamProfile.lead_salah_in_masjid) : "",
        Teach_Maktab_Madrassah: imamProfile.teach_maktab_madrassah ? String(imamProfile.teach_maktab_madrassah) : "",
        Do_Street_Dawah: imamProfile.do_street_dawah ? String(imamProfile.do_street_dawah) : "",
        Teaching_Frequency: imamProfile.teaching_frequency ? String(imamProfile.teaching_frequency) : "",
        Teach_Adults_Community_Classes: imamProfile.teach_adults_community_classes ? String(imamProfile.teach_adults_community_classes) : "",
        Average_Students_Taught_Daily: imamProfile.average_students_taught_daily ? String(imamProfile.average_students_taught_daily) : "",
        Prayers_Lead_Daily: imamProfile.prayers_lead_daily ? String(imamProfile.prayers_lead_daily) : "",
        Jumuah_Prayers_Lead: imamProfile.jumuah_prayers_lead ? String(imamProfile.jumuah_prayers_lead) : "",
        Average_Fajr_Attendees: imamProfile.average_fajr_attendees ? String(imamProfile.average_fajr_attendees) : "",
        Average_Dhuhr_Attendees: imamProfile.average_dhuhr_attendees ? String(imamProfile.average_dhuhr_attendees) : "",
        Average_Asr_Attendees: imamProfile.average_asr_attendees ? String(imamProfile.average_asr_attendees) : "",
        Average_Maghrib_Attendees: imamProfile.average_maghrib_attendees ? String(imamProfile.average_maghrib_attendees) : "",
        Average_Esha_Attendees: imamProfile.average_esha_attendees ? String(imamProfile.average_esha_attendees) : "",
        English_Proficiency: imamProfile.english_proficiency ? String(imamProfile.english_proficiency) : "",
        Arabic_Proficiency: imamProfile.arabic_proficiency ? String(imamProfile.arabic_proficiency) : "",
        Quran_Reading_Ability: imamProfile.quran_reading_ability ? String(imamProfile.quran_reading_ability) : "",
        Public_Speaking_Khutbah_Skills: imamProfile.public_speaking_khutbah_skills ? String(imamProfile.public_speaking_khutbah_skills) : "",
        Quran_Memorization: imamProfile.quran_memorization || "",
        Additional_Weekly_Tasks: imamProfile.additional_weekly_tasks ? (Array.isArray(imamProfile.additional_weekly_tasks) ? imamProfile.additional_weekly_tasks : imamProfile.additional_weekly_tasks.split(',').map(t => t.trim())) : [],
        Acknowledge: imamProfile.acknowledge || false,
        Longitude: imamProfile.longitude || "",
        Latitude: imamProfile.latitude || "",
      };
      reset(formData);
      
      // Initialize cascading dropdowns
      if (formData.country_id) {
        setSelectedCountryId(String(formData.country_id));
      }
      if (formData.province_id) {
        setSelectedProvinceId(String(formData.province_id));
      }
    }
  }, [imamProfile, modalOpen, reset, lookupData.province]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const onSubmit = async (data) => {
    try {
      const hasFile = data.Masjid_Image && data.Masjid_Image.length > 0;
      
      let payload;
      if (hasFile) {
        const formData = new FormData();
        formData.append("name", data.Name);
        formData.append("surname", data.Surname);
        formData.append("email", data.Email || "");
        formData.append("id_number", data.ID_Number || "");
        formData.append("file_number", data.File_Number || "");
        formData.append("cell_number", data.Cell_Number || "");
        formData.append("title", data.Title && data.Title !== "" ? data.Title : "");
        formData.append("dob", data.DOB || "");
        formData.append("race", data.Race && data.Race !== "" ? data.Race : "");
        formData.append("gender", data.Gender && data.Gender !== "" ? data.Gender : "");
        formData.append("marital_status", data.Marital_Status && data.Marital_Status !== "" ? data.Marital_Status : "");
        formData.append("madhab", data.Madhab && data.Madhab !== "" ? data.Madhab : "");
        formData.append("nationality_id", data.nationality_id && data.nationality_id !== "" ? data.nationality_id : "");
        formData.append("province_id", data.province_id && data.province_id !== "" ? data.province_id : "");
        formData.append("suburb_id", data.suburb_id && data.suburb_id !== "" ? data.suburb_id : "");
        formData.append("status_id", data.status_id && data.status_id !== "" ? data.status_id : "1");
        formData.append("employment_type", data.Employment_Type && data.Employment_Type !== "" ? data.Employment_Type : "");
        formData.append("lead_salah_in_masjid", data.Lead_Salah_In_Masjid && data.Lead_Salah_In_Masjid !== "" ? data.Lead_Salah_In_Masjid : "");
        formData.append("teach_maktab_madrassah", data.Teach_Maktab_Madrassah && data.Teach_Maktab_Madrassah !== "" ? data.Teach_Maktab_Madrassah : "");
        formData.append("do_street_dawah", data.Do_Street_Dawah && data.Do_Street_Dawah !== "" ? data.Do_Street_Dawah : "");
        formData.append("teaching_frequency", data.Teaching_Frequency && data.Teaching_Frequency !== "" ? data.Teaching_Frequency : "");
        formData.append("teach_adults_community_classes", data.Teach_Adults_Community_Classes && data.Teach_Adults_Community_Classes !== "" ? data.Teach_Adults_Community_Classes : "");
        formData.append("average_students_taught_daily", data.Average_Students_Taught_Daily && data.Average_Students_Taught_Daily !== "" ? data.Average_Students_Taught_Daily : "");
        formData.append("prayers_lead_daily", data.Prayers_Lead_Daily && data.Prayers_Lead_Daily !== "" ? data.Prayers_Lead_Daily : "");
        formData.append("jumuah_prayers_lead", data.Jumuah_Prayers_Lead && data.Jumuah_Prayers_Lead !== "" ? data.Jumuah_Prayers_Lead : "");
        formData.append("average_fajr_attendees", data.Average_Fajr_Attendees && data.Average_Fajr_Attendees !== "" ? data.Average_Fajr_Attendees : "");
        formData.append("average_dhuhr_attendees", data.Average_Dhuhr_Attendees && data.Average_Dhuhr_Attendees !== "" ? data.Average_Dhuhr_Attendees : "");
        formData.append("average_asr_attendees", data.Average_Asr_Attendees && data.Average_Asr_Attendees !== "" ? data.Average_Asr_Attendees : "");
        formData.append("average_maghrib_attendees", data.Average_Maghrib_Attendees && data.Average_Maghrib_Attendees !== "" ? data.Average_Maghrib_Attendees : "");
        formData.append("average_esha_attendees", data.Average_Esha_Attendees && data.Average_Esha_Attendees !== "" ? data.Average_Esha_Attendees : "");
        formData.append("english_proficiency", data.English_Proficiency && data.English_Proficiency !== "" ? data.English_Proficiency : "");
        formData.append("arabic_proficiency", data.Arabic_Proficiency && data.Arabic_Proficiency !== "" ? data.Arabic_Proficiency : "");
        formData.append("quran_reading_ability", data.Quran_Reading_Ability && data.Quran_Reading_Ability !== "" ? data.Quran_Reading_Ability : "");
        formData.append("public_speaking_khutbah_skills", data.Public_Speaking_Khutbah_Skills && data.Public_Speaking_Khutbah_Skills !== "" ? data.Public_Speaking_Khutbah_Skills : "");
        formData.append("quran_memorization", data.Quran_Memorization || "");
        formData.append("additional_weekly_tasks", Array.isArray(data.Additional_Weekly_Tasks) ? data.Additional_Weekly_Tasks.join(',') : (data.Additional_Weekly_Tasks || ""));
        formData.append("acknowledge", data.Acknowledge ? "true" : "false");
        formData.append("longitude", data.Longitude && data.Longitude !== "" ? data.Longitude : "");
        formData.append("latitude", data.Latitude && data.Latitude !== "" ? data.Latitude : "");
        formData.append("updated_by", getAuditName());
        formData.append("Masjid_Image", data.Masjid_Image[0]);
        payload = formData;
      } else {
        payload = {
          name: data.Name,
          surname: data.Surname,
          email: data.Email || null,
          id_number: data.ID_Number || null,
          file_number: data.File_Number || null,
          cell_number: data.Cell_Number || null,
          title: data.Title && data.Title !== "" ? parseInt(data.Title) : null,
          dob: data.DOB || null,
          race: data.Race && data.Race !== "" ? parseInt(data.Race) : null,
          gender: data.Gender && data.Gender !== "" ? parseInt(data.Gender) : null,
          marital_status: data.Marital_Status && data.Marital_Status !== "" ? parseInt(data.Marital_Status) : null,
          madhab: data.Madhab && data.Madhab !== "" ? parseInt(data.Madhab) : null,
          nationality_id: data.nationality_id && data.nationality_id !== "" ? parseInt(data.nationality_id) : null,
          province_id: data.province_id && data.province_id !== "" ? parseInt(data.province_id) : null,
          suburb_id: data.suburb_id && data.suburb_id !== "" ? parseInt(data.suburb_id) : null,
          status_id: data.status_id && data.status_id !== "" ? parseInt(data.status_id) : 1,
          employment_type: data.Employment_Type && data.Employment_Type !== "" ? parseInt(data.Employment_Type) : null,
          lead_salah_in_masjid: data.Lead_Salah_In_Masjid && data.Lead_Salah_In_Masjid !== "" ? parseInt(data.Lead_Salah_In_Masjid) : null,
          teach_maktab_madrassah: data.Teach_Maktab_Madrassah && data.Teach_Maktab_Madrassah !== "" ? parseInt(data.Teach_Maktab_Madrassah) : null,
          do_street_dawah: data.Do_Street_Dawah && data.Do_Street_Dawah !== "" ? parseInt(data.Do_Street_Dawah) : null,
          teaching_frequency: data.Teaching_Frequency && data.Teaching_Frequency !== "" ? parseInt(data.Teaching_Frequency) : null,
          teach_adults_community_classes: data.Teach_Adults_Community_Classes && data.Teach_Adults_Community_Classes !== "" ? parseInt(data.Teach_Adults_Community_Classes) : null,
          average_students_taught_daily: data.Average_Students_Taught_Daily && data.Average_Students_Taught_Daily !== "" ? parseInt(data.Average_Students_Taught_Daily) : null,
          prayers_lead_daily: data.Prayers_Lead_Daily && data.Prayers_Lead_Daily !== "" ? parseInt(data.Prayers_Lead_Daily) : null,
          jumuah_prayers_lead: data.Jumuah_Prayers_Lead && data.Jumuah_Prayers_Lead !== "" ? parseInt(data.Jumuah_Prayers_Lead) : null,
          average_fajr_attendees: data.Average_Fajr_Attendees && data.Average_Fajr_Attendees !== "" ? parseInt(data.Average_Fajr_Attendees) : null,
          average_dhuhr_attendees: data.Average_Dhuhr_Attendees && data.Average_Dhuhr_Attendees !== "" ? parseInt(data.Average_Dhuhr_Attendees) : null,
          average_asr_attendees: data.Average_Asr_Attendees && data.Average_Asr_Attendees !== "" ? parseInt(data.Average_Asr_Attendees) : null,
          average_maghrib_attendees: data.Average_Maghrib_Attendees && data.Average_Maghrib_Attendees !== "" ? parseInt(data.Average_Maghrib_Attendees) : null,
          average_esha_attendees: data.Average_Esha_Attendees && data.Average_Esha_Attendees !== "" ? parseInt(data.Average_Esha_Attendees) : null,
          english_proficiency: data.English_Proficiency && data.English_Proficiency !== "" ? parseInt(data.English_Proficiency) : null,
          arabic_proficiency: data.Arabic_Proficiency && data.Arabic_Proficiency !== "" ? parseInt(data.Arabic_Proficiency) : null,
          quran_reading_ability: data.Quran_Reading_Ability && data.Quran_Reading_Ability !== "" ? parseInt(data.Quran_Reading_Ability) : null,
          public_speaking_khutbah_skills: data.Public_Speaking_Khutbah_Skills && data.Public_Speaking_Khutbah_Skills !== "" ? parseInt(data.Public_Speaking_Khutbah_Skills) : null,
          quran_memorization: data.Quran_Memorization || null,
          additional_weekly_tasks: Array.isArray(data.Additional_Weekly_Tasks) ? data.Additional_Weekly_Tasks.join(',') : (data.Additional_Weekly_Tasks || null),
          acknowledge: data.Acknowledge || false,
          longitude: data.Longitude && data.Longitude !== "" ? parseFloat(data.Longitude) : null,
          latitude: data.Latitude && data.Latitude !== "" ? parseFloat(data.Latitude) : null,
          updated_by: getAuditName(),
        };
      }

      const requestConfig = hasFile ? { headers: { "Content-Type": "multipart/form-data" } } : {};
      await axiosApi.put(`${API_BASE_URL}/imamProfiles/${imamProfile.id}`, payload, requestConfig);
      
      showAlert("Imam profile has been updated successfully", "success");
      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error updating imam profile:", error);
      const userFriendlyMessage = parseErrorMessage(error);
      showAlert(userFriendlyMessage, "danger");
    }
  };

  // Add New Country
  const handleAddCountry = async () => {
    if (!newCountryName.trim()) {
      showAlert("Please enter a country name", "danger");
      return;
    }
    
    const trimmedName = newCountryName.trim();
    
    // Check for duplicate country name
    const existingCountry = (lookupData.country || []).find(
      c => c.name?.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingCountry) {
      showAlert(`Country "${trimmedName}" already exists. Please select it from the dropdown instead.`, "warning");
      setValue("country_id", String(existingCountry.id));
      setSelectedCountryId(String(existingCountry.id));
      setNewCountryName("");
      setAddCountryModal(false);
      return;
    }
    
    try {
      setAddingCountry(true);
      const response = await axiosApi.post(`${API_BASE_URL}/lookup/Country`, {
        Name: trimmedName,
        Created_By: getAuditName(),
        Updated_By: getAuditName(),
      });
      
      setValue("country_id", String(response.data.id));
      setSelectedCountryId(String(response.data.id));
      
      setNewCountryName("");
      setAddCountryModal(false);
      showAlert("Country added successfully. Please refresh the page to see it in the dropdown.", "success");
    } catch (error) {
      console.error("Error adding country:", error);
      // Check if error is due to duplicate (unique constraint violation)
      if (error?.response?.data?.error?.includes("duplicate") || error?.response?.data?.error?.includes("unique")) {
        showAlert(`Country "${trimmedName}" already exists. Please select it from the dropdown instead.`, "warning");
        // Try to find and select the existing country
        try {
          const countryRes = await axiosApi.get(`${API_BASE_URL}/lookup/Country`);
          const existing = (countryRes.data || []).find(
            c => c.name?.toLowerCase() === trimmedName.toLowerCase()
          );
          if (existing) {
            setValue("country_id", String(existing.id));
            setSelectedCountryId(String(existing.id));
          }
        } catch (fetchError) {
          console.error("Error fetching countries:", fetchError);
        }
      } else {
        showAlert(error?.response?.data?.error || "Failed to add country", "danger");
      }
    } finally {
      setAddingCountry(false);
    }
  };

  // Add New Province
  const handleAddProvince = async () => {
    if (!newProvinceName.trim()) {
      showAlert("Please enter a province name", "danger");
      return;
    }
    if (!selectedCountryId) {
      showAlert("Please select a country first", "danger");
      return;
    }
    
    const trimmedName = newProvinceName.trim();
    
    // Check for duplicate province name in the selected country
    const existingProvince = filteredProvinces.find(
      p => p.name?.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingProvince) {
      showAlert(`Province "${trimmedName}" already exists in this country. Please select it from the dropdown instead.`, "warning");
      setValue("province_id", String(existingProvince.id));
      setSelectedProvinceId(String(existingProvince.id));
      setNewProvinceName("");
      setAddProvinceModal(false);
      return;
    }
    
    try {
      setAddingProvince(true);
      const response = await axiosApi.post(`${API_BASE_URL}/lookup/Province`, {
        Name: trimmedName,
        country_id: parseInt(selectedCountryId),
        Created_By: getAuditName(),
        Updated_By: getAuditName(),
      });
      
      setValue("province_id", String(response.data.id));
      setSelectedProvinceId(String(response.data.id));
      
      setNewProvinceName("");
      setAddProvinceModal(false);
      showAlert("Province added successfully. Please refresh the page to see it in the dropdown.", "success");
    } catch (error) {
      console.error("Error adding province:", error);
      // Check if error is due to duplicate (unique constraint violation)
      if (error?.response?.data?.error?.includes("duplicate") || error?.response?.data?.error?.includes("unique")) {
        showAlert(`Province "${trimmedName}" already exists in this country. Please select it from the dropdown instead.`, "warning");
        // Try to find and select the existing province
        try {
          const provinceRes = await axiosApi.get(`${API_BASE_URL}/lookup/Province`);
          const existing = (provinceRes.data || []).find(
            p => p.name?.toLowerCase() === trimmedName.toLowerCase() && 
                 Number(p.country_id) === Number(selectedCountryId)
          );
          if (existing) {
            setValue("province_id", String(existing.id));
            setSelectedProvinceId(String(existing.id));
          }
        } catch (fetchError) {
          console.error("Error fetching provinces:", fetchError);
        }
      } else {
        showAlert(error?.response?.data?.error || "Failed to add province", "danger");
      }
    } finally {
      setAddingProvince(false);
    }
  };

  // Add New Suburb
  const handleAddSuburb = async () => {
    if (!newSuburbName.trim()) {
      showAlert("Please enter a suburb name", "danger");
      return;
    }
    if (!selectedProvinceId) {
      showAlert("Please select a province first", "danger");
      return;
    }
    
    const trimmedName = newSuburbName.trim();
    
    // Check for duplicate suburb name in the selected province
    const existingSuburb = filteredSuburbs.find(
      s => s.name?.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingSuburb) {
      showAlert(`Suburb "${trimmedName}" already exists in this province. Please select it from the dropdown instead.`, "warning");
      setValue("suburb_id", String(existingSuburb.id));
      setNewSuburbName("");
      setAddSuburbModal(false);
      return;
    }
    
    try {
      setAddingSuburb(true);
      const response = await axiosApi.post(`${API_BASE_URL}/lookup/Suburb`, {
        Name: trimmedName,
        province_id: parseInt(selectedProvinceId),
        Created_By: getAuditName(),
        Updated_By: getAuditName(),
      });
      
      // Refresh suburbs data and update filteredSuburbs
      const suburbRes = await axiosApi.get(`${API_BASE_URL}/lookup/Suburb`);
      const updatedSuburbs = suburbRes.data || [];
      
      // Manually update filteredSuburbs to include the new suburb
      if (selectedProvinceId) {
        const filtered = updatedSuburbs.filter(
          (s) => Number(s.province_id) === Number(selectedProvinceId)
        );
        setFilteredSuburbs(filtered);
        
        // Set the value after a brief delay to ensure filteredSuburbs is updated
        setTimeout(() => {
          setValue("suburb_id", String(response.data.id), { shouldValidate: false, shouldDirty: true });
        }, 50);
      } else {
        setValue("suburb_id", String(response.data.id), { shouldValidate: false, shouldDirty: true });
      }
      
      setNewSuburbName("");
      setAddSuburbModal(false);
      showAlert("Suburb added successfully", "success");
    } catch (error) {
      console.error("Error adding suburb:", error);
      // Check if error is due to duplicate (unique constraint violation)
      if (error?.response?.data?.error?.includes("duplicate") || error?.response?.data?.error?.includes("unique")) {
        showAlert(`Suburb "${trimmedName}" already exists in this province. Please select it from the dropdown instead.`, "warning");
        // Try to find and select the existing suburb
        try {
          const suburbRes = await axiosApi.get(`${API_BASE_URL}/lookup/Suburb`);
          const updatedSuburbs = suburbRes.data || [];
          const existing = updatedSuburbs.find(
            s => s.name?.toLowerCase() === trimmedName.toLowerCase() && 
                 Number(s.province_id) === Number(selectedProvinceId)
          );
          if (existing) {
            // Update filteredSuburbs
            if (selectedProvinceId) {
              const filtered = updatedSuburbs.filter(
                (s) => Number(s.province_id) === Number(selectedProvinceId)
              );
              setFilteredSuburbs(filtered);
              // Set the value after a brief delay to ensure filteredSuburbs is updated
              setTimeout(() => {
                setValue("suburb_id", String(existing.id), { shouldValidate: false, shouldDirty: true });
              }, 50);
            } else {
              setValue("suburb_id", String(existing.id), { shouldValidate: false, shouldDirty: true });
            }
          }
        } catch (fetchError) {
          console.error("Error fetching suburbs:", fetchError);
        }
      } else {
        showAlert(error?.response?.data?.error || "Failed to add suburb", "danger");
      }
    } finally {
      setAddingSuburb(false);
    }
  };

  const handleDelete = () => {
    const imamProfileName = `${imamProfile.name || ''} ${imamProfile.surname || ''}`.trim() || 'Unknown Imam Profile';
    
    showDeleteConfirmation({
      id: imamProfile.id,
      name: imamProfileName,
      type: "imam profile",
      message: "This imam profile and all associated data will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/imamProfiles/${imamProfile.id}`);
      showAlert("Imam profile has been deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async () => {
    try {
      await axiosApi.put(`${API_BASE_URL}/imamProfiles/${imamProfile.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Imam profile approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve imam profile", "danger");
    }
  };

  const handleDecline = async () => {
    try {
      await axiosApi.put(`${API_BASE_URL}/imamProfiles/${imamProfile.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Imam profile declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline imam profile", "danger");
    }
  };

  const getLookupName = (lookupArray, id) => {
    if (!id) return "-";
    const item = lookupArray.find((l) => l.id == id);
    return item ? item.name : "-";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <>
      <Card className="border shadow-sm">
        <div className="card-header bg-transparent border-bottom py-3">
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="card-title mb-0 fw-semibold font-size-16">
              <i className="bx bx-user me-2 text-primary"></i>
              Imam Profile Summary
              {isOrgExecutive && <span className="ms-2 badge bg-info">Read Only</span>}
            </h5>
            <div className="d-flex gap-2">
              {isAdmin && Number(imamProfile.status_id) === 1 && (
                <>
                  <Button color="success" size="sm" onClick={handleApprove} className="btn-sm">
                    <i className="bx bx-check me-1"></i> Approve
                  </Button>
                  <Button color="danger" size="sm" onClick={handleDecline} className="btn-sm">
                    <i className="bx bx-x me-1"></i> Decline
                  </Button>
                </>
              )}
              {!isOrgExecutive && (
                <Button color="primary" size="sm" onClick={toggleModal} className="btn-sm">
                  <i className="bx bx-edit-alt me-1"></i> Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        <CardBody className="py-3">
          {/* Row 1: Name, Surname, Email, ID Number */}
          <Row className="mb-2">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Name</p>
              <p className="mb-2 fw-medium font-size-12">{imamProfile.name || "-"}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Surname</p>
              <p className="mb-2 fw-medium font-size-12">{imamProfile.surname || "-"}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Email</p>
              <p className="mb-2 fw-medium font-size-12">{imamProfile.email || "-"}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">ID Number</p>
              <p className="mb-2 fw-medium font-size-12">{imamProfile.id_number || "-"}</p>
            </Col>
          </Row>

          {/* Row 1.5: File Number, Cell Number, Contact Number, Date of Birth */}
          <Row className="mb-2">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">File Number</p>
              <p className="mb-2 fw-medium font-size-12">{imamProfile.file_number || "-"}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Cell Number</p>
              <p className="mb-2 fw-medium font-size-12">{imamProfile.cell_number || "-"}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Date of Birth</p>
              <p className="mb-2 fw-medium font-size-12">{formatDate(imamProfile.dob)}</p>
            </Col>
          </Row>

          {/* Row 2: Title, Race, Gender, Marital Status */}
          <Row className="mb-2">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Title</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.title, imamProfile.title)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Race</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.race, imamProfile.race)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Gender</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.gender, imamProfile.gender)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Marital Status</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.maritalStatus, imamProfile.marital_status)}</p>
            </Col>
          </Row>

          {/* Row 3: Madhab, Nationality, Province, Suburb */}
          <Row className="mb-2">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Madhab</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.madhab, imamProfile.madhab)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Nationality</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.nationality, imamProfile.nationality_id)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Province</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.province, imamProfile.province_id)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Suburb</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.suburb, imamProfile.suburb_id)}</p>
            </Col>
          </Row>

          {/* Row 4: Status */}
          <Row className="mb-2">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Status</p>
              <p className="mb-2 fw-medium font-size-12">
                <span className={`badge ${
                  Number(imamProfile.status_id) === 1 ? "bg-warning text-dark" :
                  Number(imamProfile.status_id) === 2 ? "bg-success text-white" :
                  Number(imamProfile.status_id) === 3 ? "bg-danger text-white" : "bg-secondary text-white"
                }`}>
                  {getLookupName(lookupData.status, imamProfile.status_id)}
                </span>
              </p>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} toggle={toggleModal} centered size="xl" backdrop="static">
        <ModalHeader toggle={toggleModal}>
          <i className="bx bx-edit me-2"></i>
          Edit Imam Profile - {imamProfile.name} {imamProfile.surname}
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit, handleFormError)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Name <span className="text-danger">*</span></Label>
                  <Controller
                    name="Name"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field }) => <Input type="text" invalid={!!errors.Name} {...field} />}
                  />
                  {errors.Name && <FormFeedback>{errors.Name.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Surname <span className="text-danger">*</span></Label>
                  <Controller
                    name="Surname"
                    control={control}
                    rules={{ required: "Surname is required" }}
                    render={({ field }) => <Input type="text" invalid={!!errors.Surname} {...field} />}
                  />
                  {errors.Surname && <FormFeedback>{errors.Surname.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Email <span className="text-danger">*</span></Label>
                  <Controller
                    name="Email"
                    control={control}
                    rules={{ 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    }}
                    render={({ field }) => <Input type="email" invalid={!!errors.Email} {...field} />}
                  />
                  {errors.Email && <FormFeedback>{errors.Email.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>ID Number</Label>
                  <Controller
                    name="ID_Number"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        maxLength={13}
                        onInput={(e) => {
                          e.target.value = (e.target.value || "").replace(/\D/g, "").slice(0, 13);
                          field.onChange(e);
                        }}
                        value={field.value}
                        onBlur={field.onBlur}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>File Number</Label>
                  <Controller
                    name="File_Number"
                    control={control}
                    render={({ field }) => (
                      <Input type="text" {...field} placeholder="Enter file number" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Cell Number</Label>
                  <Controller
                    name="Cell_Number"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        maxLength={10}
                        onInput={(e) => {
                          e.target.value = (e.target.value || "").replace(/\D/g, "").slice(0, 10);
                          field.onChange(e);
                        }}
                        value={field.value}
                        onBlur={field.onBlur}
                        placeholder="Enter cell number"
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Date of Birth</Label>
                  <Controller
                    name="DOB"
                    control={control}
                    render={({ field }) => <Input type="date" {...field} />}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Title</Label>
                  <Controller
                    name="Title"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Title</option>
                        {(lookupData.title || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Race</Label>
                  <Controller
                    name="Race"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Race</option>
                        {(lookupData.race || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Gender</Label>
                  <Controller
                    name="Gender"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Gender</option>
                        {(lookupData.gender || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Marital Status</Label>
                  <Controller
                    name="Marital_Status"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Status</option>
                        {(lookupData.maritalStatus || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Madhab</Label>
                  <Controller
                    name="Madhab"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Madhab</option>
                        {(lookupData.madhab || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Nationality</Label>
                  <Controller
                    name="nationality_id"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Nationality</option>
                        {(lookupData.nationality || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Current residing Country</Label>
                  <InputGroup>
                    <Controller
                      name="country_id"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          type="select" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedCountryId(e.target.value || null);
                          }}
                        >
                          <option value="">Select Country</option>
                          {(lookupData.country || []).map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </Input>
                      )}
                    />
                    <InputGroupText>
                      <Button
                        type="button"
                        color="primary"
                        size="sm"
                        onClick={() => setAddCountryModal(true)}
                        title="Add New Country"
                      >
                        <i className="bx bx-plus"></i>
                      </Button>
                    </InputGroupText>
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Province</Label>
                  <InputGroup>
                    <Controller
                      name="province_id"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          type="select" 
                          {...field}
                          disabled={!selectedCountryId}
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedProvinceId(e.target.value || null);
                          }}
                        >
                          <option value="">Select Province</option>
                          {filteredProvinces.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </Input>
                      )}
                    />
                    <InputGroupText>
                      <Button
                        type="button"
                        color="primary"
                        size="sm"
                        onClick={() => {
                          if (!selectedCountryId) {
                            showAlert("Please select a country first", "warning");
                          } else {
                            setAddProvinceModal(true);
                          }
                        }}
                        disabled={!selectedCountryId}
                        title="Add New Province"
                      >
                        <i className="bx bx-plus"></i>
                      </Button>
                    </InputGroupText>
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Suburb</Label>
                  <InputGroup>
                    <Controller
                      name="suburb_id"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          type="select" 
                          {...field}
                          disabled={!selectedProvinceId}
                        >
                          <option value="">Select Suburb</option>
                          {filteredSuburbs.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </Input>
                      )}
                    />
                    <InputGroupText>
                      <Button
                        type="button"
                        color="primary"
                        size="sm"
                        onClick={() => {
                          if (!selectedProvinceId) {
                            showAlert("Please select a province first", "warning");
                          } else {
                            setAddSuburbModal(true);
                          }
                        }}
                        disabled={!selectedProvinceId}
                        title="Add New Suburb"
                      >
                        <i className="bx bx-plus"></i>
                      </Button>
                    </InputGroupText>
                  </InputGroup>
                </FormGroup>
              </Col>
              {/* Employment Type */}
              <Col md={6}>
                <FormGroup>
                  <Label>What is your employment type?</Label>
                  <Controller
                    name="Employment_Type"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Employment Type</option>
                        {(lookupData.employmentType || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Lead Salah In Masjid */}
              <Col md={6}>
                <FormGroup>
                  <Label>Do You Lead Salah In Your Masjid?</Label>
                  <Controller
                    name="Lead_Salah_In_Masjid"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.yesNo || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Teach Maktab Madrassah */}
              <Col md={6}>
                <FormGroup>
                  <Label>Do You Teach Maktab Madrassah?</Label>
                  <Controller
                    name="Teach_Maktab_Madrassah"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.yesNo || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Do Street Dawah */}
              <Col md={6}>
                <FormGroup>
                  <Label>Do You Do Any Type Of Street Dawah?</Label>
                  <Controller
                    name="Do_Street_Dawah"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.yesNo || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Teaching Frequency */}
              <Col md={6}>
                <FormGroup>
                  <Label>How Frequently Do You Teach At The Madrassah?</Label>
                  <Controller
                    name="Teaching_Frequency"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Frequency</option>
                        {(lookupData.teachingFrequency || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Teach Adults Community Classes */}
              <Col md={6}>
                <FormGroup>
                  <Label>Do You Teach Adults Or Offer Community Classes Outside Of Madrassah?</Label>
                  <Controller
                    name="Teach_Adults_Community_Classes"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.teachAdults || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Average Students Taught Daily */}
              <Col md={6}>
                <FormGroup>
                  <Label>Average Number Of Students Taught Daily?</Label>
                  <Controller
                    name="Average_Students_Taught_Daily"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.averageStudents || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Prayers Lead Daily */}
              <Col md={6}>
                <FormGroup>
                  <Label>How many Prayers Do You Lead Daily?</Label>
                  <Controller
                    name="Prayers_Lead_Daily"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.prayersLead || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Jumuah Prayers Lead */}
              <Col md={6}>
                <FormGroup>
                  <Label>How Many Jumu'ah Prayers Do You Lead</Label>
                  <Controller
                    name="Jumuah_Prayers_Lead"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.jumuahPrayers || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Average Fajr Attendees */}
              <Col md={6}>
                <FormGroup>
                  <Label>Average Fajr Attendees?*</Label>
                  <Controller
                    name="Average_Fajr_Attendees"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.averageAttendees || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Average Dhuhr Attendees */}
              <Col md={6}>
                <FormGroup>
                  <Label>Average Dhuhr Attendees?</Label>
                  <Controller
                    name="Average_Dhuhr_Attendees"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.averageAttendees || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Average Asr Attendees */}
              <Col md={6}>
                <FormGroup>
                  <Label>Average Asr Attendees?</Label>
                  <Controller
                    name="Average_Asr_Attendees"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.averageAttendees || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Average Maghrib Attendees */}
              <Col md={6}>
                <FormGroup>
                  <Label>Average Maghrib Attendees?</Label>
                  <Controller
                    name="Average_Maghrib_Attendees"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.averageAttendees || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Average Esha Attendees */}
              <Col md={6}>
                <FormGroup>
                  <Label>Average Esha Attendees?</Label>
                  <Controller
                    name="Average_Esha_Attendees"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.averageAttendees || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* English Proficiency */}
              <Col md={6}>
                <FormGroup>
                  <Label>English Proficiency</Label>
                  <Controller
                    name="English_Proficiency"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.proficiency || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Arabic Proficiency */}
              <Col md={6}>
                <FormGroup>
                  <Label>Arabic Proficiency</Label>
                  <Controller
                    name="Arabic_Proficiency"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.proficiency || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Quran Reading Ability */}
              <Col md={6}>
                <FormGroup>
                  <Label>Qur'an Reading Ability</Label>
                  <Controller
                    name="Quran_Reading_Ability"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.proficiency || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Public Speaking Khutbah Skills */}
              <Col md={6}>
                <FormGroup>
                  <Label>Public Speaking Or Khutbah Delivery Skills</Label>
                  <Controller
                    name="Public_Speaking_Khutbah_Skills"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.proficiency || []).map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Quran Memorization */}
              <Col md={6}>
                <FormGroup>
                  <Label>How Much Of The Qur'an Have You Memorised?</Label>
                  <Controller
                    name="Quran_Memorization"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {(lookupData.quranMemorization || []).map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>

              {/* Additional Weekly Tasks - Multiple Select */}
              <Col md={12}>
                <FormGroup>
                  <Label>Additional Weekly Tasks</Label>
                  <Controller
                    name="Additional_Weekly_Tasks"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        multiple
                        value={field.value || []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          field.onChange(selected);
                        }}
                      >
                        {(lookupData.additionalTasks || []).map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                  <small className="text-muted">Hold Ctrl (or Cmd on Mac) to select multiple options</small>
                </FormGroup>
              </Col>

              {/* Masjid Image Upload */}
              <Col md={12}>
                <FormGroup>
                  <Label>Upload Image of Masjid</Label>
                  <Controller
                    name="Masjid_Image"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files;
                          onChange(files);
                        }}
                        {...field}
                      />
                    )}
                  />
                  <small className="text-muted">
                    Leave empty to keep existing image. After uploading, use the map below to place a pin at the masjid location.
                  </small>
                  {existingMasjidImage && !masjidImage && (
                    <div className="mt-2">
                      <small className="text-info">
                        <i className="bx bx-info-circle me-1"></i>
                        Current image exists. Upload a new image or use the map to update location.
                      </small>
                    </div>
                  )}
                </FormGroup>
              </Col>

              {/* Map Picker - Show when masjid image exists or is uploaded */}
              {showMap && (
                <Col md={12}>
                  <MapPicker
                    latitude={watch("Latitude") || imamProfile?.latitude}
                    longitude={watch("Longitude") || imamProfile?.longitude}
                    onLocationChange={(lat, lng) => {
                      setValue("Latitude", lat.toString(), { shouldValidate: true });
                      setValue("Longitude", lng.toString(), { shouldValidate: true });
                    }}
                    showMap={showMap}
                  />
                </Col>
              )}

              {/* Longitude and Latitude - Visible inputs for manual entry (especially if map fails) */}
              <Col md={6}>
                <FormGroup>
                  <Label>Longitude</Label>
                  <Controller
                    name="Longitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter longitude (e.g., 28.2293)"
                        {...field}
                      />
                    )}
                  />
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Enter the longitude coordinate of the masjid location
                  </small>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label>Latitude</Label>
                  <Controller
                    name="Latitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter latitude (e.g., -25.7479)"
                        {...field}
                      />
                    )}
                  />
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Enter the latitude coordinate of the masjid location
                  </small>
                </FormGroup>
              </Col>

              {/* Acknowledge */}
              <Col md={12}>
                <FormGroup check>
                  <Controller
                    name="Acknowledge"
                    control={control}
                    rules={{ required: "You must acknowledge this statement" }}
                    render={({ field }) => (
                      <Label check className="d-flex align-items-center">
                        <Input
                          type="checkbox"
                          defaultChecked={false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.Acknowledge}
                          className="me-2"
                        />
                        I declare that the information submitted is accurate and truthful. I understand that Allah is All-Seeing and All-Aware of what is in our hearts. <span className="text-danger">*</span>
                      </Label>
                    )}
                  />
                  {errors.Acknowledge && (
                    <FormFeedback className="d-block">
                      {errors.Acknowledge.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              {/* Status */}
              <Col md={6}>
                <FormGroup>
                  <Label>Status {isAppAdmin ? "" : "(Read Only)"}</Label>
                  <Controller
                    name="status_id"
                    control={control}
                    render={({ field }) => {
                      const statusId = Number(field.value);
                      const statusColor = 
                        statusId === 1 ? "bg-warning text-dark" :
                        statusId === 2 ? "bg-success text-white" :
                        statusId === 3 ? "bg-danger text-white" : "bg-secondary text-white";
                      
                      return (
                        <div>
                          <Input 
                            type="select" 
                            {...field}
                            disabled={!isAppAdmin}
                            className={!isAppAdmin ? "mb-2" : ""}
                          >
                            <option value="">Select Status</option>
                            {(lookupData.status || []).map((item) => (
                              <option key={item.id} value={String(item.id)}>
                                {item.name}
                              </option>
                            ))}
                          </Input>
                          {!isAppAdmin && field.value && (
                            <span className={`badge ${statusColor} mt-2 d-inline-block`}>
                              {(lookupData.status || []).find(s => s.id === statusId)?.name || ""}
                            </span>
                          )}
                        </div>
                      );
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>

          <ModalFooter className="d-flex justify-content-between">
            <div>
              {!isOrgExecutive && (
                <Button color="danger" onClick={handleDelete} type="button" disabled={isSubmitting}>
                  <i className="bx bx-trash me-1"></i> Delete
                </Button>
              )}
            </div>

            <div>
              <Button color="light" onClick={toggleModal} disabled={isSubmitting} className="me-2">
                <i className="bx bx-x me-1"></i> Cancel
              </Button>
              {!isOrgExecutive && (
                <Button color="success" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-save me-1"></i> Save
                    </>
                  )}
                </Button>
              )}
            </div>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Add New Country Modal */}
      <Modal isOpen={addCountryModal} toggle={() => setAddCountryModal(false)} centered>
        <ModalHeader toggle={() => setAddCountryModal(false)}>Add New Country</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="newCountryName">Country Name</Label>
            <Input
              id="newCountryName"
              type="text"
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
              placeholder="Enter country name"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCountry();
                }
              }}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => {
            setAddCountryModal(false);
            setNewCountryName("");
          }}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleAddCountry} disabled={addingCountry || !newCountryName.trim()}>
            {addingCountry ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Adding...
              </>
            ) : (
              "Add Country"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add New Province Modal */}
      <Modal isOpen={addProvinceModal} toggle={() => setAddProvinceModal(false)} centered>
        <ModalHeader toggle={() => setAddProvinceModal(false)}>Add New Province</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Country</Label>
            <Input type="text" value={(lookupData.country || []).find(c => String(c.id) === selectedCountryId)?.name || ""} disabled />
          </FormGroup>
          <FormGroup>
            <Label for="newProvinceName">Province Name</Label>
            <Input
              id="newProvinceName"
              type="text"
              value={newProvinceName}
              onChange={(e) => setNewProvinceName(e.target.value)}
              placeholder="Enter province name"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddProvince();
                }
              }}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => {
            setAddProvinceModal(false);
            setNewProvinceName("");
          }}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleAddProvince} disabled={addingProvince || !newProvinceName.trim() || !selectedCountryId}>
            {addingProvince ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Adding...
              </>
            ) : (
              "Add Province"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add New Suburb Modal */}
      <Modal isOpen={addSuburbModal} toggle={() => setAddSuburbModal(false)} centered>
        <ModalHeader toggle={() => setAddSuburbModal(false)}>Add New Suburb</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Province</Label>
            <Input type="text" value={(filteredProvinces || []).find(p => String(p.id) === selectedProvinceId)?.name || ""} disabled />
          </FormGroup>
          <FormGroup>
            <Label for="newSuburbName">Suburb Name</Label>
            <Input
              id="newSuburbName"
              type="text"
              value={newSuburbName}
              onChange={(e) => setNewSuburbName(e.target.value)}
              placeholder="Enter suburb name"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSuburb();
                }
              }}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => {
            setAddSuburbModal(false);
            setNewSuburbName("");
          }}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleAddSuburb} disabled={addingSuburb || !newSuburbName.trim() || !selectedProvinceId}>
            {addingSuburb ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Adding...
              </>
            ) : (
              "Add Suburb"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        toggle={hideDeleteConfirmation}
        onConfirm={confirmDelete}
        title="Delete Imam Profile"
        message={deleteItem?.message}
        itemName={deleteItem?.name}
        itemType={deleteItem?.type}
        loading={deleteLoading}
      />
    </>
  );
};

export default ImamProfileSummary;

