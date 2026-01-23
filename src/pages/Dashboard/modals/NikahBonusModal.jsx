import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const NikahBonusModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [lookupData, setLookupData] = useState({
    relationshipTypes: [],
  });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  // Filter relationships to only show husband and wife relationships
  const spouseRelationships = useMemo(() => {
    if (!relationships || !lookupData?.relationshipTypes) return [];
    const husbandType = lookupData.relationshipTypes.find(rt => rt.name?.toLowerCase() === "husband");
    const wifeType = lookupData.relationshipTypes.find(rt => rt.name?.toLowerCase() === "wife");
    const spouseTypeIds = [];
    if (husbandType) spouseTypeIds.push(Number(husbandType.id));
    if (wifeType) spouseTypeIds.push(Number(wifeType.id));
    if (spouseTypeIds.length === 0) return [];
    return relationships.filter(rel => spouseTypeIds.includes(Number(rel.relationship_type)));
  }, [relationships, lookupData]);

  useEffect(() => {
    if (isOpen && imamProfileId) {
      fetchRelationships();
      fetchLookupData();
      reset({
        spouse_relationship_id: "",
        nikah_date: "",
        comment: "",
        Certificate: null,
        Nikah_Image: null,
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
      setLookupData({
        relationshipTypes: relationshipTypesRes.data || [],
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
      const hasCertificate = data.Certificate && data.Certificate.length > 0;
      const hasNikahImage = data.Nikah_Image && data.Nikah_Image.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("spouse_relationship_id", data.spouse_relationship_id ? parseInt(data.spouse_relationship_id) : "");
      formData.append("nikah_date", data.nikah_date);
      formData.append("comment", data.comment || "");
      
      if (hasCertificate) {
        formData.append("Certificate", data.Certificate[0]);
      }
      if (hasNikahImage) {
        formData.append("Nikah_Image", data.Nikah_Image[0]);
      }

      formData.append("created_by", getAuditName());
      await axiosApi.post(`${API_BASE_URL}/nikahBonus`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showAlert("Nikah bonus created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create nikah bonus", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Nikah Bonus
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
                  <Label>Nikah Date</Label>
                  <Controller 
                    name="nikah_date" 
                    control={control} 
                    render={({ field }) => <Input type="date" {...field} />} 
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
              <Col md={6}>
                <FormGroup>
                  <Label>Nikah Image</Label>
                  <Controller 
                    name="Nikah_Image" 
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

export default NikahBonusModal;

