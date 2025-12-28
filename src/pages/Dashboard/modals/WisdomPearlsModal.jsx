import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const WisdomPearlsModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        resource_title: "",
        author_speaker: "",
        heading_description: "",
        pearl_one: "",
        pearl_two: "",
        pearl_three: "",
        pearl_four: "",
        pearl_five: "",
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
      const payload = {
        imam_profile_id: parseInt(imamProfileId),
        resource_title: data.resource_title,
        author_speaker: data.author_speaker || null,
        heading_description: data.heading_description || null,
        pearl_one: data.pearl_one,
        pearl_two: data.pearl_two || null,
        pearl_three: data.pearl_three || null,
        pearl_four: data.pearl_four || null,
        pearl_five: data.pearl_five || null,
        comment: data.comment || null,
        created_by: getAuditName(),
        updated_by: getAuditName(),
      };
      await axiosApi.post(`${API_BASE_URL}/pearlsOfWisdom`, payload);
      showAlert("Pearl of Wisdom created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create pearl of wisdom", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Pearl of Wisdom
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <FormGroup>
              <Label>Resource Title <span className="text-danger">*</span></Label>
              <Controller
                name="resource_title"
                control={control}
                rules={{ required: "Resource title is required" }}
                render={({ field }) => <Input type="text" invalid={!!errors.resource_title} {...field} />}
              />
              {errors.resource_title && <FormFeedback>{errors.resource_title.message}</FormFeedback>}
            </FormGroup>
            <FormGroup>
              <Label>Author/Speaker</Label>
              <Controller
                name="author_speaker"
                control={control}
                render={({ field }) => <Input type="text" {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Heading/Description</Label>
              <Controller
                name="heading_description"
                control={control}
                render={({ field }) => <Input type="textarea" rows={3} {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Pearl One <span className="text-danger">*</span></Label>
              <Controller
                name="pearl_one"
                control={control}
                rules={{ required: "Pearl one is required" }}
                render={({ field }) => <Input type="textarea" rows={3} invalid={!!errors.pearl_one} {...field} />}
              />
              {errors.pearl_one && <FormFeedback>{errors.pearl_one.message}</FormFeedback>}
            </FormGroup>
            <FormGroup>
              <Label>Pearl Two</Label>
              <Controller
                name="pearl_two"
                control={control}
                render={({ field }) => <Input type="textarea" rows={3} {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Pearl Three</Label>
              <Controller
                name="pearl_three"
                control={control}
                render={({ field }) => <Input type="textarea" rows={3} {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Pearl Four</Label>
              <Controller
                name="pearl_four"
                control={control}
                render={({ field }) => <Input type="textarea" rows={3} {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Pearl Five</Label>
              <Controller
                name="pearl_five"
                control={control}
                render={({ field }) => <Input type="textarea" rows={3} {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Comment</Label>
              <Controller
                name="comment"
                control={control}
                render={({ field }) => <Input type="textarea" rows={2} {...field} />}
              />
            </FormGroup>
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

export default WisdomPearlsModal;

