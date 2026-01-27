import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const HigherEducationRequestModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const [lookupData, setLookupData] = useState({
    courseTypes: [],
    durations: [],
    studyMethods: [],
    yesNo: [],
  });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const [courseTypesRes, durationsRes, studyMethodsRes, yesNoRes] = await Promise.all([
          axiosApi.get(`${API_BASE_URL}/lookup/Course_Type_Lookup`).catch(() => ({ data: [] })),
          axiosApi.get(`${API_BASE_URL}/lookup/Course_Duration_Lookup`).catch(() => ({ data: [] })),
          axiosApi.get(`${API_BASE_URL}/lookup/Study_Method_Lookup`).catch(() => ({ data: [] })),
          axiosApi.get(`${API_BASE_URL}/lookup/Yes_No`).catch(() => ({ data: [] })),
        ]);
        setLookupData({
          courseTypes: courseTypesRes.data || [],
          durations: durationsRes.data || [],
          studyMethods: studyMethodsRes.data || [],
          yesNo: yesNoRes.data || [],
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
        course_type: "",
        course_name: "",
        cost_local_currency: "",
        cost_south_african_rand: "",
        institute_name: "",
        duration: "",
        start_date: "",
        end_date: "",
        study_method: "",
        days_times_attending: "",
        times_per_month: "",
        semesters_per_year: "",
        will_stop_imam_duties: "",
        acknowledge: false,
        Course_Brochure: null,
        Quotation: null,
        Motivation_Letter: null,
      });
    }
  }, [isOpen, reset]);

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("course_type", data.course_type || "");
      formData.append("course_name", data.course_name || "");
      formData.append("cost_local_currency", data.cost_local_currency ? parseFloat(data.cost_local_currency) : "");
      formData.append("cost_south_african_rand", data.cost_south_african_rand ? parseFloat(data.cost_south_african_rand) : "");
      formData.append("institute_name", data.institute_name || "");
      formData.append("duration", data.duration ? parseInt(data.duration) : "");
      formData.append("start_date", data.start_date || "");
      formData.append("end_date", data.end_date || "");
      formData.append("study_method", data.study_method ? parseInt(data.study_method) : "");
      formData.append("days_times_attending", data.days_times_attending || "");
      formData.append("times_per_month", data.times_per_month ? parseInt(data.times_per_month) : "");
      formData.append("semesters_per_year", data.semesters_per_year ? parseInt(data.semesters_per_year) : "");
      formData.append("will_stop_imam_duties", data.will_stop_imam_duties ? parseInt(data.will_stop_imam_duties) : "");
      formData.append("acknowledge", data.acknowledge || false);
      formData.append("status_id", 1);
      
      if (data.Course_Brochure && data.Course_Brochure.length > 0) {
        formData.append("Course_Brochure", data.Course_Brochure[0]);
      }
      if (data.Quotation && data.Quotation.length > 0) {
        formData.append("Quotation", data.Quotation[0]);
      }
      if (data.Motivation_Letter && data.Motivation_Letter.length > 0) {
        formData.append("Motivation_Letter", data.Motivation_Letter[0]);
      }

      formData.append("created_by", getAuditName());
      await axiosApi.post(`${API_BASE_URL}/higherEducationRequest`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showAlert("Higher education request created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create higher education request", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Higher Education Request
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Course Type</Label>
                  <Controller 
                    name="course_type" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Course Type</option>
                        {lookupData.courseTypes.map((item) => (
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
                  <Label>Course Name</Label>
                  <Controller 
                    name="course_name" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter course name" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Institute Name</Label>
                  <Controller 
                    name="institute_name" 
                    control={control} 
                    render={({ field }) => <Input type="text" {...field} placeholder="Enter institute name" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Duration</Label>
                  <Controller 
                    name="duration" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Duration</option>
                        {lookupData.durations.map((item) => (
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
                  <Label>Start Date</Label>
                  <Controller 
                    name="start_date" 
                    control={control} 
                    render={({ field }) => <Input type="date" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>End Date</Label>
                  <Controller 
                    name="end_date" 
                    control={control} 
                    render={({ field }) => <Input type="date" {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>What is the cost of your annual fees in your local currency?</Label>
                  <Controller 
                    name="cost_local_currency" 
                    control={control} 
                    render={({ field }) => <Input type="number" step="0.01" {...field} placeholder="e.g. 15000" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Cost (South African Rand)</Label>
                  <Controller 
                    name="cost_south_african_rand" 
                    control={control} 
                    render={({ field }) => <Input type="number" step="0.01" {...field} placeholder="0.00" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Study Method</Label>
                  <Controller 
                    name="study_method" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select Study Method</option>
                        {lookupData.studyMethods.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>What are the days and times you will be attending lessons? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="days_times_attending" 
                    control={control} 
                    rules={{ required: "Days and times are required" }}
                    render={({ field }) => (
                      <Input 
                        type="textarea" 
                        rows={3} 
                        {...field} 
                        placeholder="e.g. Every Saturday 09:00am - 12:00pm; Mondays and Thursdays 12:00pm - 4:00pm" 
                      />
                    )} 
                  />
                  <small className="text-muted d-block mt-1">Example: Every Saturday 09:00am - 12:00pm; Mondays and Thursdays 12:00pm - 4:00pm</small>
                  {errors.days_times_attending && <FormFeedback>{errors.days_times_attending.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>How many times a week</Label>
                  <Controller 
                    name="times_per_month" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        <option value="1">1 time per week</option>
                        <option value="2">2 times per week</option>
                        <option value="3">3 times per week</option>
                        <option value="4">4 times per week</option>
                        <option value="5">5 times per week</option>
                      </Input>
                    )} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>How many semesters per year</Label>
                  <Controller 
                    name="semesters_per_year" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" {...field}>
                        <option value="">Select</option>
                        <option value="1">1 Semester</option>
                        <option value="2">2 Semesters</option>
                        <option value="3">3 Semesters</option>
                        <option value="4">4 Semesters</option>
                      </Input>
                    )} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Will these studies stop you from doing your Imam duties?</Label>
                  <Controller 
                    name="will_stop_imam_duties" 
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
              <Col md={12}>
                <FormGroup>
                  <Label>Course Brochure</Label>
                  <Controller 
                    name="Course_Brochure" 
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
                  <Label>Quotation</Label>
                  <Controller 
                    name="Quotation" 
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
                  <Label>Motivation Letter</Label>
                  <Controller 
                    name="Motivation_Letter" 
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
                <FormGroup check>
                  <Controller
                    name="acknowledge"
                    control={control}
                    rules={{ required: "You must acknowledge the statement to proceed" }}
                    render={({ field }) => (
                      <>
                        <Input
                          type="checkbox"
                          id="acknowledgment-higher-education"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledge}
                        />
                        <Label check htmlFor="acknowledgment-higher-education">
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

export default HigherEducationRequestModal;


