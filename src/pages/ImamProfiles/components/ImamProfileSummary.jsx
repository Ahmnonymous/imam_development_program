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
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
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
  2: "Additional Details",
};

const EDIT_IMAM_PROFILE_TAB_FIELDS = {
  1: [
    "Name",
    "Surname",
    "ID_Number",
    "Nationality",
    "Title",
    "DOB",
    "Race",
    "Gender",
    "Marital_Status",
  ],
  2: [
    "Madhab",
    "suburb_id",
    "province_id",
    "nationality_id",
  ],
};

const ImamProfileSummary = ({ imamProfile, lookupData, onUpdate, showAlert }) => {
  const { isOrgExecutive } = useRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

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
  } = useForm();
  const tabFieldGroups = useMemo(() => EDIT_IMAM_PROFILE_TAB_FIELDS, []);
  const fieldTabMap = useMemo(() => createFieldTabMap(tabFieldGroups), [tabFieldGroups]);

  const handleFormError = (formErrors) =>
    handleTabbedFormErrors({
      errors: formErrors,
      fieldTabMap,
      tabLabelMap: EDIT_IMAM_PROFILE_TAB_LABELS,
      setActiveTab,
      showAlert,
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

  useEffect(() => {
    if (imamProfile && modalOpen) {
      reset({
        Name: imamProfile.name || "",
        Surname: imamProfile.surname || "",
        ID_Number: imamProfile.id_number || "",
        Nationality: imamProfile.nationality || "",
        Title: imamProfile.title || "",
        DOB: formatDateForInput(imamProfile.dob),
        Race: imamProfile.race || "",
        Gender: imamProfile.gender || "",
        Marital_Status: imamProfile.marital_status || "",
        Madhab: imamProfile.madhab || "",
        suburb_id: imamProfile.suburb_id || "",
        province_id: imamProfile.province_id || "",
        nationality_id: imamProfile.nationality_id || "",
      });
    }
  }, [imamProfile, modalOpen, reset]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (!modalOpen) {
      setActiveTab("1");
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.Name,
        surname: data.Surname,
        id_number: data.ID_Number || null,
        nationality: data.Nationality && data.Nationality !== "" ? parseInt(data.Nationality) : null,
        title: data.Title && data.Title !== "" ? parseInt(data.Title) : null,
        dob: data.DOB || null,
        race: data.Race && data.Race !== "" ? parseInt(data.Race) : null,
        gender: data.Gender && data.Gender !== "" ? parseInt(data.Gender) : null,
        marital_status: data.Marital_Status && data.Marital_Status !== "" ? parseInt(data.Marital_Status) : null,
        madhab: data.Madhab && data.Madhab !== "" ? parseInt(data.Madhab) : null,
        suburb_id: data.suburb_id && data.suburb_id !== "" ? parseInt(data.suburb_id) : null,
        province_id: data.province_id && data.province_id !== "" ? parseInt(data.province_id) : null,
        nationality_id: data.nationality_id && data.nationality_id !== "" ? parseInt(data.nationality_id) : null,
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

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
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
              <p className="text-muted mb-1 font-size-11 text-uppercase">Date of Birth</p>
              <p className="mb-2 fw-medium font-size-12">{formatDate(imamProfile.dob)}</p>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Title</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.title, imamProfile.title)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Nationality</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.nationality, imamProfile.nationality)}</p>
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
              <p className="text-muted mb-1 font-size-11 text-uppercase">Province</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.province, imamProfile.province_id)}</p>
            </Col>
            <Col md={3}>
              <p className="text-muted mb-1 font-size-11 text-uppercase">Suburb</p>
              <p className="mb-2 fw-medium font-size-12">{getLookupName(lookupData.suburb, imamProfile.suburb_id)}</p>
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
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => toggleTab("1")}
                  style={{ cursor: "pointer" }}
                >
                  Personal Info
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "2" })}
                  onClick={() => toggleTab("2")}
                  style={{ cursor: "pointer" }}
                >
                  Additional Details
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={activeTab} className="pt-3">
              <TabPane tabId="1">
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
                      <Label>Nationality</Label>
                      <Controller
                        name="Nationality"
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
                </Row>
              </TabPane>

              <TabPane tabId="2">
                <Row>
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
                      <Label>Province</Label>
                      <Controller
                        name="province_id"
                        control={control}
                        render={({ field }) => (
                          <Input type="select" {...field}>
                            <option value="">Select Province</option>
                            {(lookupData.province || []).map((item) => (
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
                      <Label>Suburb</Label>
                      <Controller
                        name="suburb_id"
                        control={control}
                        render={({ field }) => (
                          <Input type="select" {...field}>
                            <option value="">Select Suburb</option>
                            {(lookupData.suburb || []).map((item) => (
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
                      <Label>Nationality ID</Label>
                      <Controller
                        name="nationality_id"
                        control={control}
                        render={({ field }) => (
                          <Input type="select" {...field}>
                            <option value="">Select Nationality ID</option>
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
                </Row>
              </TabPane>
            </TabContent>
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

