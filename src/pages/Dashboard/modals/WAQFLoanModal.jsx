import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const WAQFLoanModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        participated_recent_bonuses_90_days: "",
        recent_bonuses_details: "",
        active_dawah: "",
        dawah_activities_details: "",
        contributed_to_waqf_loan_fund: "",
        loan_type: "",
        loan_reason: "",
        tried_employer_request: "",
        promise_to_repay: "",
        understand_waqf_fund: "",
        amount_required: "",
        monthly_income: "",
        monthly_expenses: "",
        repayment_structure: "",
        repayment_explanation: "",
        first_guarantor_name: "",
        first_guarantor_contact: "",
        second_guarantor_name: "",
        second_guarantor_contact: "",
        acknowledge: false,
        comment: "",
      });
    }
  }, [isOpen, reset]);

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      const formData = {
        imam_profile_id: imamProfileId,
        participated_recent_bonuses_90_days: data.participated_recent_bonuses_90_days ? parseInt(data.participated_recent_bonuses_90_days) : null,
        recent_bonuses_details: data.recent_bonuses_details || "",
        active_dawah: data.active_dawah ? parseInt(data.active_dawah) : null,
        dawah_activities_details: data.dawah_activities_details || "",
        contributed_to_waqf_loan_fund: data.contributed_to_waqf_loan_fund ? parseInt(data.contributed_to_waqf_loan_fund) : null,
        loan_type: data.loan_type || "",
        loan_reason: data.loan_reason || "",
        tried_employer_request: data.tried_employer_request || "",
        promise_to_repay: data.promise_to_repay ? parseInt(data.promise_to_repay) : null,
        understand_waqf_fund: data.understand_waqf_fund ? parseInt(data.understand_waqf_fund) : null,
        amount_required: data.amount_required ? parseFloat(data.amount_required) : null,
        monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : null,
        monthly_expenses: data.monthly_expenses ? parseFloat(data.monthly_expenses) : null,
        repayment_structure: data.repayment_structure ? parseFloat(data.repayment_structure) : null,
        repayment_explanation: data.repayment_explanation || "",
        first_guarantor_name: data.first_guarantor_name || "",
        first_guarantor_contact: data.first_guarantor_contact || "",
        second_guarantor_name: data.second_guarantor_name || "",
        second_guarantor_contact: data.second_guarantor_contact || "",
        acknowledge: data.acknowledge || false,
        status_id: 1,
        comment: data.comment || "",
        created_by: getAuditName(),
      };
      await axiosApi.post(`${API_BASE_URL}/waqfLoan`, formData);
      showAlert("WAQF Loan created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create WAQF Loan", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add WAQF Loan
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Loan Type</Label>
                  <Controller 
                    name="loan_type" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter loan type" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Amount Required</Label>
                  <Controller 
                    name="amount_required" 
                    control={control} 
                    render={({ field }) => <Input type="number" step="0.01" {...field} placeholder="0.00" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Monthly Income</Label>
                  <Controller 
                    name="monthly_income" 
                    control={control} 
                    render={({ field }) => <Input type="number" step="0.01" {...field} placeholder="0.00" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Monthly Expenses</Label>
                  <Controller 
                    name="monthly_expenses" 
                    control={control} 
                    render={({ field }) => <Input type="number" step="0.01" {...field} placeholder="0.00" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Repayment Structure</Label>
                  <Controller 
                    name="repayment_structure" 
                    control={control} 
                    render={({ field }) => <Input type="number" step="0.01" {...field} placeholder="0.00" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>First Guarantor Name</Label>
                  <Controller 
                    name="first_guarantor_name" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter guarantor name" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>First Guarantor Contact</Label>
                  <Controller 
                    name="first_guarantor_contact" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter contact" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Second Guarantor Name</Label>
                  <Controller 
                    name="second_guarantor_name" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter guarantor name" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Second Guarantor Contact</Label>
                  <Controller 
                    name="second_guarantor_contact" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter contact" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Loan Reason</Label>
                  <Controller 
                    name="loan_reason" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={3} {...field} placeholder="Enter loan reason" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Repayment Explanation</Label>
                  <Controller 
                    name="repayment_explanation" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={2} {...field} placeholder="Enter repayment explanation" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Recent Bonuses Details</Label>
                  <Controller 
                    name="recent_bonuses_details" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={2} {...field} placeholder="Enter details" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Dawah Activities Details</Label>
                  <Controller 
                    name="dawah_activities_details" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={2} {...field} placeholder="Enter details" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Tried Employer Request</Label>
                  <Controller 
                    name="tried_employer_request" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={2} {...field} placeholder="Enter details" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Comment</Label>
                  <Controller 
                    name="comment" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={2} {...field} placeholder="Enter comment" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup check>
                  <Controller 
                    name="acknowledge" 
                    control={control} 
                    render={({ field }) => (
                      <>
                        <Input type="checkbox" {...field} checked={field.value || false} />
                        <Label check>Acknowledge</Label>
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

export default WAQFLoanModal;


