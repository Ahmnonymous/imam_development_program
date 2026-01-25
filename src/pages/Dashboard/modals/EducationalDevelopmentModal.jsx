import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const EducationalDevelopmentModal = ({ isOpen, toggle, imamProfileId }) => {
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
        course_name: "",
        institution_name: "",
        course_type: "",
        start_date: "",
        end_date: "",
        cost: "",
        cost_currency: "",
        funding_source: "",
        completion_status: "",
        certificate_obtained: false,
        acknowledge: false,
        comment: "",
        Certificate: null,
      });
    }
  }, [isOpen, reset]);

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      const hasCertificate = data.Certificate && data.Certificate.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("course_name", data.course_name);
      formData.append("institution_name", data.institution_name || "");
      formData.append("course_type", data.course_type || "");
      formData.append("start_date", data.start_date || "");
      formData.append("end_date", data.end_date || "");
      formData.append("cost", data.cost ? parseFloat(data.cost) : "");
      formData.append("cost_currency", data.cost_currency ? parseInt(data.cost_currency) : "");
      formData.append("funding_source", data.funding_source || "");
      formData.append("completion_status", data.completion_status || "");
      formData.append("certificate_obtained", data.certificate_obtained || false);
      formData.append("acknowledge", data.acknowledge || false);
      formData.append("status_id", 1);
      formData.append("comment", data.comment || "");
      
      if (hasCertificate) {
        formData.append("Certificate", data.Certificate[0]);
      }

      formData.append("created_by", getAuditName());
      await axiosApi.post(`${API_BASE_URL}/educationalDevelopment`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showAlert("Educational development created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create educational development", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Educational Development
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Course Name</Label>
                  <Controller 
                    name="course_name" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter course name" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Institution Name</Label>
                  <Controller 
                    name="institution_name" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter institution name" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Course Type</Label>
                  <Controller 
                    name="course_type" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter course type" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Funding Source</Label>
                  <Controller 
                    name="funding_source" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter funding source" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Start Date</Label>
                  <Controller 
                    name="start_date" 
                    control={control} 
                    render={({ field }) => <Input type="date" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>End Date</Label>
                  <Controller 
                    name="end_date" 
                    control={control} 
                    render={({ field }) => <Input type="date" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Cost</Label>
                  <Controller 
                    name="cost" 
                    control={control} 
                    render={({ field }) => <Input type="number" step="0.01" {...field} placeholder="0.00" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Currency</Label>
                  <Controller 
                    name="cost_currency" 
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
                  <Label>Completion Status</Label>
                  <Controller 
                    name="completion_status" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter completion status" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Certificate</Label>
                  <Controller 
                    name="Certificate" 
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
                    render={({ field }) => <Input type="textarea" rows={2} {...field} placeholder="Enter comment" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup check>
                  <Controller 
                    name="certificate_obtained" 
                    control={control} 
                    render={({ field }) => (
                      <>
                        <Input type="checkbox" {...field} checked={field.value || false} />
                        <Label check>Certificate Obtained</Label>
                      </>
                    )} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup check>
                  <Controller
                    name="acknowledge"
                    control={control}
                    rules={{ required: "You must acknowledge the statement to proceed" }}
                    render={({ field }) => (
                      <>
                        <Input
                          type="checkbox"
                          id="acknowledgment-educational"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledge}
                        />
                        <Label check htmlFor="acknowledgment-educational">
                          I swear by Allah, the All-Hearing and the All-Seeing, that I have completed this form truthfully and honestly, to the best of my knowledge and belief.
                        </Label>
                        {errors.acknowledge && (
                          <FormFeedback>{errors.acknowledge.message}</FormFeedback>
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

export default EducationalDevelopmentModal;


