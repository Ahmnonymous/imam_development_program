import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const TreePlantingModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        number_of_trees: "",
        tree_type: "",
        planting_location: "",
        planting_date: "",
        acknowledge: false,
        comment: "",
        Planting_Image: null,
      });
    }
  }, [isOpen, reset]);

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      const hasImage = data.Planting_Image && data.Planting_Image.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("number_of_trees", data.number_of_trees ? parseInt(data.number_of_trees) : "");
      formData.append("tree_type", data.tree_type || "");
      formData.append("planting_location", data.planting_location || "");
      formData.append("planting_date", data.planting_date || "");
      formData.append("acknowledge", data.acknowledge || false);
      formData.append("status_id", 1);
      formData.append("comment", data.comment || "");
      
      if (hasImage) {
        formData.append("Planting_Image", data.Planting_Image[0]);
      }

      formData.append("created_by", getAuditName());
      await axiosApi.post(`${API_BASE_URL}/treePlanting`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showAlert("Tree planting created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create tree planting", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Tree Planting
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Number of Trees</Label>
                  <Controller 
                    name="number_of_trees" 
                    control={control} 
                    render={({ field }) => <Input type="number" {...field} placeholder="Enter number of trees" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Tree Type</Label>
                  <Controller 
                    name="tree_type" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter tree type" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Planting Location</Label>
                  <Controller 
                    name="planting_location" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter planting location" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Planting Date</Label>
                  <Controller 
                    name="planting_date" 
                    control={control} 
                    render={({ field }) => <Input type="date" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Planting Image</Label>
                  <Controller 
                    name="Planting_Image" 
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
                    rules={{ required: "You must acknowledge the statement to proceed" }}
                    render={({ field }) => (
                      <>
                        <Input
                          type="checkbox"
                          id="acknowledgment-tree"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledge}
                        />
                        <Label check htmlFor="acknowledgment-tree">
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

export default TreePlantingModal;


