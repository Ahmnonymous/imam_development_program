import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const HardshipReliefModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const [lookupData, setLookupData] = useState({
    requestFor: [],
    yesNo: [],
    areas: [],
  });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const [requestForRes, yesNoRes, areasRes] = await Promise.all([
          axiosApi.get(`${API_BASE_URL}/lookup/Request_For_Lookup`),
          axiosApi.get(`${API_BASE_URL}/lookup/Yes_No`),
          axiosApi.get(`${API_BASE_URL}/lookup/Suburb`),
        ]);
        setLookupData({
          requestFor: requestForRes.data || [],
          yesNo: yesNoRes.data || [],
          areas: areasRes.data || [],
        });
      } catch (error) {
        console.error("Error fetching lookup data:", error);
      }
    };
    fetchLookupData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      reset({
        request_for: "",
        is_muslim: "",
        name_of_person_community: "",
        area_of_residence: "",
        age_group: "",
        has_disabilities: "",
        disability_details: "",
        dependents: "",
        assistance_type: "",
        amount_required_local_currency: "",
        acknowledge: false,
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
        request_for: data.request_for ? parseInt(data.request_for) : null,
        is_muslim: data.is_muslim ? parseInt(data.is_muslim) : null,
        name_of_person_community: data.name_of_person_community || "",
        area_of_residence: data.area_of_residence ? parseInt(data.area_of_residence) : null,
        age_group: data.age_group || "",
        has_disabilities: data.has_disabilities ? parseInt(data.has_disabilities) : null,
        disability_details: data.disability_details || "",
        dependents: data.dependents || "",
        assistance_type: data.assistance_type || "",
        amount_required_local_currency: data.amount_required_local_currency ? parseFloat(data.amount_required_local_currency) : null,
        acknowledge: data.acknowledge || false,
        status_id: 1,
        created_by: getAuditName(),
      };
      await axiosApi.post(`${API_BASE_URL}/hardshipRelief`, formData);
      showAlert("Hardship relief created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create hardship relief", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Hardship Relief
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Request For</Label>
                  <Controller 
                    name="request_for" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {lookupData.requestFor.map((item) => (
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
                  <Label>Is Muslim</Label>
                  <Controller 
                    name="is_muslim" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {lookupData.yesNo.map((item) => (
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
                  <Label>Name of Person/Community</Label>
                  <Controller 
                    name="name_of_person_community" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter name" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Area of Residence</Label>
                  <Controller 
                    name="area_of_residence" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {lookupData.areas.map((item) => (
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
                  <Label>Age Group</Label>
                  <Controller 
                    name="age_group" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter age group" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Has Disabilities</Label>
                  <Controller 
                    name="has_disabilities" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        {lookupData.yesNo.map((item) => (
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
                  <Label>Dependents</Label>
                  <Controller 
                    name="dependents" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter dependents" />} 
                  />
                </FormGroup>
              </Col>
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
                  <Label>Amount Required (Local Currency)</Label>
                  <Controller 
                    name="amount_required_local_currency" 
                    control={control} 
                    render={({ field }) => <Input type="number" step="0.01" {...field} placeholder="0.00" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Disability Details</Label>
                  <Controller 
                    name="disability_details" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={2} {...field} placeholder="Enter disability details" />} 
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
                          id="acknowledgment-hardship"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledge}
                        />
                        <Label check htmlFor="acknowledgment-hardship">
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

export default HardshipReliefModal;


