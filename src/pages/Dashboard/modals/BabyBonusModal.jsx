import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const BabyBonusModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        spouse_name: "",
        baby_name: "",
        baby_dob: "",
        comment: "",
        Baby_Image: null,
        Birth_Certificate: null,
      });
    }
  }, [isOpen, reset]);

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      const hasBabyImage = data.Baby_Image && data.Baby_Image.length > 0;
      const hasBirthCertificate = data.Birth_Certificate && data.Birth_Certificate.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("spouse_name", data.spouse_name);
      formData.append("baby_name", data.baby_name);
      formData.append("baby_dob", data.baby_dob);
      formData.append("comment", data.comment || "");
      
      if (hasBabyImage) {
        formData.append("Baby_Image", data.Baby_Image[0]);
      }
      if (hasBirthCertificate) {
        formData.append("Birth_Certificate", data.Birth_Certificate[0]);
      }

      formData.append("created_by", getAuditName());
      await axiosApi.post(`${API_BASE_URL}/newBabyBonus`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showAlert("New baby bonus created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create new baby bonus", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add New Baby Bonus
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Spouse Name</Label>
                  <Controller 
                    name="spouse_name" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Baby Name</Label>
                  <Controller 
                    name="baby_name" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Baby Date of Birth</Label>
                  <Controller 
                    name="baby_dob" 
                    control={control} 
                    render={({ field }) => <Input type="date" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Baby Image</Label>
                  <Controller 
                    name="Baby_Image" 
                    control={control} 
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                    )} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Birth Certificate</Label>
                  <Controller 
                    name="Birth_Certificate" 
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

export default BabyBonusModal;

