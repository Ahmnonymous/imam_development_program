import React, { useState, useEffect, useMemo } from "react";
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
} from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../components/Common/DeleteConfirmationModal";
import useDeleteConfirmation from "../../../hooks/useDeleteConfirmation";
import { useRole } from "../../../helpers/useRole";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import { createFieldTabMap, handleTabbedFormErrors } from "../../../helpers/formErrorHandler";

const EDIT_IMAM_PROFILE_TAB_LABELS = {
  1: "Personal Info",
};

const EDIT_IMAM_PROFILE_TAB_FIELDS = {
  1: [
    "Name",
    "Surname",
    "ID_Number",
    "Title",
    "DOB",
    "Nationality",
    "nationality_id",
    "province_id",
    "suburb_id",
    "Madhab",
    "Race",
    "Gender",
    "Marital_Status",
  ],
};

const ImamProfileSummary = ({ imamProfile, lookupData, onUpdate, showAlert }) => {
  const { isOrgExecutive } = useRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [suburbs, setSuburbs] = useState([]);
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);

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

  const watchedCountry = watch("nationality_id");
  const watchedProvince = watch("province_id");
  const tabFieldGroups = useMemo(() => EDIT_IMAM_PROFILE_TAB_FIELDS, []);
  const fieldTabMap = useMemo(() => createFieldTabMap(tabFieldGroups), [tabFieldGroups]);

  const handleFormError = (formErrors) =>
    handleTabbedFormErrors({
      errors: formErrors,
      fieldTabMap,
      tabLabelMap: EDIT_IMAM_PROFILE_TAB_LABELS,
      setActiveTab: () => {},
      showAlert,
    });

  useEffect(() => {
    if (modalOpen) {
      const fetchLocationData = async () => {
        try {
          const [countriesRes, provincesRes, suburbsRes] = await Promise.all([
            axiosApi.get(`${API_BASE_URL}/lookup/Country`),
            axiosApi.get(`${API_BASE_URL}/lookup/Province`),
            axiosApi.get(`${API_BASE_URL}/lookup/Suburb`),
          ]);
          setCountries(countriesRes.data || []);
          setProvinces(provincesRes.data || []);
          setSuburbs(suburbsRes.data || []);
        } catch (error) {
          console.error("Error fetching location data:", error);
        }
      };
      fetchLocationData();
    }
  }, [modalOpen]);

  useEffect(() => {
    if (imamProfile && modalOpen) {
      reset({
        Name: imamProfile.name || "",
        Surname: imamProfile.surname || "",
        ID_Number: imamProfile.id_number || "",
        Title: imamProfile.title || "",
        DOB: imamProfile.dob || "",
        Nationality: imamProfile.nationality || "",
        nationality_id: imamProfile.nationality_id || "",
        province_id: imamProfile.province_id || "",
        suburb_id: imamProfile.suburb_id || "",
        Madhab: imamProfile.madhab || "",
        Race: imamProfile.race || "",
        Gender: imamProfile.gender || "",
        Marital_Status: imamProfile.marital_status || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imamProfile, modalOpen]);

  // Filter provinces by selected country
  useEffect(() => {
    if (watchedCountry) {
      const filtered = provinces.filter(
        (p) => String(p.country_id || p.Country_ID || p.country_ID) === String(watchedCountry)
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces([]);
    }
  }, [watchedCountry, provinces]);

  // Filter suburbs by selected province
  useEffect(() => {
    if (watchedProvince) {
      const filtered = suburbs.filter(
        (s) => String(s.province_id || s.Province_ID || s.province_ID) === String(watchedProvince)
      );
      setFilteredSuburbs(filtered);
    } else {
      setFilteredSuburbs([]);
    }
  }, [watchedProvince, suburbs]);


  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.Name,
        surname: data.Surname,
        id_number: data.ID_Number || null,
        title: data.Title && data.Title !== "" ? parseInt(data.Title) : null,
        dob: data.DOB || null,
        nationality: data.Nationality && data.Nationality !== "" ? parseInt(data.Nationality) : null,
        nationality_id: data.nationality_id && data.nationality_id !== "" ? parseInt(data.nationality_id) : null,
        province_id: data.province_id && data.province_id !== "" ? parseInt(data.province_id) : null,
        suburb_id: data.suburb_id && data.suburb_id !== "" ? parseInt(data.suburb_id) : null,
        madhab: data.Madhab && data.Madhab !== "" ? parseInt(data.Madhab) : null,
        race: data.Race && data.Race !== "" ? parseInt(data.Race) : null,
        gender: data.Gender && data.Gender !== "" ? parseInt(data.Gender) : null,
        marital_status: data.Marital_Status && data.Marital_Status !== "" ? parseInt(data.Marital_Status) : null,
        updated_by: getAuditName(),
      };

      await axiosApi.put(`${API_BASE_URL}/imamProfiles/${imamProfile.id}`, payload);
      
      showAlert("Imam Profile has been updated successfully", "success");
      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error updating imam profile:", error);
      showAlert(error?.response?.data?.message || "Failed to update imam profile", "danger");
    }
  };

  const handleDelete = () => {
    const imamName = `${imamProfile.name || ''} ${imamProfile.surname || ''}`.trim() || 'Unknown Imam';
    
    showDeleteConfirmation({
      id: imamProfile.id,
      name: imamName,
      type: "imam profile",
      message: "This imam profile and all associated data will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/imamProfiles/${imamProfile.id}`);
      showAlert("Imam Profile has been deleted successfully", "success");
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
              <p className="text-muted mb-1 font-size-11 text-uppercase">ID Number</p>
              <p className="mb-2 fw-medium font-size-12">{imamProfile.id_number || "-"}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Title</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.title, imamProfile.title)}</p>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Date of Birth</p>
              <p className="mb-2 fw-medium font-size-12">{formatDate(imamProfile.dob)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Nationality</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.nationality, imamProfile.nationality)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Madhab</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.madhab, imamProfile.madhab)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Race</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.race, imamProfile.race)}</p>
            </Col>
          </Row>

          <Row className="mb-0">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Gender</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.gender, imamProfile.gender)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Marital Status</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.maritalStatus, imamProfile.marital_status)}</p>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} toggle={toggleModal} centered size="lg" backdrop="static">
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
                  <Label>ID Number</Label>
                  <Controller
                    name="ID_Number"
                    control={control}
                    render={({ field }) => <Input type="text" {...field} />}
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
                        {lookupData.title.map((item) => (
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
                  <Label>Nationality</Label>
                  <Controller
                    name="Nationality"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Nationality</option>
                        {lookupData.nationality.map((item) => (
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
                  <Controller
                    name="nationality_id"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setValue("province_id", "");
                          setValue("suburb_id", "");
                        }}
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.id || country.ID} value={country.id || country.ID}>
                            {country.name || country.Name} {country.code || country.Code ? `(${country.code || country.Code})` : ""}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Province</Label>
                  <Controller
                    name="province_id"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        {...field}
                        disabled={!watchedCountry}
                        onChange={(e) => {
                          field.onChange(e);
                          setValue("suburb_id", "");
                        }}
                      >
                        <option value="">Select Province</option>
                        {filteredProvinces.map((province) => (
                          <option key={province.id || province.ID} value={province.id || province.ID}>
                            {province.name || province.Name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Suburb</Label>
                  <Controller
                    name="suburb_id"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        {...field}
                        disabled={!watchedProvince}
                      >
                        <option value="">Select Suburb</option>
                        {filteredSuburbs.map((suburb) => (
                          <option key={suburb.id || suburb.ID} value={suburb.id || suburb.ID}>
                            {suburb.name || suburb.Name}
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
                        {lookupData.madhab.map((item) => (
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
                        {lookupData.race.map((item) => (
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
                        {lookupData.gender.map((item) => (
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
                        {lookupData.maritalStatus.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
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

