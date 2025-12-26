import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TopRightAlert from "../../components/Common/TopRightAlert";
import axiosApi from "../../helpers/api_helper";
import { API_BASE_URL } from "../../helpers/url_helper";
import { getAuditName } from "../../helpers/userStorage";
import { useRole } from "../../helpers/useRole";

const CreateImamProfile = () => {
  document.title = "Create Imam Profile | IDP";

  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lookupData, setLookupData] = useState({
    nationality: [],
    title: [],
    race: [],
    gender: [],
    maritalStatus: [],
    madhab: [],
    suburb: [],
    province: [],
    country: [],
    status: [],
  });
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

  const { isGlobalAdmin, centerId: userCenterId, userType } = useRole();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      Name: "",
      Surname: "",
      Email: "",
      ID_Number: "",
      Title: "",
      DOB: "",
      Race: "",
      Gender: "",
      Marital_Status: "",
      Madhab: "",
      nationality_id: "",
      country_id: "",
      province_id: "",
      suburb_id: "",
      status_id: "1",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchExistingProfile = useCallback(async () => {
    try {
      console.log("Fetching existing Imam profile for current user...");
      const response = await axiosApi.get(`${API_BASE_URL}/imamProfiles/my-profile`);
      if (response.data) {
        const profile = response.data;
        console.log("Found existing profile:", profile);
        setExistingProfile(profile);
        
        // If status is Approved, redirect to main page
        if (profile.status_id === 2) {
          console.log("Profile is approved, redirecting to main page");
          navigate("/imam-profiles");
          return;
        }
        
        // If status is Pending, the form will be populated by the useEffect that watches existingProfile and lookupData
        if (profile.status_id === 1) {
          console.log("Profile is pending, will populate form when lookup data is ready");
        }
      }
    } catch (error) {
      // Profile doesn't exist yet, that's fine - allow creation
      if (error.response?.status === 404) {
        console.log("No existing profile found - user can create new profile");
        setExistingProfile(null);
        setIsUpdating(false);
      } else {
        console.error("Error fetching existing profile:", error);
      }
    }
  }, [navigate, reset]);

  useEffect(() => {
    fetchLookupData();
  }, []);

  // Fetch existing profile when userType becomes available (handles refresh/login)
  useEffect(() => {
    // If Imam User (type 6), check if they have existing profile
    if (userType === 6) {
      fetchExistingProfile();
    }
  }, [userType, fetchExistingProfile]);

  // Populate form when both profile and lookup data are available
  useEffect(() => {
    // Check if we have a pending profile and all lookup data is loaded
    const hasLookupData = lookupData.status && lookupData.status.length > 0 && 
                          lookupData.title && lookupData.title.length > 0;
    
    if (existingProfile && existingProfile.status_id === 1 && hasLookupData) {
      console.log("Both profile and lookup data available, populating form");
      console.log("Existing profile:", existingProfile);
      console.log("Lookup data loaded:", {
        status: lookupData.status.length,
        title: lookupData.title.length,
        race: lookupData.race.length,
        gender: lookupData.gender.length,
      });
      
      setIsUpdating(true);
      
      // Convert all IDs to strings for select fields - ensure they match option values
      const formData = {
        Name: existingProfile.name || "",
        Surname: existingProfile.surname || "",
        Email: existingProfile.email || "",
        ID_Number: existingProfile.id_number || "",
        Title: existingProfile.title ? String(existingProfile.title) : "",
        DOB: formatDateForInput(existingProfile.dob),
        Race: existingProfile.race ? String(existingProfile.race) : "",
        Gender: existingProfile.gender ? String(existingProfile.gender) : "",
        Marital_Status: existingProfile.marital_status ? String(existingProfile.marital_status) : "",
        Madhab: existingProfile.madhab ? String(existingProfile.madhab) : "",
        nationality_id: existingProfile.nationality_id ? String(existingProfile.nationality_id) : "",
        country_id: existingProfile.country_id ? String(existingProfile.country_id) : "",
        province_id: existingProfile.province_id ? String(existingProfile.province_id) : "",
        suburb_id: existingProfile.suburb_id ? String(existingProfile.suburb_id) : "",
        status_id: existingProfile.status_id ? String(existingProfile.status_id) : "1",
      };
      
      // Initialize cascading dropdowns
      if (formData.country_id) {
        setSelectedCountryId(formData.country_id);
      }
      if (formData.province_id) {
        setSelectedProvinceId(formData.province_id);
      }
      
      console.log("Form data to populate:", formData);
      
      // Use setTimeout to ensure form is ready
      setTimeout(() => {
        reset(formData, { keepDefaultValues: false });
        console.log("Form reset completed");
      }, 100);
    }
  }, [existingProfile, lookupData, reset]);

  const fetchLookupData = async () => {
    try {
      const [
        nationalityRes,
        titleRes,
        raceRes,
        genderRes,
        maritalStatusRes,
        madhabRes,
        suburbRes,
        provinceRes,
        countryRes,
        statusRes,
      ] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/lookup/Nationality`),
        axiosApi.get(`${API_BASE_URL}/lookup/Title_Lookup`),
        axiosApi.get(`${API_BASE_URL}/lookup/Race`),
        axiosApi.get(`${API_BASE_URL}/lookup/Gender`),
        axiosApi.get(`${API_BASE_URL}/lookup/Marital_Status`),
        axiosApi.get(`${API_BASE_URL}/lookup/Madhab`),
        axiosApi.get(`${API_BASE_URL}/lookup/Suburb`),
        axiosApi.get(`${API_BASE_URL}/lookup/Province`),
        axiosApi.get(`${API_BASE_URL}/lookup/Country`),
        axiosApi.get(`${API_BASE_URL}/lookup/Status`),
      ]);

      setLookupData({
        nationality: nationalityRes.data || [],
        title: titleRes.data || [],
        race: raceRes.data || [],
        gender: genderRes.data || [],
        maritalStatus: maritalStatusRes.data || [],
        madhab: madhabRes.data || [],
        suburb: suburbRes.data || [],
        province: provinceRes.data || [],
        country: countryRes.data || [],
        status: statusRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching lookup data:", error);
      showAlert("Failed to fetch lookup data", "warning");
    }
  };

  // Filter provinces based on selected country
  useEffect(() => {
    if (selectedCountryId) {
      const filtered = (lookupData.province || []).filter(
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
      setSelectedProvinceId(null);
      setValue("province_id", "");
      setValue("suburb_id", "");
    }
  }, [selectedCountryId, lookupData.province, selectedProvinceId, setValue]);

  // Track previous province ID to detect actual changes
  const prevProvinceIdRef = useRef(selectedProvinceId);

  // Filter suburbs based on selected province
  useEffect(() => {
    if (selectedProvinceId) {
      const filtered = (lookupData.suburb || []).filter(
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
      setValue("suburb_id", "");
      prevProvinceIdRef.current = null;
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

  const showAlert = useCallback((message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  }, []);

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
      
      // Refresh lookup data
      const countryRes = await axiosApi.get(`${API_BASE_URL}/lookup/Country`);
      setLookupData(prev => ({ ...prev, country: countryRes.data || [] }));
      
      // Select the newly created country
      setValue("country_id", String(response.data.id));
      setSelectedCountryId(String(response.data.id));
      
      setNewCountryName("");
      setAddCountryModal(false);
      showAlert("Country added successfully", "success");
    } catch (error) {
      console.error("Error adding country:", error);
      // Check if error is due to duplicate (unique constraint violation)
      if (error?.response?.data?.error?.includes("duplicate") || error?.response?.data?.error?.includes("unique")) {
        showAlert(`Country "${trimmedName}" already exists. Please select it from the dropdown instead.`, "warning");
        // Try to find and select the existing country
        const countryRes = await axiosApi.get(`${API_BASE_URL}/lookup/Country`);
        const existing = (countryRes.data || []).find(
          c => c.name?.toLowerCase() === trimmedName.toLowerCase()
        );
        if (existing) {
          setValue("country_id", String(existing.id));
          setSelectedCountryId(String(existing.id));
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
      
      // Refresh lookup data
      const provinceRes = await axiosApi.get(`${API_BASE_URL}/lookup/Province`);
      setLookupData(prev => ({ ...prev, province: provinceRes.data || [] }));
      
      // Select the newly created province
      setValue("province_id", String(response.data.id));
      setSelectedProvinceId(String(response.data.id));
      
      setNewProvinceName("");
      setAddProvinceModal(false);
      showAlert("Province added successfully", "success");
    } catch (error) {
      console.error("Error adding province:", error);
      // Check if error is due to duplicate (unique constraint violation)
      if (error?.response?.data?.error?.includes("duplicate") || error?.response?.data?.error?.includes("unique")) {
        showAlert(`Province "${trimmedName}" already exists in this country. Please select it from the dropdown instead.`, "warning");
        // Try to find and select the existing province
        const provinceRes = await axiosApi.get(`${API_BASE_URL}/lookup/Province`);
        const existing = (provinceRes.data || []).find(
          p => p.name?.toLowerCase() === trimmedName.toLowerCase() && 
               Number(p.country_id) === Number(selectedCountryId)
        );
        if (existing) {
          setValue("province_id", String(existing.id));
          setSelectedProvinceId(String(existing.id));
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
      
      // Refresh lookup data
      const suburbRes = await axiosApi.get(`${API_BASE_URL}/lookup/Suburb`);
      const updatedSuburbs = suburbRes.data || [];
      setLookupData(prev => ({ ...prev, suburb: updatedSuburbs }));
      
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
        // Select the newly created suburb immediately if no province selected (shouldn't happen)
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
        const suburbRes = await axiosApi.get(`${API_BASE_URL}/lookup/Suburb`);
        const updatedSuburbs = suburbRes.data || [];
        const existing = updatedSuburbs.find(
          s => s.name?.toLowerCase() === trimmedName.toLowerCase() && 
               Number(s.province_id) === Number(selectedProvinceId)
        );
        if (existing) {
          // Update lookup data and filtered suburbs
          setLookupData(prev => ({ ...prev, suburb: updatedSuburbs }));
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
      } else {
        showAlert(error?.response?.data?.error || "Failed to add suburb", "danger");
      }
    } finally {
      setAddingSuburb(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.Name,
        surname: data.Surname,
        email: data.Email || null,
        id_number: data.ID_Number || null,
        title: data.Title && data.Title !== "" ? parseInt(data.Title) : null,
        dob: data.DOB || null,
        race: data.Race && data.Race !== "" ? parseInt(data.Race) : null,
        gender: data.Gender && data.Gender !== "" ? parseInt(data.Gender) : null,
        marital_status: data.Marital_Status && data.Marital_Status !== "" ? parseInt(data.Marital_Status) : null,
        madhab: data.Madhab && data.Madhab !== "" ? parseInt(data.Madhab) : null,
        nationality_id: data.nationality_id && data.nationality_id !== "" ? parseInt(data.nationality_id) : null,
        country_id: data.country_id && data.country_id !== "" ? parseInt(data.country_id) : null,
        province_id: data.province_id && data.province_id !== "" ? parseInt(data.province_id) : null,
        suburb_id: data.suburb_id && data.suburb_id !== "" ? parseInt(data.suburb_id) : null,
        status_id: isUpdating && existingProfile ? (existingProfile.status_id || 1) : 1, // Preserve existing status when updating, default to "Pending" when creating
        created_by: getAuditName(),
      };
      console.log("Submitting payload with status_id:", payload.status_id, "isUpdating:", isUpdating);

      if (isUpdating && existingProfile) {
        // Update existing profile
        await axiosApi.put(`${API_BASE_URL}/imamProfiles/${existingProfile.id}`, payload);
        showAlert("Imam profile has been updated successfully", "success");
        
        // For Imam User, only redirect if status is Approved (2)
        if (userType === 6) {
          const updatedProfile = await axiosApi.get(`${API_BASE_URL}/imamProfiles/${existingProfile.id}`);
          if (updatedProfile.data?.status_id === 2) {
            setTimeout(() => {
              navigate("/imam-profiles");
            }, 1500);
          } else {
            // Stay on create page if still pending - refresh profile data
            try {
              const refreshedProfile = await axiosApi.get(`${API_BASE_URL}/imamProfiles/${existingProfile.id}`);
              setExistingProfile(refreshedProfile.data);
              reset({
                Name: refreshedProfile.data.name || "",
                Surname: refreshedProfile.data.surname || "",
                Email: refreshedProfile.data.email || "",
                ID_Number: refreshedProfile.data.id_number || "",
                Title: refreshedProfile.data.title || "",
                DOB: formatDateForInput(refreshedProfile.data.dob),
                Race: refreshedProfile.data.race || "",
                Gender: refreshedProfile.data.gender || "",
                Marital_Status: refreshedProfile.data.marital_status || "",
                Madhab: refreshedProfile.data.madhab || "",
                nationality_id: refreshedProfile.data.nationality_id || "",
                province_id: refreshedProfile.data.province_id || "",
                suburb_id: refreshedProfile.data.suburb_id || "",
                status_id: refreshedProfile.data.status_id || "1",
              });
            } catch (error) {
              console.error("Error refreshing profile:", error);
            }
          }
        } else {
          setTimeout(() => {
            navigate("/imam-profiles");
          }, 1500);
        }
      } else {
        // Create new profile
        const response = await axiosApi.post(`${API_BASE_URL}/imamProfiles`, payload);
        showAlert("Imam profile has been created successfully", "success");
        
        // For Imam User, reload and redirect to main Imam Profiles page after creating
        if (userType === 6) {
          setTimeout(() => {
            // Reload the page to refresh navigation menu, then navigate
            window.location.href = "/imam-profiles";
          }, 1500);
        } else {
          setTimeout(() => {
            navigate("/imam-profiles");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error saving imam profile:", error);
      showAlert(error?.response?.data?.message || "Failed to save imam profile", "danger");
    }
  };

  const requiredFields = ["Name", "Surname"];

  const handleFormError = (formErrors) => {
    const firstError = Object.keys(formErrors)[0];
    if (firstError) {
      showAlert(formErrors[firstError]?.message || "Please fix the form errors", "danger");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
        <Breadcrumbs title="Imam Profiles" breadcrumbItem="Create New Imam Profile" />

        <Row>
          <Col xl={12}>
            <Card className="border shadow-sm">
              <div className="card-header bg-transparent border-bottom py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="card-title mb-0 fw-semibold font-size-16">
                    Create New Imam Profile
                  </h5>
                </div>
              </div>

              <CardBody className="p-4">
                <Form onSubmit={handleSubmit(onSubmit, handleFormError)}>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="Name">Name <span className="text-danger">*</span></Label>
                        <Controller
                          name="Name"
                          control={control}
                          rules={{ required: "Name is required" }}
                          render={({ field }) => (
                            <Input id="Name" type="text" invalid={!!errors.Name} {...field} />
                          )}
                        />
                        {errors.Name && <FormFeedback>{errors.Name.message}</FormFeedback>}
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="Surname">Surname <span className="text-danger">*</span></Label>
                        <Controller
                          name="Surname"
                          control={control}
                          rules={{ required: "Surname is required" }}
                          render={({ field }) => (
                            <Input id="Surname" type="text" invalid={!!errors.Surname} {...field} />
                          )}
                        />
                        {errors.Surname && <FormFeedback>{errors.Surname.message}</FormFeedback>}
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="Email">Email</Label>
                        <Controller
                          name="Email"
                          control={control}
                          rules={{ 
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address"
                            }
                          }}
                          render={({ field }) => (
                            <Input id="Email" type="email" invalid={!!errors.Email} {...field} />
                          )}
                        />
                        {errors.Email && <FormFeedback>{errors.Email.message}</FormFeedback>}
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="ID_Number">ID Number</Label>
                        <Controller
                          name="ID_Number"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="ID_Number"
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
                        <Label for="DOB">Date of Birth</Label>
                        <Controller
                          name="DOB"
                          control={control}
                          render={({ field }) => (
                            <Input id="DOB" type="date" {...field} />
                          )}
                        />
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="Title">Title</Label>
                        <Controller
                          name="Title"
                          control={control}
                          render={({ field }) => (
                              <Input id="Title" type="select" {...field}>
                              <option value="">Select Title</option>
                              {(lookupData.title || []).map((x) => (
                                <option key={x.id} value={String(x.id)}>{x.name}</option>
                              ))}
                            </Input>
                          )}
                        />
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="Race">Race</Label>
                        <Controller
                          name="Race"
                          control={control}
                          render={({ field }) => (
                            <Input id="Race" type="select" {...field}>
                              <option value="">Select Race</option>
                              {(lookupData.race || []).map((x) => (
                                <option key={x.id} value={String(x.id)}>{x.name}</option>
                              ))}
                            </Input>
                          )}
                        />
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="Gender">Gender</Label>
                        <Controller
                          name="Gender"
                          control={control}
                          render={({ field }) => (
                            <Input id="Gender" type="select" {...field}>
                              <option value="">Select Gender</option>
                              {(lookupData.gender || []).map((x) => (
                                <option key={x.id} value={String(x.id)}>{x.name}</option>
                              ))}
                            </Input>
                          )}
                        />
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="Marital_Status">Marital Status</Label>
                        <Controller
                          name="Marital_Status"
                          control={control}
                          render={({ field }) => (
                            <Input id="Marital_Status" type="select" {...field}>
                              <option value="">Select Status</option>
                              {(lookupData.maritalStatus || []).map((x) => (
                                <option key={x.id} value={String(x.id)}>{x.name}</option>
                              ))}
                            </Input>
                          )}
                        />
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="Madhab">Madhab</Label>
                        <Controller
                          name="Madhab"
                          control={control}
                          render={({ field }) => (
                            <Input id="Madhab" type="select" {...field}>
                              <option value="">Select Madhab</option>
                              {(lookupData.madhab || []).map((x) => (
                                <option key={x.id} value={String(x.id)}>{x.name}</option>
                              ))}
                            </Input>
                          )}
                        />
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="nationality_id">Nationality</Label>
                        <Controller
                          name="nationality_id"
                          control={control}
                          render={({ field }) => (
                            <Input id="nationality_id" type="select" {...field}>
                              <option value="">Select Nationality</option>
                              {(lookupData.nationality || []).map((x) => (
                                <option key={x.id} value={String(x.id)}>{x.name}</option>
                              ))}
                            </Input>
                          )}
                        />
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="country_id">Country</Label>
                        <InputGroup>
                          <Controller
                            name="country_id"
                            control={control}
                            render={({ field }) => (
                              <Input 
                                id="country_id" 
                                type="select" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setSelectedCountryId(e.target.value || null);
                                }}
                              >
                                <option value="">Select Country</option>
                                {(lookupData.country || []).map((x) => (
                                  <option key={x.id} value={String(x.id)}>{x.name}</option>
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
                        <Label for="province_id">Province</Label>
                        <InputGroup>
                          <Controller
                            name="province_id"
                            control={control}
                            render={({ field }) => (
                              <Input 
                                id="province_id" 
                                type="select" 
                                {...field}
                                disabled={!selectedCountryId}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setSelectedProvinceId(e.target.value || null);
                                }}
                              >
                                <option value="">Select Province</option>
                                {filteredProvinces.map((x) => (
                                  <option key={x.id} value={String(x.id)}>{x.name}</option>
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
                        <Label for="suburb_id">Suburb</Label>
                        <InputGroup>
                          <Controller
                            name="suburb_id"
                            control={control}
                            render={({ field }) => (
                              <Input 
                                id="suburb_id" 
                                type="select" 
                                {...field}
                                disabled={!selectedProvinceId}
                              >
                                <option value="">Select Suburb</option>
                                {filteredSuburbs.map((x) => (
                                  <option key={x.id} value={String(x.id)}>{x.name}</option>
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

                    {/* Status field - Read-only for Imam User */}
                    {userType === 6 && isUpdating && (
                      <Col md={6}>
                        <FormGroup>
                          <Label for="status_id">Status (Read Only)</Label>
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
                                    id="status_id" 
                                    type="select" 
                                    {...field}
                                    disabled
                                    className="mb-2"
                                  >
                                    <option value="">Select Status</option>
                                    {(lookupData.status || []).map((x) => (
                                      <option key={x.id} value={String(x.id)}>{x.name}</option>
                                    ))}
                                  </Input>
                                  {field.value && (
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
                    )}
                  </Row>

                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <Button
                      type="button"
                      color="light"
                      onClick={() => navigate("/imam-profiles")}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button color="success" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          {isUpdating ? "Saving..." : "Creating..."}
                        </>
                      ) : (
                        <>{isUpdating ? "Save" : "Create Imam Profile"}</>
                      )}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

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
    </div>
  );
};

export default CreateImamProfile;

