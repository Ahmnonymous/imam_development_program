import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";
import { useRole } from "../../../helpers/useRole";

const TicketsModal = ({ isOpen, toggle }) => {
  const { isAppAdmin, isGlobalAdmin, isCaseworker } = useRole();
  const isAdminOrCaseworker = isAppAdmin || isGlobalAdmin || isCaseworker;
  const [alert, setAlert] = useState(null);
  const [lookupData, setLookupData] = useState({
    classifications: [],
    statuses: [],
    users: [],
  });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const [classificationsRes, statusesRes, usersRes] = await Promise.all([
          axiosApi.get(`${API_BASE_URL}/lookup/Classification_Lookup`).catch(() => ({ data: [] })),
          axiosApi.get(`${API_BASE_URL}/lookup/Status`).catch(() => ({ data: [] })),
          axiosApi.get(`${API_BASE_URL}/users`).catch(() => ({ data: [] })),
        ]);
        
        // Filter statuses to only Open, Inprogress, Completed
        const allStatuses = statusesRes.data || [];
        const filteredStatuses = allStatuses.filter(status => {
          const statusName = (status.name || "").toLowerCase();
          return statusName === "open" || statusName === "inprogress" || statusName === "completed" ||
                 statusName === "in progress" || statusName === "closed";
        });
        
        setLookupData({
          classifications: classificationsRes.data || [],
          statuses: filteredStatuses.length > 0 ? filteredStatuses : allStatuses,
          users: usersRes.data || [],
        });
      } catch (error) {
        console.error("Error fetching lookup data:", error);
      }
    };
    if (isOpen) {
      fetchLookupData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Find Open status ID (default status)
      const openStatus = lookupData.statuses.find(s => 
        (s.name || "").toLowerCase() === "open"
      );
      const defaultStatusId = openStatus?.id || lookupData.statuses[0]?.id || "1";
      
      reset({
        classification: "",
        description: "",
        status_id: String(defaultStatusId),
        allocated_to: "",
        created_time: new Date().toISOString().slice(0, 16), // Current timestamp
        closed_time: "",
        closing_notes: "",
        Media: null,
      });
    }
  }, [isOpen, reset, lookupData.statuses]);

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Only include admin/caseworker fields if user has permission
      if (isAdminOrCaseworker) {
        formData.append("classification", data.classification ? parseInt(data.classification) : "");
        formData.append("status_id", data.status_id ? parseInt(data.status_id) : 1);
        formData.append("allocated_to", data.allocated_to ? parseInt(data.allocated_to) : "");
        formData.append("closing_notes", data.closing_notes || "");
      } else {
        // For non-admin users, set default status to Open
        const openStatus = lookupData.statuses.find(s => 
          (s.name || "").toLowerCase() === "open"
        );
        formData.append("status_id", openStatus?.id || 1);
      }
      
      formData.append("description", data.description || "");
      formData.append("created_time", data.created_time || new Date().toISOString());
      formData.append("closed_time", data.closed_time || "");
      
      if (data.Media && data.Media.length > 0) {
        formData.append("Media", data.Media[0]);
      }

      formData.append("created_by", getAuditName());
      await axiosApi.post(`${API_BASE_URL}/tickets`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showAlert("Ticket created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create ticket", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add Ticket
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              {/* Admin/Caseworker only fields */}
              {isAdminOrCaseworker && (
                <>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Classification</Label>
                      <Controller 
                        name="classification" 
                        control={control} 
                        render={({ field }) => (
                          <Input type="select" {...field}>
                            <option value="">Select Classification</option>
                            {lookupData.classifications.map((item) => (
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
                      <Label>Status</Label>
                      <Controller 
                        name="status_id" 
                        control={control} 
                        render={({ field }) => (
                          <Input type="select" {...field}>
                            {lookupData.statuses.map((item) => (
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
                      <Label>Allocated To</Label>
                      <Controller 
                        name="allocated_to" 
                        control={control} 
                        render={({ field }) => (
                          <Input type="select" {...field}>
                            <option value="">Select User</option>
                            {lookupData.users.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.username || item.name}
                              </option>
                            ))}
                          </Input>
                        )} 
                      />
                    </FormGroup>
                  </Col>
                </>
              )}
              
              {/* Created Time - Read-only timestamp */}
              {isAdminOrCaseworker && (
                <Col md={6}>
                  <FormGroup>
                    <Label>Created Time</Label>
                    <Controller 
                      name="created_time" 
                      control={control} 
                      render={({ field }) => (
                        <Input 
                          type="datetime-local" 
                          readOnly
                          {...field} 
                          style={{ cursor: "not-allowed" }}
                          className="bg-body-secondary"
                        />
                      )} 
                    />
                    <small className="text-muted">This field is automatically set and cannot be edited.</small>
                  </FormGroup>
                </Col>
              )}
              
              {/* Closed Time - Admin only */}
              {isAdminOrCaseworker && (
                <Col md={6}>
                  <FormGroup>
                    <Label>Closed Time</Label>
                    <Controller 
                      name="closed_time" 
                      control={control} 
                      render={({ field }) => <Input type="datetime-local" {...field} />} 
                    />
                  </FormGroup>
                </Col>
              )}
              
              {/* Media - Always visible */}
              <Col md={6}>
                <FormGroup>
                  <Label>Media</Label>
                  <Controller 
                    name="Media" 
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
              
              {/* Description - Always visible */}
              <Col md={12}>
                <FormGroup>
                  <Label>Description <span className="text-danger">*</span></Label>
                  <Controller 
                    name="description" 
                    control={control} 
                    rules={{ required: "Description is required" }}
                    render={({ field }) => (
                      <Input 
                        type="textarea" 
                        rows={4} 
                        invalid={!!errors.description}
                        {...field} 
                        placeholder="Enter description" 
                      />
                    )} 
                  />
                  {errors.description && <FormFeedback>{errors.description.message}</FormFeedback>}
                </FormGroup>
              </Col>
              
              {/* Closing Notes - Admin/Caseworker only */}
              {isAdminOrCaseworker && (
                <Col md={12}>
                  <FormGroup>
                    <Label>Closing Notes</Label>
                    <Controller 
                      name="closing_notes" 
                      control={control} 
                      render={({ field }) => <Input type="textarea" rows={2} {...field} placeholder="Enter closing notes" />} 
                    />
                  </FormGroup>
                </Col>
              )}
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

export default TicketsModal;


