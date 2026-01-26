import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const BabyBonusModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [lookupData, setLookupData] = useState({
    relationshipTypes: [],
    gender: [],
  });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  // Filter relationships to only show spouse (husband/wife) relationships
  const spouseRelationships = useMemo(() => {
    if (!relationships || !lookupData?.relationshipTypes) return [];
    const spouseType = lookupData.relationshipTypes.find(rt => rt.name?.toLowerCase() === "spouse");
    if (!spouseType) return [];
    return relationships.filter(rel => Number(rel.relationship_type) === Number(spouseType.id));
  }, [relationships, lookupData]);

  useEffect(() => {
    if (isOpen && imamProfileId) {
      fetchRelationships();
      fetchLookupData();
      reset({
        spouse_relationship_id: "",
        baby_name: "",
        baby_dob: "",
        gender: "",
        identification_number: "",
        comment: "",
        Baby_Image: null,
        Birth_Certificate: null,
        acknowledgment: false,
      });
    }
  }, [isOpen, imamProfileId, reset]);

  const fetchRelationships = async () => {
    try {
      const response = await axiosApi.get(`${API_BASE_URL}/imamRelationships?imam_profile_id=${imamProfileId}`);
      setRelationships(response.data || []);
    } catch (error) {
      console.error("Error fetching relationships:", error);
      setRelationships([]);
    }
  };

  const fetchLookupData = async () => {
    try {
      const relationshipTypesRes = await axiosApi.get(`${API_BASE_URL}/lookup/Relationship_Types`);
      const genderRes = await axiosApi.get(`${API_BASE_URL}/lookup/Gender`);
      setLookupData({
        relationshipTypes: relationshipTypesRes.data || [],
        gender: genderRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching lookup data:", error);
    }
  };

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
      formData.append("spouse_relationship_id", data.spouse_relationship_id || "");
      formData.append("baby_name", data.baby_name);
      formData.append("baby_dob", data.baby_dob);
      formData.append("gender", data.gender || "");
      formData.append("identification_number", data.identification_number || "");
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
                  <Label>Spouse Name <span className="text-danger">*</span></Label>
                  <Controller 
                    name="spouse_relationship_id" 
                    control={control} 
                    rules={{ required: "Spouse name is required" }} 
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.spouse_relationship_id} {...field}>
                        <option value="">Select Spouse</option>
                        {spouseRelationships.map((rel) => (
                          <option key={rel.id} value={rel.id}>
                            {rel.name || ""} {rel.surname || ""}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.spouse_relationship_id && <FormFeedback>{errors.spouse_relationship_id.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Baby Name <span className="text-danger">*</span></Label>
                  <Controller 
                    name="baby_name" 
                    control={control} 
                    rules={{ required: "Baby name is required" }} 
                    render={({ field }) => <Input type="text" invalid={!!errors.baby_name} {...field} />} 
                  />
                  {errors.baby_name && <FormFeedback>{errors.baby_name.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Baby Date of Birth <span className="text-danger">*</span></Label>
                  <Controller 
                    name="baby_dob" 
                    control={control} 
                    rules={{ required: "Baby date of birth is required" }} 
                    render={({ field }) => <Input type="date" invalid={!!errors.baby_dob} {...field} />} 
                  />
                  {errors.baby_dob && <FormFeedback>{errors.baby_dob.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Gender</Label>
                  <Controller 
                    name="gender" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.gender} {...field}>
                        <option value="">Select Gender</option>
                        {lookupData?.gender?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.gender && <FormFeedback>{errors.gender.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Identification Number</Label>
                  <Controller 
                    name="identification_number" 
                    control={control} 
                    render={({ field }) => <Input type="text" invalid={!!errors.identification_number} {...field} />} 
                  />
                  {errors.identification_number && <FormFeedback>{errors.identification_number.message}</FormFeedback>}
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
                          id="acknowledgment-baby"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledgment}
                        />
                        <Label check htmlFor="acknowledgment-baby">
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

export default BabyBonusModal;

