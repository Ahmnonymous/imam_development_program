import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const MedicalModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        visit_date: "",
        illness_description: "",
        amount: "",
        comment: "",
        Receipt: null,
        Supporting_Docs: null,
      });
    }
  }, [isOpen, reset]);

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
      formData.append("visit_date", data.visit_date);
      formData.append("illness_description", data.illness_description);
      formData.append("amount", data.amount);
      formData.append("comment", data.comment || "");
      
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
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Visit Date</Label>
                  <Controller 
                    name="visit_date" 
                    control={control} 
                    render={({ field }) => <Input type="date" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Amount</Label>
                  <Controller 
                    name="amount" 
                    control={control} 
                    render={({ field }) => <Input type="number" step="0.01" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Illness Description</Label>
                  <Controller 
                    name="illness_description" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={3} {...field} />} 
                  />
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
              <Col md={12}>
                <FormGroup>
                  <Label>Comment</Label>
                  <Controller 
                    name="comment" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={2} {...field} />} 
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

