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

const BoreholeRepairsMatrixTab = ({ boreholeId, boreholeRepairsMatrix, lookupData, onUpdate, showAlert }) => {
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
        component: editItem?.component || "",
        supplier: editItem?.supplier ? String(editItem.supplier) : "",
        warranty: editItem?.warranty || "",
        cost: editItem?.cost || "",
        notes_comments: editItem?.notes_comments || "",
        datestamp: formatDateForInput(editItem?.datestamp),
        Task: null,
        Invoice: null,
        Parts_Image: null,
        acknowledgment: editItem ? true : false,
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
      
      if (!editItem) {
        // Only send borehole_id when creating, not when updating
        formData.append("borehole_id", boreholeId);
      }
      
      formData.append("component", data.component || "");
      formData.append("supplier", data.supplier ? parseInt(data.supplier) : "");
      formData.append("warranty", data.warranty || "");
      formData.append("cost", data.cost ? parseFloat(data.cost) : "");
      formData.append("notes_comments", data.notes_comments || "");
      formData.append("datestamp", data.datestamp || "");
      
      if (data.Task && data.Task.length > 0) {
        formData.append("Task", data.Task[0]);
      }
      if (data.Invoice && data.Invoice.length > 0) {
        formData.append("Invoice", data.Invoice[0]);
      }
      if (data.Parts_Image && data.Parts_Image.length > 0) {
        formData.append("Parts_Image", data.Parts_Image[0]);
      }

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/boreholeRepairsMatrix/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Borehole repairs matrix updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/boreholeRepairsMatrix`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Borehole repairs matrix created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save borehole repairs matrix", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: `Borehole Repairs - ${editItem.component || "N/A"}`, 
      type: "borehole repairs matrix", 
      message: "This borehole repairs matrix will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/boreholeRepairsMatrix/${editItem.id}`);
      showAlert("Borehole repairs matrix deleted successfully", "success");
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
        header: "Component",
        accessorKey: "component",
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
        header: "Supplier",
        accessorKey: "supplier",
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
        header: "Task",
        accessorKey: "task",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasTask = row.task && (row.task === "exists" || row.task_filename);
          
          if (!hasTask) return "-";
          
          return (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/boreholeRepairsMatrix/${row.id}/view-task`}
                target="_blank"
                rel="noopener noreferrer"
                title="View Task"
              >
                <i className="bx bx-file text-primary" style={{ cursor: "pointer", fontSize: "16px" }}></i>
              </a>
            </div>
          );
        },
      },
      {
        header: "Invoice",
        accessorKey: "invoice",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasInvoice = row.invoice && (row.invoice === "exists" || row.invoice_filename);
          
          if (!hasInvoice) return "-";
          
          return (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/boreholeRepairsMatrix/${row.id}/view-invoice`}
                target="_blank"
                rel="noopener noreferrer"
                title="View Invoice"
              >
                <i className="bx bx-file text-success" style={{ cursor: "pointer", fontSize: "16px" }}></i>
              </a>
            </div>
          );
        },
      },
      {
        header: "Parts Image",
        accessorKey: "parts_image",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasPartsImage = row.parts_image && (row.parts_image === "exists" || row.parts_image_filename);
          
          if (!hasPartsImage) return "-";
          
          return (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/boreholeRepairsMatrix/${row.id}/view-parts-image`}
                target="_blank"
                rel="noopener noreferrer"
                title="View Parts Image"
              >
                <i className="bx bx-image text-info" style={{ cursor: "pointer", fontSize: "16px" }}></i>
              </a>
            </div>
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
      {
        header: "Updated By",
        accessorKey: "updated_by",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Updated On",
        accessorKey: "updated_at",
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
        <h5 className="mb-0">Borehole Repairs Matrix</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Repair Record
          </Button>
        )}
      </div>

      {(!boreholeRepairsMatrix || boreholeRepairsMatrix.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No borehole repairs matrix records found. Click "Add Repair Record" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={boreholeRepairsMatrix}
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
          {editItem ? "Edit" : "Add"} Borehole Repairs Matrix
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Component</Label>
                  <Controller
                    name="component"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter component name" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Supplier</Label>
                  <Controller
                    name="supplier"
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
                  <Label>Datestamp</Label>
                  <Controller
                    name="datestamp"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="date" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>Task</Label>
                  <Controller
                    name="Task"
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
                  {editItem && (editItem.task === "exists" || editItem.task_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-primary me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.task_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.task_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/boreholeRepairsMatrix/${editItem.id}/view-task`}
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
                        <i className="bx bx-file font-size-24 text-success me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.invoice_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.invoice_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/boreholeRepairsMatrix/${editItem.id}/view-invoice`}
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
                  <Label>Parts Image</Label>
                  <Controller
                    name="Parts_Image"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        {...field}
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => {
                          onChange(e.target.files);
                        }}
                      />
                    )}
                  />
                  {editItem && (editItem.parts_image === "exists" || editItem.parts_image_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-image font-size-24 text-info me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.parts_image_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.parts_image_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/boreholeRepairsMatrix/${editItem.id}/view-parts-image`}
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
            <FormGroup>
              <Label>Notes/Comments</Label>
              <Controller
                name="notes_comments"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="3" placeholder="Enter notes or comments" />
                )}
              />
            </FormGroup>
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
                          id="acknowledgment-repairs"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledgment}
                        />
                        <Label check htmlFor="acknowledgment-repairs">
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

export default BoreholeRepairsMatrixTab;

