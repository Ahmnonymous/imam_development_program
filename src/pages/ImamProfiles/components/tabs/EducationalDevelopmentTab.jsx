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

const EducationalDevelopmentTab = ({ imamProfileId, educationalDevelopment, lookupData, onUpdate, showAlert }) => {
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
        course_name: editItem?.course_name || "",
        institution_name: editItem?.institution_name || "",
        course_type: editItem?.course_type || "",
        start_date: formatDateForInput(editItem?.start_date),
        end_date: formatDateForInput(editItem?.end_date),
        duration_course: editItem?.duration_course || "",
        cost: editItem?.cost || "",
        cost_currency: editItem?.cost_currency || "",
        cost_south_african_rand: editItem?.cost_south_african_rand || "",
        funding_source: editItem?.funding_source || "",
        acknowledge: editItem?.acknowledge || false,
        status_id: editItem?.status_id || "1",
        comment: editItem?.comment || "",
        Brochure: null,
        Invoice: null,
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
      const hasBrochure = data.Brochure && data.Brochure.length > 0;
      const hasInvoice = data.Invoice && data.Invoice.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("course_name", data.course_name);
      formData.append("institution_name", data.institution_name || "");
      formData.append("course_type", data.course_type || "");
      formData.append("start_date", data.start_date || "");
      formData.append("end_date", data.end_date || "");
      formData.append("duration_course", data.duration_course || "");
      formData.append("cost", data.cost ? parseFloat(data.cost) : "");
      formData.append("cost_currency", data.cost_currency ? parseInt(data.cost_currency) : "");
      formData.append("cost_south_african_rand", data.cost_south_african_rand ? parseFloat(data.cost_south_african_rand) : "");
      formData.append("funding_source", data.funding_source || "");
      formData.append("acknowledge", data.acknowledge || false);
      formData.append("status_id", parseInt(data.status_id));
      formData.append("comment", data.comment || "");
      if (hasBrochure) formData.append("Brochure", data.Brochure[0]);
      if (hasInvoice) formData.append("Invoice", data.Invoice[0]);

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/educationalDevelopment/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Educational development updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/educationalDevelopment`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Educational development created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save educational development", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: `Educational Development - ${editItem.course_name || "N/A"}`, 
      type: "educational development", 
      message: "This educational development record will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/educationalDevelopment/${editItem.id}`);
      showAlert("Educational development deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/educationalDevelopment/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Educational development approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve educational development", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/educationalDevelopment/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Educational development declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline educational development", "danger");
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
        header: "Institution",
        accessorKey: "institution_name",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Start Date",
        accessorKey: "start_date",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const v = cell.getValue();
          return v ? new Date(v).toLocaleDateString() : "-";
        },
      },
      {
        header: "End Date",
        accessorKey: "end_date",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const v = cell.getValue();
          return v ? new Date(v).toLocaleDateString() : "-";
        },
      },
      {
        header: "Cost",
        accessorKey: "cost",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return value ? `R ${parseFloat(value).toFixed(2)}` : "-";
        },
      },
      {
        header: "Brochure",
        accessorKey: "brochure",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const val = cell.getValue();
          const rowId = cell.row.original.id;
          const hasFile = val && (val === "exists" || cell.row.original.brochure_filename);
          return hasFile ? (
            <div className="d-flex justify-content-center">
              <a href={`${API_STREAM_BASE_URL}/educationalDevelopment/${rowId}/view-brochure`} target="_blank" rel="noopener noreferrer" title="View Brochure">
                <i className="bx bx-show text-success" style={{ cursor: "pointer", fontSize: "16px" }}></i>
              </a>
            </div>
          ) : (
            <span className="d-block text-center">-</span>
          );
        },
      },
      {
        header: "Invoice",
        accessorKey: "invoice",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const val = cell.getValue();
          const rowId = cell.row.original.id;
          const hasFile = val && (val === "exists" || cell.row.original.invoice_filename);
          return hasFile ? (
            <div className="d-flex justify-content-center">
              <a href={`${API_STREAM_BASE_URL}/educationalDevelopment/${rowId}/view-invoice`} target="_blank" rel="noopener noreferrer" title="View Invoice">
                <i className="bx bx-show text-success" style={{ cursor: "pointer", fontSize: "16px" }}></i>
              </a>
            </div>
          ) : (
            <span className="d-block text-center">-</span>
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
    [lookupData, isAdmin]
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Educational Development</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Educational Development
          </Button>
        )}
      </div>

      {(!educationalDevelopment || educationalDevelopment.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No educational development records found. Click "Add Educational Development" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={educationalDevelopment}
          isGlobalFilter={false}
          isPagination={true}
          isCustomPageSize={true}
          pagination="pagination"
          paginationWrapper="dataTables_paginate paging_simple_numbers"
          tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
        />
      )}

      <Modal isOpen={modalOpen} toggle={toggleModal} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggleModal}>
          <i className={`bx ${editItem ? "bx-edit" : "bx-plus-circle"} me-2`}></i>
          {editItem ? "Edit" : "Add"} Educational Development
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Course Name *</Label>
                  <Controller
                    name="course_name"
                    control={control}
                    rules={{ required: "Course name is required" }}
                    render={({ field }) => (
                      <>
                        <Input {...field} type="text" placeholder="Enter course name" invalid={!!errors.course_name} />
                        <FormFeedback>{errors.course_name?.message}</FormFeedback>
                      </>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Institution Name</Label>
                  <Controller
                    name="institution_name"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter institution name" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Course Type</Label>
                  <Controller
                    name="course_type"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter course type" />
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
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Start Date</Label>
                  <Controller name="start_date" control={control} render={({ field }) => <Input {...field} type="date" />} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>End Date</Label>
                  <Controller name="end_date" control={control} render={({ field }) => <Input {...field} type="date" />} />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Duration of the course?</Label>
                  <Controller
                    name="duration_course"
                    control={control}
                    render={({ field }) => <Input {...field} type="text" placeholder="e.g 2 months, 3 months, or 6 months" />}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>How much are the fees for the course in local currency?</Label>
                  <Controller name="cost" control={control} render={({ field }) => <Input {...field} type="number" step="0.01" placeholder="0.00" />} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Currency</Label>
                  <Controller
                    name="cost_currency"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="select">
                        <option value="">Select Currency</option>
                        {(lookupData?.currency || []).map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </Input>
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>How much are the fees for the course in South African Rand?</Label>
                  <Controller name="cost_south_african_rand" control={control} render={({ field }) => <Input {...field} type="number" step="0.01" placeholder="0.00" />} />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Funding Source</Label>
                  <Controller name="funding_source" control={control} render={({ field }) => <Input {...field} type="text" placeholder="Enter funding source" />} />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Upload a brochure/prospectus/course outline</Label>
                  <Controller
                    name="Brochure"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input {...field} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files)} />
                    )}
                  />
                  {editItem?.brochure_filename && (
                    <small className="text-muted d-block mt-1">Current: {editItem.brochure_filename} ({formatFileSize(editItem.brochure_size)})</small>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Upload authentic invoice</Label>
                  <Controller
                    name="Invoice"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input {...field} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files)} />
                    )}
                  />
                  {editItem?.invoice_filename && (
                    <small className="text-muted d-block mt-1">Current: {editItem.invoice_filename} ({formatFileSize(editItem.invoice_size)})</small>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label>Comment</Label>
              <Controller name="comment" control={control} render={({ field }) => <Input {...field} type="textarea" rows="2" placeholder="Enter comment" />} />
            </FormGroup>
            <Row>
              <Col md={6}>
                <FormGroup check>
                  <Controller
                    name="acknowledge"
                    control={control}
                    rules={{ required: "You must acknowledge the statement to proceed" }}
                    render={({ field }) => (
                      <>
                        <Input
                          type="checkbox"
                          id="acknowledgment-educational"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledge}
                        />
                        <Label check htmlFor="acknowledgment-educational">
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

export default EducationalDevelopmentTab;

