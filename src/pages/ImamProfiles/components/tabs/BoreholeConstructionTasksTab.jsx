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

const BoreholeConstructionTasksTab = ({ boreholeId, boreholeConstructionTasks, lookupData, onUpdate, showAlert }) => {
  if (!boreholeId) return null;
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
        task: editItem?.task ? String(editItem.task) : "",
        appointed_supplier: editItem?.appointed_supplier ? String(editItem.appointed_supplier) : "",
        appointed_date: formatDateForInput(editItem?.appointed_date),
        estimated_completion_date: formatDateForInput(editItem?.estimated_completion_date),
        warranty: editItem?.warranty || "",
        cost: editItem?.cost || "",
        rating: editItem?.rating || "",
        status_id: editItem?.status_id ? String(editItem.status_id) : "",
        comments: editItem?.comments || "",
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
      const formData = new FormData();
      formData.append("borehole_id", boreholeId);
      formData.append("task", data.task ? parseInt(data.task) : "");
      formData.append("appointed_supplier", data.appointed_supplier ? parseInt(data.appointed_supplier) : "");
      formData.append("appointed_date", data.appointed_date || "");
      formData.append("estimated_completion_date", data.estimated_completion_date || "");
      formData.append("warranty", data.warranty || "");
      formData.append("cost", data.cost ? parseFloat(data.cost) : "");
      formData.append("rating", data.rating ? parseInt(data.rating) : "");
      formData.append("status_id", data.status_id ? parseInt(data.status_id) : "");
      formData.append("comments", data.comments || "");
      
      if (data.Invoice && data.Invoice.length > 0) {
        formData.append("Invoice", data.Invoice[0]);
      }

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/boreholeConstructionTasks/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Borehole construction task updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/boreholeConstructionTasks`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Borehole construction task created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save borehole construction task", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: `Borehole Construction Task - ${editItem.task || "N/A"}`, 
      type: "borehole construction task", 
      message: "This borehole construction task will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/boreholeConstructionTasks/${editItem.id}`);
      showAlert("Borehole construction task deleted successfully", "success");
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

  const columns = useMemo(
    () => [
      {
        header: "Task",
        accessorKey: "task",
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
            {getLookupValue(lookupData?.boreholeConstructionTasks, cell.getValue())}
          </span>
        ),
      },
      {
        header: "Supplier",
        accessorKey: "appointed_supplier",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => getLookupValue(lookupData?.supplier, cell.getValue()),
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
        header: "Status",
        accessorKey: "status_id",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const status = getLookupValue(lookupData?.tasksStatus, cell.getValue());
          return <span className="badge bg-info">{status}</span>;
        },
      },
      {
        header: "Invoice",
        accessorKey: "invoice",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const invoice = cell.getValue();
          const rowId = cell.row.original.id;
          return invoice && (invoice === "exists" || cell.row.original.invoice_filename) ? (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/boreholeConstructionTasks/${rowId}/view-invoice`}
                target="_blank"
                rel="noopener noreferrer"
                title="View Invoice"
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
    [lookupData, handleEdit]
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Borehole Construction Tasks</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Task
          </Button>
        )}
      </div>

      {(!boreholeConstructionTasks || boreholeConstructionTasks.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No borehole construction tasks found. Click "Add Task" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={boreholeConstructionTasks}
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
          {editItem ? "Edit Borehole Construction Task" : "Add Borehole Construction Task"}
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Task <span className="text-danger">*</span></Label>
                  <Controller
                    name="task"
                    control={control}
                    rules={{ required: "Task is required" }}
                    render={({ field }) => (
                      <Input {...field} type="select" invalid={!!errors.task}>
                        <option value="">Select Task</option>
                        {(lookupData?.boreholeConstructionTasks || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                  {errors.task && <FormFeedback>{errors.task.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Appointed Supplier</Label>
                  <Controller
                    name="appointed_supplier"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="select">
                        <option value="">Select Supplier</option>
                        {(lookupData?.supplier || []).map((item) => (
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
                  <Label>Appointed Date</Label>
                  <Controller
                    name="appointed_date"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="date" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Estimated Completion Date</Label>
                  <Controller
                    name="estimated_completion_date"
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
                  <Label>Warranty</Label>
                  <Controller
                    name="warranty"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter warranty details" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Cost</Label>
                  <Controller
                    name="cost"
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
                  <Label>Rating (1-5)</Label>
                  <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="number" min="1" max="5" placeholder="1-5" />
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
                        <option value="">Select Status</option>
                        {(lookupData?.tasksStatus || []).map((item) => (
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
              <Label>Invoice</Label>
              <Controller
                name="Invoice"
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
              {editItem && (editItem.invoice === "exists" || editItem.invoice_filename) && (
                <div className="mt-2 p-2 border rounded bg-light">
                  <div className="d-flex align-items-center">
                    <i className="bx bx-file font-size-24 text-primary me-2"></i>
                    <div className="flex-grow-1">
                      <div className="fw-medium">{editItem.invoice_filename || "file"}</div>
                      <small className="text-muted">
                        {formatFileSize(editItem.invoice_size)} • Current file
                      </small>
                    </div>
                    <a
                      href={`${API_STREAM_BASE_URL}/boreholeConstructionTasks/${editItem.id}/view-invoice`}
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
            <FormGroup>
              <Label>Comments</Label>
              <Controller
                name="comments"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="3" placeholder="Enter comments" />
                )}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            {editItem && (
              <Button color="danger" onClick={handleDelete} disabled={isSubmitting}>
                <i className="bx bx-trash me-1"></i> Delete
              </Button>
            )}
            <Button color="secondary" onClick={toggleModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editItem ? "Update" : "Create"}
            </Button>
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

export default BoreholeConstructionTasksTab;

