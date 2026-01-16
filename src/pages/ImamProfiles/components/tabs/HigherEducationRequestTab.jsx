import React, { useState, useEffect, useMemo } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import TableContainer from "../../../../components/Common/TableContainer";
import DeleteConfirmationModal from "../../../../components/Common/DeleteConfirmationModal";
import useDeleteConfirmation from "../../../../hooks/useDeleteConfirmation";
import { useRole } from "../../../../helpers/useRole";
import axiosApi from "../../../../helpers/api_helper";
import { API_BASE_URL, API_STREAM_BASE_URL } from "../../../../helpers/url_helper";
import { getAuditName } from "../../../../helpers/userStorage";

const HigherEducationRequestTab = ({ imamProfileId, higherEducationRequest, lookupData, onUpdate, showAlert }) => {
  if (!imamProfileId) return null;
  const { isOrgExecutive, isAppAdmin, isGlobalAdmin } = useRole();
  const isAdmin = isAppAdmin || isGlobalAdmin;
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { deleteModalOpen, deleteItem, deleteLoading, showDeleteConfirmation, hideDeleteConfirmation, confirmDelete } = useDeleteConfirmation();
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  useEffect(() => {
    if (modalOpen) {
      reset({
        course_type: editItem?.course_type ? String(editItem.course_type) : "",
        course_name: editItem?.course_name || "",
        cost_local_currency: editItem?.cost_local_currency || "",
        cost_south_african_rand: editItem?.cost_south_african_rand || "",
        institute_name: editItem?.institute_name || "",
        duration: editItem?.duration ? String(editItem.duration) : "",
        start_date: formatDateForInput(editItem?.start_date),
        end_date: formatDateForInput(editItem?.end_date),
        study_method: editItem?.study_method ? String(editItem.study_method) : "",
        days_times_attending: editItem?.days_times_attending || "",
        times_per_month: editItem?.times_per_month ? String(editItem.times_per_month) : "",
        semesters_per_year: editItem?.semesters_per_year ? String(editItem.semesters_per_year) : "",
        will_stop_imam_duties: editItem?.will_stop_imam_duties ? String(editItem.will_stop_imam_duties) : "",
        acknowledge: editItem?.acknowledge || false,
        status_id: editItem?.status_id ? String(editItem.status_id) : "1",
        Course_Brochure: null,
        Quotation: null,
        Motivation_Letter: null,
      });
    }
  }, [editItem, modalOpen, reset]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (modalOpen) setEditItem(null);
  };

  const handleAdd = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setModalOpen(true);
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
      formData.append("status_id", parseInt(data.status_id));
      
      if (data.Course_Brochure && data.Course_Brochure.length > 0) {
        formData.append("Course_Brochure", data.Course_Brochure[0]);
      }
      if (data.Quotation && data.Quotation.length > 0) {
        formData.append("Quotation", data.Quotation[0]);
      }
      if (data.Motivation_Letter && data.Motivation_Letter.length > 0) {
        formData.append("Motivation_Letter", data.Motivation_Letter[0]);
      }

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/higherEducationRequest/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Higher education request updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/higherEducationRequest`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Higher education request created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save higher education request", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: `Higher Education Request - ${editItem.course_name || "N/A"}`, 
      type: "higher education request", 
      message: "This higher education request will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/higherEducationRequest/${editItem.id}`);
      showAlert("Higher education request deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/higherEducationRequest/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Higher education request approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve higher education request", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/higherEducationRequest/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Higher education request declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline higher education request", "danger");
    }
  };

  const getLookupValue = (lookupArray, id) => {
    if (!id || !lookupArray) return "-";
    const item = lookupArray.find(x => Number(x.id) === Number(id));
    return item ? item.name : "-";
  };

  const columns = useMemo(
    () => [
      {
        header: "Course Name",
        accessorKey: "course_name",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => (
          <span
            style={{ cursor: "pointer", color: "inherit" }}
            onClick={() => handleEdit(cell.row.original)}
            onMouseOver={(e) => {
              e.currentTarget.classList.add('text-primary', 'text-decoration-underline');
            }}
            onMouseOut={(e) => {
              e.currentTarget.classList.remove('text-primary', 'text-decoration-underline');
            }}
          >
            {cell.getValue() || "-"}
          </span>
        ),
      },
      {
        header: "Institute",
        accessorKey: "institute_name",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Cost (ZAR)",
        accessorKey: "cost_south_african_rand",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return value ? `R ${parseFloat(value).toFixed(2)}` : "-";
        },
      },
      {
        header: "Documents",
        accessorKey: "documents",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasBrochure = row.course_brochure && (row.course_brochure === "exists" || row.course_brochure_filename);
          const hasQuotation = row.quotation && (row.quotation === "exists" || row.quotation_filename);
          const hasLetter = row.motivation_letter && (row.motivation_letter === "exists" || row.motivation_letter_filename);
          
          if (!hasBrochure && !hasQuotation && !hasLetter) return "-";
          
          return (
            <div className="d-flex gap-2 justify-content-center">
              {hasBrochure && (
                <a
                  href={`${API_STREAM_BASE_URL}/higherEducationRequest/${row.id}/view-course-brochure`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Course Brochure"
                >
                  <i className="bx bx-file text-primary" style={{ cursor: "pointer", fontSize: "16px" }}></i>
                </a>
              )}
              {hasQuotation && (
                <a
                  href={`${API_STREAM_BASE_URL}/higherEducationRequest/${row.id}/view-quotation`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Quotation"
                >
                  <i className="bx bx-file text-success" style={{ cursor: "pointer", fontSize: "16px" }}></i>
                </a>
              )}
              {hasLetter && (
                <a
                  href={`${API_STREAM_BASE_URL}/higherEducationRequest/${row.id}/view-motivation-letter`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Motivation Letter"
                >
                  <i className="bx bx-file text-info" style={{ cursor: "pointer", fontSize: "16px" }}></i>
                </a>
              )}
            </div>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status_id",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const status = getLookupValue(lookupData?.status, cell.getValue());
          const statusId = Number(cell.getValue());
          let badgeClass = "badge bg-warning text-dark";
          if (statusId === 2) badgeClass = "badge bg-success";
          else if (statusId === 3) badgeClass = "badge bg-danger";
          return <span className={badgeClass}>{status}</span>;
        },
      },
      ...(isAdmin ? [{
        header: "Action",
        accessorKey: "action",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const statusId = Number(cell.row.original.status_id);
          if (statusId === 1) {
            return (
              <div className="d-flex gap-1">
                <Button
                  color="success"
                  size="sm"
                  onClick={() => handleApprove(cell.row.original)}
                  className="btn-sm"
                >
                  <i className="bx bx-check me-1"></i> Approve
                </Button>
                <Button
                  color="danger"
                  size="sm"
                  onClick={() => handleDecline(cell.row.original)}
                  className="btn-sm"
                >
                  <i className="bx bx-x me-1"></i> Decline
                </Button>
              </div>
            );
          }
          return "-";
        },
      }] : []),
      {
        header: "Created By",
        accessorKey: "created_by",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Created On",
        accessorKey: "created_at",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const v = cell.getValue();
          return v ? new Date(v).toLocaleDateString() : "-";
        },
      },
    ],
    [lookupData, isAdmin, handleEdit]
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Higher Education Request</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Higher Education Request
          </Button>
        )}
      </div>

      {(!higherEducationRequest || higherEducationRequest.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No higher education request records found. Click "Add Higher Education Request" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={higherEducationRequest}
          isGlobalFilter={false}
          isPagination={true}
          isCustomPageSize={true}
          pagination="pagination"
          paginationWrapper="dataTables_paginate paging_simple_numbers"
          tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
        />
      )}

      <Modal isOpen={modalOpen} toggle={toggleModal} centered size="xl" backdrop="static">
        <ModalHeader toggle={toggleModal}>
          <i className={`bx ${editItem ? "bx-edit" : "bx-plus-circle"} me-2`}></i>
          {editItem ? "Edit" : "Add"} Higher Education Request
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
                      <Input {...field} type="select">
                        <option value="">Select Course Type</option>
                        {(lookupData?.courseType || []).map((item) => (
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
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="e.g. Diploma in Higher Education" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Cost (Local Currency)</Label>
                  <Controller
                    name="cost_local_currency"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="number" step="0.01" placeholder="0.00" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Cost (South African Rand)</Label>
                  <Controller
                    name="cost_south_african_rand"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="number" step="0.01" placeholder="0.00" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Institute Name</Label>
                  <Controller
                    name="institute_name"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter institute name" />
                    )}
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
                      <Input {...field} type="select">
                        <option value="">Select Duration</option>
                        {(lookupData?.duration || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Start Date</Label>
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="date" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>End Date</Label>
                  <Controller
                    name="end_date"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="date" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Study Method</Label>
                  <Controller
                    name="study_method"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="select">
                        <option value="">Select Study Method</option>
                        {(lookupData?.studyMethod || []).map((item) => (
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
                  <Label>Will Stop Imam Duties</Label>
                  <Controller
                    name="will_stop_imam_duties"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="select">
                        <option value="">Select</option>
                        {(lookupData?.yesNo || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label>Days and Times Attending <span className="text-danger">*</span></Label>
              <Controller
                name="days_times_attending"
                control={control}
                rules={{ required: "Days and times are required" }}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="2" placeholder="e.g. Every Saturday 09:00am - 12:00pm" invalid={!!errors.days_times_attending} />
                )}
              />
              {errors.days_times_attending && <FormFeedback>{errors.days_times_attending.message}</FormFeedback>}
            </FormGroup>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Times Per Month</Label>
                  <Controller
                    name="times_per_month"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="select">
                        <option value="">Select</option>
                        {(lookupData?.timesPerMonth || []).map((item) => (
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
                  <Label>Semesters Per Year</Label>
                  <Controller
                    name="semesters_per_year"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="select">
                        <option value="">Select</option>
                        {(lookupData?.semestersPerYear || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>Course Brochure</Label>
                  <Controller
                    name="Course_Brochure"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        {...field}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          onChange(e.target.files);
                        }}
                      />
                    )}
                  />
                  {editItem && (editItem.course_brochure === "exists" || editItem.course_brochure_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-primary me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.course_brochure_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.course_brochure_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/higherEducationRequest/${editItem.id}/view-course-brochure`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View"
                        >
                          <i 
                            className="bx bx-show text-success" 
                            style={{ cursor: "pointer", fontSize: "16px" }}
                          ></i>
                        </a>
                      </div>
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Quotation</Label>
                  <Controller
                    name="Quotation"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        {...field}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          onChange(e.target.files);
                        }}
                      />
                    )}
                  />
                  {editItem && (editItem.quotation === "exists" || editItem.quotation_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-success me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.quotation_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.quotation_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/higherEducationRequest/${editItem.id}/view-quotation`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View"
                        >
                          <i 
                            className="bx bx-show text-success" 
                            style={{ cursor: "pointer", fontSize: "16px" }}
                          ></i>
                        </a>
                      </div>
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Motivation Letter</Label>
                  <Controller
                    name="Motivation_Letter"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        {...field}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          onChange(e.target.files);
                        }}
                      />
                    )}
                  />
                  {editItem && (editItem.motivation_letter === "exists" || editItem.motivation_letter_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-info me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.motivation_letter_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.motivation_letter_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/higherEducationRequest/${editItem.id}/view-motivation-letter`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View"
                        >
                          <i 
                            className="bx bx-show text-success" 
                            style={{ cursor: "pointer", fontSize: "16px" }}
                          ></i>
                        </a>
                      </div>
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Status</Label>
                  <Controller
                    name="status_id"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="select">
                        {(lookupData?.status || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup check>
              <Controller
                name="acknowledge"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="checkbox" checked={field.value} />
                )}
              />
              <Label check>Acknowledge</Label>
            </FormGroup>
          </ModalBody>
          <ModalFooter className="d-flex justify-content-between">
            <div>
              {editItem && !isOrgExecutive && (
                <Button color="danger" onClick={handleDelete} type="button" disabled={isSubmitting}>
                  <i className="bx bx-trash me-1"></i> Delete
                </Button>
              )}
            </div>
            <div>
              <Button color="light" onClick={toggleModal} disabled={isSubmitting} className="me-2">
                <i className="bx bx-x me-1"></i> Cancel
              </Button>
              {!isOrgExecutive && (
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
              )}
            </div>
          </ModalFooter>
        </Form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        toggle={hideDeleteConfirmation}
        onConfirm={confirmDelete}
        item={deleteItem}
        loading={deleteLoading}
      />
    </>
  );
};

export default HigherEducationRequestTab;

