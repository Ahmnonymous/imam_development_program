import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const FinancialAssistanceModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axiosApi.get(`${API_BASE_URL}/lookup/Currency`);
        setCurrencies(response.data || []);
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (isOpen) {
      reset({
        assistance_type: "",
        amount_required: "",
        amount_required_currency: "",
        reason_for_assistance: "",
        monthly_income: "",
        monthly_expenses: "",
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
        assistance_type: data.assistance_type,
        amount_required: data.amount_required ? parseFloat(data.amount_required) : null,
        amount_required_currency: data.amount_required_currency ? parseInt(data.amount_required_currency) : null,
        reason_for_assistance: data.reason_for_assistance,
        monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : null,
        monthly_expenses: data.monthly_expenses ? parseFloat(data.monthly_expenses) : null,
        acknowledge: data.acknowledge || false,
        status_id: 1,
        comment: data.comment || "",
        created_by: getAuditName(),
      };
      await axiosApi.post(`${API_BASE_URL}/imamFinancialAssistance`, formData);
      showAlert("Financial assistance created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create financial assistance", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Financial Assistance
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Assistance Type</Label>
                  <Controller 
                    name="assistance_type" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter assistance type" />} 
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
                  <Label>Currency</Label>
                  <Controller 
                    name="amount_required_currency" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Currency</option>
                        {currencies.map((currency) => (
                          <option key={currency.id} value={currency.id}>
                            {currency.name}
                          </option>
                        ))}
                      </Input>
                    )} 
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
              <Col md={12}>
                <FormGroup>
                  <Label>Reason for Assistance</Label>
                  <Controller 
                    name="reason_for_assistance" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={3} {...field} placeholder="Enter reason" />} 
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

export default FinancialAssistanceModal;


