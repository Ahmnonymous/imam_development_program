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

const MedicalReimbursementTab = ({ imamProfileId, medicalReimbursement, lookupData, onUpdate, showAlert }) => {
  if (!imamProfileId) return null;
  const { isOrgExecutive } = useRole();
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
        visit_date: formatDateForInput(editItem?.visit_date),
        illness_description: editItem?.illness_description || "",
        amount: editItem?.amount || "",
        comment: editItem?.comment || "",
        Receipt: null,
        Supporting_Docs: null,
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
      const hasReceipt = data.Receipt && data.Receipt.length > 0;
      const hasSupportingDocs = data.Supporting_Docs && data.Supporting_Docs.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("visit_date", data.visit_date);
      formData.append("illness_description", data.illness_description);
      formData.append("amount", data.amount);
      formData.append("comment", data.comment || "");
      
      if (hasReceipt) {
        formData.append("Receipt", data.Receipt[0]);
      }
      if (hasSupportingDocs) {
        formData.append("Supporting_Docs", data.Supporting_Docs[0]);
      }

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/medicalReimbursement/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Medical reimbursement updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/medicalReimbursement`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Medical reimbursement created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to save medical reimbursement", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: `Medical Reimbursement - ${editItem.amount || "N/A"}`, 
      type: "medical reimbursement", 
      message: "This medical reimbursement will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/medicalReimbursement/${editItem.id}`);
      showAlert("Medical reimbursement deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const columns = useMemo(
    () => [
      {
        header: "Visit Date",
        accessorKey: "visit_date",
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
            {cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : "-"}
          </span>
        ),
      },
      {
        header: "Illness Description",
        accessorKey: "illness_description",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Amount",
        accessorKey: "amount",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return value ? `R ${parseFloat(value).toFixed(2)}` : "-";
        },
      },
      {
        header: "Receipt",
        accessorKey: "receipt",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const receipt = cell.getValue();
          const rowId = cell.row.original.id;
          return receipt && (receipt === "exists" || cell.row.original.receipt_filename) ? (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/medicalReimbursement/${rowId}/view-receipt`}
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
          ) : (
            <span className="d-block text-center">-</span>
          );
        },
      },
      {
        header: "Supporting Docs",
        accessorKey: "supporting_docs",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const docs = cell.getValue();
          const rowId = cell.row.original.id;
          return docs && (docs === "exists" || cell.row.original.supporting_docs_filename) ? (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/medicalReimbursement/${rowId}/view-supporting-docs`}
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
    []
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Medical Reimbursement</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Medical Reimbursement
          </Button>
        )}
      </div>

      {(!medicalReimbursement || medicalReimbursement.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No medical reimbursements found. Click "Add Medical Reimbursement" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={medicalReimbursement}
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
          {editItem ? "Edit" : "Add"} Medical Reimbursement
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Visit Date <span className="text-danger">*</span></Label>
                  <Controller 
                    name="visit_date" 
                    control={control} 
                    rules={{ required: "Visit date is required" }} 
                    render={({ field }) => <Input type="date" invalid={!!errors.visit_date} disabled={isOrgExecutive} {...field} />} 
                  />
                  {errors.visit_date && <FormFeedback>{errors.visit_date.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Amount <span className="text-danger">*</span></Label>
                  <Controller 
                    name="amount" 
                    control={control} 
                    rules={{ required: "Amount is required" }} 
                    render={({ field }) => <Input type="number" step="0.01" invalid={!!errors.amount} disabled={isOrgExecutive} {...field} />} 
                  />
                  {errors.amount && <FormFeedback>{errors.amount.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Illness Description <span className="text-danger">*</span></Label>
                  <Controller 
                    name="illness_description" 
                    control={control} 
                    rules={{ required: "Illness description is required" }} 
                    render={({ field }) => <Input type="textarea" rows={3} invalid={!!errors.illness_description} disabled={isOrgExecutive} {...field} />} 
                  />
                  {errors.illness_description && <FormFeedback>{errors.illness_description.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Receipt</Label>
                  <Controller
                    name="Receipt"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => onChange(e.target.files)}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {editItem && (editItem.Receipt || editItem.receipt || editItem.Receipt_Filename || editItem.receipt_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-primary me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.Receipt_Filename || editItem.receipt_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.Receipt_Size || editItem.receipt_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/medicalReimbursement/${editItem.id}/view-receipt`}
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
              <Col md={6}>
                <FormGroup>
                  <Label>Supporting Documents</Label>
                  <Controller
                    name="Supporting_Docs"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => onChange(e.target.files)}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {editItem && (editItem.Supporting_Docs || editItem.supporting_docs || editItem.Supporting_Docs_Filename || editItem.supporting_docs_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-primary me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.Supporting_Docs_Filename || editItem.supporting_docs_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.Supporting_Docs_Size || editItem.supporting_docs_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/medicalReimbursement/${editItem.id}/view-supporting-docs`}
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
              <Col md={12}>
                <FormGroup>
                  <Label>Comment</Label>
                  <Controller 
                    name="comment" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={2} disabled={isOrgExecutive} {...field} />} 
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
      <DeleteConfirmationModal isOpen={deleteModalOpen} toggle={hideDeleteConfirmation} onConfirm={confirmDelete} title="Delete Medical Reimbursement" message={deleteItem?.message} itemName={deleteItem?.name} itemType={deleteItem?.type} loading={deleteLoading} />
    </>
  );
};

export default MedicalReimbursementTab;
