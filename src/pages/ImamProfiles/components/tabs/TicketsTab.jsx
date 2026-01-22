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

const TicketsTab = ({ tickets, lookupData, onUpdate, showAlert }) => {
  const { isOrgExecutive, isAppAdmin, isGlobalAdmin, isCaseworker } = useRole();
  const isAdmin = isAppAdmin || isGlobalAdmin;
  const isAdminOrCaseworker = isAppAdmin || isGlobalAdmin || isCaseworker;
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
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
      // Find Open status ID (default status)
      const openStatus = lookupData?.status?.find(s => 
        (s.name || "").toLowerCase() === "open"
      );
      const defaultStatusId = editItem?.status_id 
        ? String(editItem.status_id) 
        : (openStatus?.id ? String(openStatus.id) : "1");
      
      reset({
        classification: editItem?.classification ? String(editItem.classification) : "",
        description: editItem?.description || "",
        status_id: defaultStatusId,
        allocated_to: editItem?.allocated_to ? String(editItem.allocated_to) : "",
        created_time: editItem?.created_time ? new Date(editItem.created_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        closed_time: formatDateForInput(editItem?.closed_time),
        closing_notes: editItem?.closing_notes || "",
        Media: null,
        acknowledgment: editItem ? true : false,
      });
    }
  }, [editItem, modalOpen, reset, lookupData?.status]);

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
      
      // Only include admin/caseworker fields if user has permission
      if (isAdminOrCaseworker) {
        formData.append("classification", data.classification ? parseInt(data.classification) : "");
        formData.append("status_id", data.status_id ? parseInt(data.status_id) : 1);
        formData.append("allocated_to", data.allocated_to ? parseInt(data.allocated_to) : "");
        formData.append("closing_notes", data.closing_notes || "");
      } else {
        // For non-admin users, set default status to Open
        const openStatus = lookupData?.status?.find(s => 
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

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/tickets/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Ticket updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/tickets`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Ticket created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save ticket", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: `Ticket - ${editItem.description?.substring(0, 50) || "N/A"}`, 
      type: "ticket", 
      message: "This ticket will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/tickets/${editItem.id}`);
      showAlert("Ticket deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const getLookupValue = (lookupArray, id) => {
    if (!id || !lookupArray) return "-";
    const item = lookupArray.find(x => Number(x.id) === Number(id));
    return item ? item.name : "-";
  };

  const getStatusBadge = (status) => {
    if (status === "Open") return "badge bg-warning text-dark";
    if (status === "In Progress") return "badge bg-info";
    if (status === "Closed") return "badge bg-success";
    return "badge bg-secondary";
  };

  const columns = useMemo(
    () => [
      {
        header: "Description",
        accessorKey: "description",
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
            {cell.getValue()?.substring(0, 50) || "-"}
            {cell.getValue()?.length > 50 ? "..." : ""}
          </span>
        ),
      },
      {
        header: "Classification",
        accessorKey: "classification",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => getLookupValue(lookupData?.classification, cell.getValue()),
      },
      {
        header: "Status",
        accessorKey: "status",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const status = cell.getValue();
          return <span className={getStatusBadge(status)}>{status || "Open"}</span>;
        },
      },
      {
        header: "Allocated To",
        accessorKey: "allocated_to",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const employee = lookupData?.employees?.find(e => Number(e.id) === Number(cell.getValue()));
          return employee ? `${employee.name} ${employee.surname}` : "-";
        },
      },
      {
        header: "Media",
        accessorKey: "media",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const media = cell.getValue();
          const rowId = cell.row.original.id;
          return media && (media === "exists" || cell.row.original.media_filename) ? (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/tickets/${rowId}/view-media`}
                target="_blank"
                rel="noopener noreferrer"
                title="View Media"
              >
                <i
                  className="bx bx-show text-success"
                  style={{ cursor: "pointer", fontSize: "16px" }}
                ></i>
              </a>
            </div>
          ) : (
            <span className="d-block text-center">-</span>
          );
        },
      },
      {
        header: "Created Time",
        accessorKey: "created_time",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const v = cell.getValue();
          return v ? new Date(v).toLocaleDateString() : "-";
        },
      },
      {
        header: "Created By",
        accessorKey: "created_by",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
    ],
    [lookupData, handleEdit]
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Tickets</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Ticket
          </Button>
        )}
      </div>

      {(!tickets || tickets.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No tickets found. Click "Add Ticket" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={tickets}
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
          {editItem ? "Edit" : "Add"} Ticket
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
                          <Input {...field} type="select" disabled={isOrgExecutive}>
                            <option value="">Select Classification</option>
                            {(lookupData?.classification || []).map((item) => (
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
                        render={({ field }) => {
                          // Filter statuses to only Open, Inprogress, Completed
                          const filteredStatuses = (lookupData?.status || []).filter(status => {
                            const statusName = (status.name || "").toLowerCase();
                            return statusName === "open" || statusName === "inprogress" || statusName === "completed" ||
                                   statusName === "in progress" || statusName === "closed";
                          });
                          return (
                            <Input {...field} type="select" disabled={isOrgExecutive}>
                              {filteredStatuses.length > 0 ? filteredStatuses.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              )) : (lookupData?.status || []).map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </Input>
                          );
                        }}
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
                          <Input {...field} type="select" disabled={isOrgExecutive}>
                            <option value="">Select Admin</option>
                            {(lookupData?.employees || []).filter(e => e.user_type === 1).map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} {item.surname}
                              </option>
                            ))}
                          </Input>
                        )}
                      />
                    </FormGroup>
                  </Col>
                  {/* Created Time - Read-only timestamp */}
                  <Col md={6}>
                    <FormGroup>
                      <Label>Created Time</Label>
                      <Controller
                        name="created_time"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            {...field} 
                            type="datetime-local" 
                            readOnly
                            disabled={isOrgExecutive}
                            style={{ cursor: "not-allowed" }}
                            className="bg-body-secondary"
                          />
                        )}
                      />
                      <small className="text-muted">This field is automatically set and cannot be edited.</small>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Closed Time</Label>
                      <Controller
                        name="closed_time"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} type="datetime-local" disabled={isOrgExecutive} />
                        )}
                      />
                    </FormGroup>
                  </Col>
                </>
              )}
              
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
                        {...field} 
                        type="textarea" 
                        rows="4" 
                        invalid={!!errors.description}
                        disabled={isOrgExecutive}
                        placeholder="Enter ticket description" 
                      />
                    )}
                  />
                  {errors.description && <FormFeedback>{errors.description.message}</FormFeedback>}
                </FormGroup>
              </Col>
              
              {/* Media - Always visible */}
              <Col md={12}>
                <FormGroup>
                  <Label>Media Upload</Label>
                  <Controller
                    name="Media"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        {...field}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3"
                        disabled={isOrgExecutive}
                        onChange={(e) => {
                          onChange(e.target.files);
                        }}
                      />
                    )}
                  />
                  {editItem && (editItem.media === "exists" || editItem.media_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-primary me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.media_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.media_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/tickets/${editItem.id}/view-media`}
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
              
              {/* Closing Notes - Admin/Caseworker only */}
              {isAdminOrCaseworker && (
                <Col md={12}>
                  <FormGroup>
                    <Label>Closing Notes</Label>
                    <Controller
                      name="closing_notes"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} type="textarea" rows="3" disabled={isOrgExecutive} placeholder="Enter closing notes" />
                      )}
                    />
                  </FormGroup>
                </Col>
              )}
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
                          id="acknowledgment-tickets"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledgment}
                        />
                        <Label check htmlFor="acknowledgment-tickets">
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

export default TicketsTab;

