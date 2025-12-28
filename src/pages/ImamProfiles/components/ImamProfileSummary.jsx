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

const ImamProfileSummary = ({ imamProfile, lookupData, onUpdate, showAlert }) => {
  const { isOrgExecutive, isAppAdmin } = useRole();
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
        Title: imamProfile.title || "",
        DOB: formatDateForInput(imamProfile.dob),
        Race: imamProfile.race || "",
        Gender: imamProfile.gender || "",
        Marital_Status: imamProfile.marital_status || "",
        Madhab: imamProfile.madhab || "",
        nationality_id: imamProfile.nationality_id || "",
        country_id: derivedCountryId,
        province_id: imamProfile.province_id || "",
        suburb_id: imamProfile.suburb_id || "",
        status_id: imamProfile.status_id || "1",
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
        // country_id is not stored in Imam_Profiles table - it's derived from province
        province_id: data.province_id && data.province_id !== "" ? parseInt(data.province_id) : null,
        suburb_id: data.suburb_id && data.suburb_id !== "" ? parseInt(data.suburb_id) : null,
        status_id: data.status_id && data.status_id !== "" ? parseInt(data.status_id) : 1,
        updated_by: getAuditName(),
      };

      await axiosApi.put(`${API_BASE_URL}/imamProfiles/${imamProfile.id}`, payload);
      
      showAlert("Imam profile has been updated successfully", "success");
      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error updating imam profile:", error);
      showAlert(error?.response?.data?.message || "Failed to update imam profile", "danger");
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
            {!isOrgExecutive && (
              <Button color="primary" size="sm" onClick={toggleModal} className="btn-sm">
                <i className="bx bx-edit-alt me-1"></i> Edit
              </Button>
            )}
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

          {/* Row 2: Date of Birth, Title, Race, Gender */}
          <Row className="mb-2">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Date of Birth</p>
              <p className="mb-2 fw-medium font-size-12">{formatDate(imamProfile.dob)}</p>
            </Col>
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
          </Row>

          {/* Row 3: Marital Status, Madhab, Nationality, Province */}
          <Row className="mb-2">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Marital Status</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.maritalStatus, imamProfile.marital_status)}</p>
            </Col>
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
          </Row>

          {/* Row 4: Suburb, Status */}
          <Row className="mb-2">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Suburb</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.suburb, imamProfile.suburb_id)}</p>
            </Col>
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
                  <Label>Email</Label>
                  <Controller
                    name="Email"
                    control={control}
                    rules={{ 
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
                  <Label>Country</Label>
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
                              <option key={item.id} value={item.id}>
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

