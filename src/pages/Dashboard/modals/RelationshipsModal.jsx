import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const RelationshipsModal = ({ isOpen, toggle, imamProfileId }) => {
  const [lookupData, setLookupData] = useState({
    relationshipTypes: [],
    gender: [],
    employmentStatus: [],
    educationLevel: [],
    healthConditions: [],
  });
  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        Relationship_Type: "",
        Name: "",
        Surname: "",
        ID_Number: "",
        Date_of_Birth: "",
        Employment_Status: "",
        Gender: "",
        Highest_Education: "",
        Health_Condition: "",
      });
      fetchLookupData();
    }
  }, [isOpen, reset]);

  const fetchLookupData = async () => {
    try {
      const [
        relationshipTypesRes,
        genderRes,
        employmentStatusRes,
        educationLevelRes,
        healthConditionsRes,
      ] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/lookup/Relationship_Types`),
        axiosApi.get(`${API_BASE_URL}/lookup/Gender`),
        axiosApi.get(`${API_BASE_URL}/lookup/Employment_Status`),
        axiosApi.get(`${API_BASE_URL}/lookup/Education_Level`),
        axiosApi.get(`${API_BASE_URL}/lookup/Health_Conditions`),
      ]);
      setLookupData({
        relationshipTypes: relationshipTypesRes.data || [],
        gender: genderRes.data || [],
        employmentStatus: employmentStatusRes.data || [],
        educationLevel: educationLevelRes.data || [],
        healthConditions: healthConditionsRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching lookup data:", error);
    }
  };

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        imam_profile_id: parseInt(imamProfileId),
        relationship_type: data.Relationship_Type ? parseInt(data.Relationship_Type) : null,
        name: data.Name,
        surname: data.Surname,
        id_number: data.ID_Number,
        date_of_birth: data.Date_of_Birth || null,
        employment_status: data.Employment_Status ? parseInt(data.Employment_Status) : null,
        gender: data.Gender ? parseInt(data.Gender) : null,
        highest_education: data.Highest_Education ? parseInt(data.Highest_Education) : null,
        health_condition: data.Health_Condition ? parseInt(data.Health_Condition) : null,
        created_by: getAuditName(),
        updated_by: getAuditName(),
      };
      await axiosApi.post(`${API_BASE_URL}/imamRelationships`, payload);
      showAlert("Relationship created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create relationship", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Relationship
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Relationship Type <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Relationship_Type"
                    control={control}
                    rules={{ required: "Relationship type is required" }}
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.Relationship_Type} {...field}>
                        <option value="">Select Type</option>
                        {(lookupData.relationshipTypes || []).map((x) => (
                          <option key={x.id} value={x.id}>{x.name}</option>
                        ))}
                      </Input>
                    )}
                  />
                  {errors.Relationship_Type && <FormFeedback>{errors.Relationship_Type.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Name <span className="text-danger">*</span>
                  </Label>
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
                  <Label>
                    Surname <span className="text-danger">*</span>
                  </Label>
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
                    rules={{
                      pattern: {
                        value: /^\d{13}$/,
                        message: "ID Number must be exactly 13 digits",
                      },
                    }}
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
                        invalid={!!errors.ID_Number}
                        {...field}
                      />
                    )}
                  />
                  {errors.ID_Number && <FormFeedback>{errors.ID_Number.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Date of Birth</Label>
                  <Controller
                    name="Date_of_Birth"
                    control={control}
                    render={({ field }) => <Input type="date" {...field} />}
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
                        {(lookupData.gender || []).map((x) => (
                          <option key={x.id} value={x.id}>{x.name}</option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Employment Status</Label>
                  <Controller
                    name="Employment_Status"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Status</option>
                        {(lookupData.employmentStatus || []).map((x) => (
                          <option key={x.id} value={x.id}>{x.name}</option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Highest Education</Label>
                  <Controller
                    name="Highest_Education"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Level</option>
                        {(lookupData.educationLevel || []).map((x) => (
                          <option key={x.id} value={x.id}>{x.name}</option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Health Condition</Label>
                  <Controller
                    name="Health_Condition"
                    control={control}
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Condition</option>
                        {(lookupData.healthConditions || []).map((x) => (
                          <option key={x.id} value={x.id}>{x.name}</option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={toggle} disabled={isSubmitting} className="me-2">
              <i className="bx bx-x me-1"></i> Cancel
            </Button>
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
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
};

export default RelationshipsModal;





