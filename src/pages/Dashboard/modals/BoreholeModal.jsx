import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const BoreholeModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const [lookupData, setLookupData] = useState({
    boreholeLocation: [],
    waterSource: [],
    yesNo: [],
    waterUsagePurpose: [],
  });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const [selectedWaterUsagePurposeIds, setSelectedWaterUsagePurposeIds] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedWaterUsagePurposeIds([]);
      setLatitude("");
      setLongitude("");
      reset({
        where_required: "",
        has_electricity: "",
        received_borehole_before: "",
        current_water_source: "",
        distance_to_water_source: "",
        beneficiaries_count: "",
        challenges_due_to_lack_of_water: "",
        motivation: "",
        acknowledge: false,
        Current_Water_Source_Image: null,
        Masjid_Area_Image: null,
      });
      fetchLookupData();
    }
  }, [isOpen, reset]);

  const fetchLookupData = async () => {
    try {
      const [
        boreholeLocationRes,
        waterSourceRes,
        yesNoRes,
        waterUsagePurposeRes,
      ] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/lookup/Borehole_Location`),
        axiosApi.get(`${API_BASE_URL}/lookup/Water_Source`),
        axiosApi.get(`${API_BASE_URL}/lookup/Yes_No`),
        axiosApi.get(`${API_BASE_URL}/lookup/Water_Usage_Purpose`),
      ]);
      setLookupData({
        boreholeLocation: boreholeLocationRes.data || [],
        waterSource: waterSourceRes.data || [],
        yesNo: yesNoRes.data || [],
        waterUsagePurpose: waterUsagePurposeRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching lookup data:", error);
    }
  };

  const handleWaterUsagePurposeChange = (purposeId) => {
    const purposeIdStr = String(purposeId);
    const updated = selectedWaterUsagePurposeIds.includes(purposeIdStr)
      ? selectedWaterUsagePurposeIds.filter(id => id !== purposeIdStr)
      : [...selectedWaterUsagePurposeIds, purposeIdStr];
    setSelectedWaterUsagePurposeIds(updated);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.error("Error getting location:", error);
          showAlert("Unable to get location. Please enter manually.", "warning");
        }
      );
    } else {
      showAlert("Geolocation is not supported by your browser.", "warning");
    }
  };

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      // Validate water usage purposes
      if (selectedWaterUsagePurposeIds.length === 0) {
        showAlert("Please select at least one water usage purpose", "danger");
        return;
      }

      // Validate required fields
      if (!data.beneficiaries_count || data.beneficiaries_count < 1) {
        showAlert("Please enter the number of beneficiaries (must be at least 1)", "danger");
        return;
      }

      if (!data.challenges_due_to_lack_of_water || data.challenges_due_to_lack_of_water.trim() === "") {
        showAlert("Please describe the challenges faced due to lack of clean water", "danger");
        return;
      }

      if (!data.motivation || data.motivation.trim() === "") {
        showAlert("Please write a motivation for why your community needs a borehole", "danger");
        return;
      }

      // Validate images
      if (!data.Current_Water_Source_Image || data.Current_Water_Source_Image.length === 0) {
        showAlert("Please upload an image of the current water source", "danger");
        return;
      }
      if (!data.Masjid_Area_Image || data.Masjid_Area_Image.length === 0) {
        showAlert("Please upload an image of the Masjid/Area where the borehole will be", "danger");
        return;
      }

      const hasCurrentWaterImage = data.Current_Water_Source_Image && data.Current_Water_Source_Image.length > 0;
      const hasMasjidAreaImage = data.Masjid_Area_Image && data.Masjid_Area_Image.length > 0;
      
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("where_required", data.where_required ? String(data.where_required) : "");
      formData.append("has_electricity", data.has_electricity ? String(data.has_electricity) : "");
      formData.append("received_borehole_before", data.received_borehole_before ? String(data.received_borehole_before) : "");
      formData.append("current_water_source", data.current_water_source ? String(data.current_water_source) : "");
      formData.append("distance_to_water_source", data.distance_to_water_source || "");
      // Append water usage purpose IDs as JSON string
      formData.append("water_usage_purpose_ids", JSON.stringify(selectedWaterUsagePurposeIds.map(id => parseInt(id))));
      formData.append("beneficiaries_count", data.beneficiaries_count || "");
      formData.append("challenges_due_to_lack_of_water", data.challenges_due_to_lack_of_water || "");
      formData.append("motivation", data.motivation || "");
      formData.append("longitude", longitude || "");
      formData.append("latitude", latitude || "");
      formData.append("acknowledge", data.acknowledge ? "true" : "false");
      formData.append("status_id", "1");
      formData.append("comment", "");

      if (hasCurrentWaterImage) {
        formData.append("Current_Water_Source_Image", data.Current_Water_Source_Image[0]);
      }
      if (hasMasjidAreaImage) {
        formData.append("Masjid_Area_Image", data.Masjid_Area_Image[0]);
      }

      formData.append("created_by", getAuditName());
      await axiosApi.post(`${API_BASE_URL}/borehole`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showAlert("Borehole request created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to create borehole request", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Borehole Request
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label>Where is the borehole required? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="where_required" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        invalid={!!errors.where_required}
                        value={field.value ? String(field.value) : ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                      >
                        <option value="">Select...</option>
                        {(lookupData?.boreholeLocation || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.where_required && <FormFeedback>{errors.where_required.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Do you have electricity on the property? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="has_electricity" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        invalid={!!errors.has_electricity}
                        {...field}
                      >
                        <option value="">Select...</option>
                        {(lookupData?.yesNo || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.has_electricity && <FormFeedback>{errors.has_electricity.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Have you received a borehole from the IDP before? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="received_borehole_before" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        invalid={!!errors.received_borehole_before}
                        {...field}
                      >
                        <option value="">Select...</option>
                        {(lookupData?.yesNo || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.received_borehole_before && <FormFeedback>{errors.received_borehole_before.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>What is the current source of water in your area? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="current_water_source" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        invalid={!!errors.current_water_source}
                        value={field.value ? String(field.value) : ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                      >
                        <option value="">Select...</option>
                        {(lookupData?.waterSource || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.current_water_source && <FormFeedback>{errors.current_water_source.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>What is the distance to the current water source? (KM) <span className="text-danger">*</span></Label>
                  <Controller 
                    name="distance_to_water_source" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        invalid={!!errors.distance_to_water_source}
                        {...field} 
                      />
                    )} 
                  />
                  {errors.distance_to_water_source && <FormFeedback>{errors.distance_to_water_source.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>What will the water be used for? <span className="text-danger">*</span></Label>
                  <div>
                    {(lookupData?.waterUsagePurpose || []).map((item) => (
                      <FormGroup check key={item.id} className="mb-2">
                        <Input
                          type="checkbox"
                          id={`water_usage_${item.id}`}
                          checked={selectedWaterUsagePurposeIds.includes(String(item.id))}
                          onChange={() => handleWaterUsagePurposeChange(item.id)}
                        />
                        <Label check for={`water_usage_${item.id}`} className="ms-2">
                          {item.name}
                        </Label>
                      </FormGroup>
                    ))}
                  </div>
                  {selectedWaterUsagePurposeIds.length === 0 && (
                    <small className="text-danger">Please select at least one option</small>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>How many people will benefit/make use of this borehole? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="beneficiaries_count" 
                    control={control} 
                    rules={{ required: "This field is required", min: { value: 1, message: "Must be at least 1" } }}
                    render={({ field }) => (
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Enter number" 
                        invalid={!!errors.beneficiaries_count}
                        {...field} 
                      />
                    )} 
                  />
                  {errors.beneficiaries_count && <FormFeedback>{errors.beneficiaries_count.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>What are the main challenges faced due to the lack of clean water? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="challenges_due_to_lack_of_water" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="textarea" 
                        rows="3"
                        placeholder="Describe the challenges..." 
                        invalid={!!errors.challenges_due_to_lack_of_water}
                        {...field} 
                      />
                    )} 
                  />
                  {errors.challenges_due_to_lack_of_water && <FormFeedback>{errors.challenges_due_to_lack_of_water.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Write a motivation as to why your community needs a borehole and how they will benefit from the new borehole <span className="text-danger">*</span></Label>
                  <Controller 
                    name="motivation" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="textarea" 
                        rows="4"
                        placeholder="Write your motivation..." 
                        invalid={!!errors.motivation}
                        {...field} 
                      />
                    )} 
                  />
                  {errors.motivation && <FormFeedback>{errors.motivation.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Include Images of the current water source <span className="text-danger">*</span></Label>
                  <Controller 
                    name="Current_Water_Source_Image" 
                    control={control} 
                    rules={{ 
                      validate: (files) => {
                        if (!files || files.length === 0) {
                          return "Image is required";
                        }
                        return true;
                      }
                    }}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input 
                        type="file" 
                        accept="image/*"
                        invalid={!!errors.Current_Water_Source_Image}
                        onChange={(e) => {
                          onChange(e.target.files);
                        }}
                        {...field}
                      />
                    )} 
                  />
                  {errors.Current_Water_Source_Image && <FormFeedback>{errors.Current_Water_Source_Image.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Image of the Masjid/Area where the borehole will be <span className="text-danger">*</span></Label>
                  <Controller 
                    name="Masjid_Area_Image" 
                    control={control} 
                    rules={{ 
                      validate: (files) => {
                        if (!files || files.length === 0) {
                          return "Image is required";
                        }
                        return true;
                      }
                    }}
                    render={({ field: { onChange, value, ...field } }) => (
                      <div>
                        <Input 
                          type="file" 
                          accept="image/*"
                          capture="environment"
                          invalid={!!errors.Masjid_Area_Image}
                          onChange={(e) => {
                            onChange(e.target.files);
                            if (e.target.files && e.target.files.length > 0) {
                              getCurrentLocation();
                            }
                          }}
                          {...field}
                        />
                        <small className="text-muted d-block mt-1">Please capture the image with location enabled to capture longitude and latitude values</small>
                      </div>
                    )} 
                  />
                  {errors.Masjid_Area_Image && <FormFeedback>{errors.Masjid_Area_Image.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Latitude</Label>
                  <Input 
                    type="text" 
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Auto-captured or enter manually"
                  />
                  <Button 
                    type="button" 
                    color="secondary" 
                    size="sm" 
                    className="mt-1"
                    onClick={getCurrentLocation}
                  >
                    <i className="bx bx-crosshair me-1"></i>Get Current Location
                  </Button>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Longitude</Label>
                  <Input 
                    type="text" 
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Auto-captured or enter manually"
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup check>
                  <Controller 
                    name="acknowledge" 
                    control={control} 
                    rules={{ required: "You must acknowledge this" }} 
                    render={({ field }) => (
                      <Input 
                        type="checkbox" 
                        checked={field.value} 
                        onChange={field.onChange} 
                        invalid={!!errors.acknowledge}
                      />
                    )} 
                  />
                  <Label check>
                    I declare that the information submitted is accurate and truthful. I understand that Allah is All-Seeing and All-Aware of what is in our hearts.
                  </Label>
                  {errors.acknowledge && <FormFeedback>{errors.acknowledge.message}</FormFeedback>}
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

export default BoreholeModal;
