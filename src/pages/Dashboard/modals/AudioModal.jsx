import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const AudioModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        khutbah_topic: "",
        khutbah_date: "",
        attendance_count: "",
        comment: "",
        Audio: null,
      });
    }
  }, [isOpen, reset]);

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      const hasFile = data.Audio && data.Audio.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("khutbah_topic", data.khutbah_topic);
      formData.append("khutbah_date", data.khutbah_date);
      formData.append("attendance_count", data.attendance_count || "");
      formData.append("comment", data.comment || "");
      
      if (hasFile) {
        formData.append("Audio", data.Audio[0]);
      }

      formData.append("created_by", getAuditName());
      await axiosApi.post(`${API_BASE_URL}/jumuahAudioKhutbah`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showAlert("Audio Khutbah created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create audio khutbah", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Audio Khutbah
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Khutbah Topic <span className="text-danger">*</span></Label>
                  <Controller 
                    name="khutbah_topic" 
                    control={control} 
                    rules={{ required: "Topic is required" }} 
                    render={({ field }) => <Input type="text" invalid={!!errors.khutbah_topic} {...field} />} 
                  />
                  {errors.khutbah_topic && <FormFeedback>{errors.khutbah_topic.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Khutbah Date <span className="text-danger">*</span></Label>
                  <Controller 
                    name="khutbah_date" 
                    control={control} 
                    rules={{ required: "Date is required" }} 
                    render={({ field }) => <Input type="date" invalid={!!errors.khutbah_date} {...field} />} 
                  />
                  {errors.khutbah_date && <FormFeedback>{errors.khutbah_date.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Attendance Count</Label>
                  <Controller 
                    name="attendance_count" 
                    control={control} 
                    render={({ field }) => <Input type="number" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Audio File</Label>
                  <Controller 
                    name="Audio" 
                    control={control} 
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input 
                        type="file" 
                        accept="audio/*"
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

export default AudioModal;

