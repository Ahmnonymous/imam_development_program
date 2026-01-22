import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const TopicsModal = ({ isOpen, toggle, imamProfileId }) => {
  const [lookupData, setLookupData] = useState({ suburb: [] });
  const [imamProfile, setImamProfile] = useState(null);
  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (isOpen && imamProfileId) {
      fetchImamProfile();
      fetchLookupData();
      reset({
        topic: "",
        masjid_name: "",
        town: "",
        attendance_count: "",
        language: "",
        comment: "",
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

  const fetchLookupData = async () => {
    try {
      const suburbRes = await axiosApi.get(`${API_BASE_URL}/lookup/Suburb`);
      setLookupData({ suburb: suburbRes.data || [] });
    } catch (error) {
      console.error("Error fetching lookup data:", error);
    }
  };

  const filteredSuburbs = useMemo(() => {
    if (!imamProfile?.suburb_id || !lookupData?.suburb) return [];
    return lookupData.suburb.filter(suburb => Number(suburb.id) === Number(imamProfile.suburb_id));
  }, [imamProfile?.suburb_id, lookupData?.suburb]);

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        imam_profile_id: parseInt(imamProfileId),
        topic: data.topic,
        masjid_name: data.masjid_name,
        town: data.town ? parseInt(data.town) : null,
        attendance_count: data.attendance_count ? parseInt(data.attendance_count) : null,
        language: data.language ? parseInt(data.language) : null,
        comment: data.comment || null,
        created_by: getAuditName(),
        updated_by: getAuditName(),
      };
      await axiosApi.post(`${API_BASE_URL}/jumuahKhutbahTopic`, payload);
      showAlert("Khutbah topic created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create khutbah topic", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Khutbah Topic
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Topic <span className="text-danger">*</span></Label>
                  <Controller 
                    name="topic" 
                    control={control} 
                    rules={{ required: "Topic is required" }} 
                    render={({ field }) => <Input type="text" invalid={!!errors.topic} {...field} />} 
                  />
                  {errors.topic && <FormFeedback>{errors.topic.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Masjid Name <span className="text-danger">*</span></Label>
                  <Controller 
                    name="masjid_name" 
                    control={control} 
                    rules={{ required: "Masjid name is required" }} 
                    render={({ field }) => <Input type="text" invalid={!!errors.masjid_name} {...field} />} 
                  />
                  {errors.masjid_name && <FormFeedback>{errors.masjid_name.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Town</Label>
                  <Controller 
                    name="town" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Town</option>
                        {(filteredSuburbs || []).map((x) => (
                          <option key={x.id} value={x.id}>{x.name}</option>
                        ))}
                      </Input>
                    )} 
                  />
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

export default TopicsModal;

