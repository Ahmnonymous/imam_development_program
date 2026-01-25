import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const MedicalModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const [imamProfile, setImamProfile] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [lookupData, setLookupData] = useState({
    relationshipTypes: [],
    medicalVisitType: [],
  });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (isOpen && imamProfileId) {
      fetchImamProfile();
      fetchRelationships();
      fetchLookupData();
      reset({
        relationship_type: "",
        visit_type: "",
        visit_date: "",
        illness_description: "",
        amount: "",
        Receipt: null,
        Supporting_Docs: null,
        acknowledgment: false,
      });
    }
  }, [isOpen, imamProfileId, reset]);

  const fetchImamProfile = async () => {
    try {
      const response = await axiosApi.get(`${API_BASE_URL}/imamProfiles/${imamProfileId}`);
      if (response.data) {
        setImamProfile(response.data);
      }
    } catch (error) {
      console.error("Error fetching imam profile:", error);
    }
  };

  const fetchRelationships = async () => {
    try {
      const response = await axiosApi.get(`${API_BASE_URL}/imamRelationships?imam_profile_id=${imamProfileId}`);
      setRelationships(response.data || []);
    } catch (error) {
      console.error("Error fetching relationships:", error);
      setRelationships([]);
    }
  };

  const fetchLookupData = async () => {
    try {
      const [relationshipTypesRes, medicalVisitTypeRes] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/lookup/Relationship_Types`),
        axiosApi.get(`${API_BASE_URL}/lookup/Medical_Visit_Type`),
      ]);
      setLookupData({
        relationshipTypes: relationshipTypesRes.data || [],
        medicalVisitType: medicalVisitTypeRes.data || [],
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
      const hasReceipt = data.Receipt && data.Receipt.length > 0;
      const hasSupportingDocs = data.Supporting_Docs && data.Supporting_Docs.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("relationship_type", data.relationship_type ? parseInt(data.relationship_type) : "");
      formData.append("visit_type", data.visit_type ? parseInt(data.visit_type) : "");
      formData.append("visit_date", data.visit_date);
      formData.append("illness_description", data.illness_description);
      formData.append("amount", data.amount);
      
      if (hasReceipt) {
        formData.append("Receipt", data.Receipt[0]);
      }
      if (hasSupportingDocs) {
        formData.append("Supporting_Docs", data.Supporting_Docs[0]);
      }

      formData.append("created_by", getAuditName());
      await axiosApi.post(`${API_BASE_URL}/medicalReimbursement`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showAlert("Medical reimbursement created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create medical reimbursement", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Medical Reimbursement
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Relationship <span className="text-danger">*</span></Label>
                  <Controller 
                    name="relationship_type" 
                    control={control} 
                    rules={{ required: "Relationship is required" }} 
                    render={({ field }) => {
                      // Find "Imam" or "Self" relationship type for the imam option
                      const imamRelationshipType = lookupData?.relationshipTypes?.find(
                        rt => rt.name?.toLowerCase() === "imam" || rt.name?.toLowerCase() === "self"
                      );
                      return (
                        <Input type="select" invalid={!!errors.relationship_type} {...field}>
                          <option value="">Select Relationship</option>
                          {/* Imam option */}
                          {imamProfile && imamRelationshipType && (
                            <option value={imamRelationshipType.id}>
                              {imamProfile.name} {imamProfile.surname} ({imamRelationshipType.name})
                            </option>
                          )}
                          {/* Relationship options */}
                          {(relationships || []).map((rel) => {
                            const relType = lookupData?.relationshipTypes?.find(rt => Number(rt.id) === Number(rel.relationship_type));
                            return (
                              <option key={rel.id} value={rel.relationship_type}>
                                {rel.name} {rel.surname} ({relType?.name || ""})
                              </option>
                            );
                          })}
                        </Input>
                      );
                    }} 
                  />
                  {errors.relationship_type && <FormFeedback>{errors.relationship_type.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Type of Visit <span className="text-danger">*</span></Label>
                  <Controller 
                    name="visit_type" 
                    control={control} 
                    rules={{ required: "Type of visit is required" }} 
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.visit_type} {...field}>
                        <option value="">Select Visit Type</option>
                        {(lookupData.medicalVisitType || []).map((vt) => (
                          <option key={vt.id} value={vt.id}>{vt.name}</option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.visit_type && <FormFeedback>{errors.visit_type.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Visit Date <span className="text-danger">*</span></Label>
                  <Controller 
                    name="visit_date" 
                    control={control} 
                    rules={{ required: "Visit date is required" }} 
                    render={({ field }) => <Input type="date" invalid={!!errors.visit_date} {...field} />} 
                  />
                  {errors.visit_date && <FormFeedback>{errors.visit_date.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Amount <span className="text-danger">*</span></Label>
                  <Controller 
                    name="amount" 
                    control={control} 
                    rules={{ required: "Amount is required" }} 
                    render={({ field }) => <Input type="number" step="0.01" invalid={!!errors.amount} {...field} />} 
                  />
                  {errors.amount && <FormFeedback>{errors.amount.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Illness Description <span className="text-danger">*</span></Label>
                  <Controller 
                    name="illness_description" 
                    control={control} 
                    rules={{ required: "Illness description is required" }} 
                    render={({ field }) => <Input type="textarea" rows={3} invalid={!!errors.illness_description} {...field} />} 
                  />
                  {errors.illness_description && <FormFeedback>{errors.illness_description.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Receipt</Label>
                  <Controller 
                    name="Receipt" 
                    control={control} 
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                    )} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Supporting Documents</Label>
                  <Controller 
                    name="Supporting_Docs" 
                    control={control} 
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                    )} 
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup check>
                  <Controller
                    name="acknowledgment"
                    control={control}
                    rules={{ required: "You must acknowledge the statement to proceed" }}
                    render={({ field }) => (
                      <>
                        <Input
                          type="checkbox"
                          id="acknowledgment-medical"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledgment}
                        />
                        <Label check htmlFor="acknowledgment-medical">
                          I swear by Allah, the All-Hearing and the All-Seeing, that I have completed this form truthfully and honestly, to the best of my knowledge and belief.
                        </Label>
                        {errors.acknowledgment && (
                          <FormFeedback>{errors.acknowledgment.message}</FormFeedback>
                        )}
                      </>
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

export default MedicalModal;
