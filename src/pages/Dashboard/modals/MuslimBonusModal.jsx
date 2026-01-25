import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const MuslimBonusModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const [lookupData, setLookupData] = useState({ gender: [] });

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const genderRes = await axiosApi.get(`${API_BASE_URL}/lookup/Gender`);
        setLookupData({ gender: genderRes.data || [] });
      } catch (error) {
        console.error("Error fetching lookup data:", error);
      }
    };
    fetchLookupData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      reset({
        revert_name: "",
        revert_gender: "",
        revert_dob: "",
        revert_phone: "",
        revert_email: "",
        revert_reason: "",
        comment: "",
        acknowledgment: false,
      });
    }
  }, [isOpen, reset]);

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        imam_profile_id: parseInt(imamProfileId),
        revert_name: data.revert_name,
        revert_gender: data.revert_gender ? parseInt(data.revert_gender) : null,
        revert_dob: data.revert_dob || null,
        revert_phone: data.revert_phone || null,
        revert_email: data.revert_email || null,
        revert_reason: data.revert_reason,
        comment: data.comment || null,
        created_by: getAuditName(),
        updated_by: getAuditName(),
      };
      await axiosApi.post(`${API_BASE_URL}/newMuslimBonus`, payload);
      showAlert("New Muslim bonus created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create new Muslim bonus", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add New Muslim Bonus
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Revert Name</Label>
                  <Controller 
                    name="revert_name" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Gender</Label>
                  <Controller 
                    name="revert_gender" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Gender</option>
                        {(lookupData.gender || []).map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
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
                    name="revert_dob" 
                    control={control} 
                    render={({ field }) => <Input type="date" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Phone</Label>
                  <Controller 
                    name="revert_phone" 
                    control={control} 
                    render={({ field }) => <Input type="tel" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Email</Label>
                  <Controller 
                    name="revert_email" 
                    control={control} 
                    render={({ field }) => <Input type="email" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Revert Reason</Label>
                  <Controller 
                    name="revert_reason" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={3} {...field} />} 
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
                          id="acknowledgment-muslim"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledgment}
                        />
                        <Label check htmlFor="acknowledgment-muslim">
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

export default MuslimBonusModal;

