import React, { useState, useMemo, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  FormFeedback,
} from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import TableContainer from "../../../../components/Common/TableContainer";
import DeleteConfirmationModal from "../../../../components/Common/DeleteConfirmationModal";
import useDeleteConfirmation from "../../../../hooks/useDeleteConfirmation";
import { useRole } from "../../../../helpers/useRole";
import axiosApi from "../../../../helpers/api_helper";
import { API_BASE_URL, API_STREAM_BASE_URL } from "../../../../helpers/url_helper";
import { getAuditName } from "../../../../helpers/userStorage";

const MedicalReimbursementTab = ({ imamProfileId, reimbursements, lookupData, onUpdate, showAlert }) => {
  const { isOrgExecutive } = useRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const {
    deleteModalOpen,
    deleteItem,
    deleteLoading,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    confirmDelete
  } = useDeleteConfirmation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

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
        Relationship_Type: editItem?.relationship_type || "",
        Visit_Type: editItem?.visit_type || "",
        Visit_Date: editItem?.visit_date || "",
        Illness_Description: editItem?.illness_description || "",
        Service_Provider: editItem?.service_provider || "",
        Amount: editItem?.amount || "",
        Acknowledge: editItem?.acknowledge || false,
        Status_ID: editItem?.status_id || "",
        Comment: editItem?.comment || "",
        Receipt: null,
        Supporting_Docs: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem, modalOpen, reset]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (modalOpen) {
      setEditItem(null);
    }
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

      if (hasReceipt || hasSupportingDocs) {
        const formData = new FormData();
        formData.append("imam_profile_id", imamProfileId);
        formData.append("relationship_type", data.Relationship_Type && data.Relationship_Type !== "" ? data.Relationship_Type : "");
        formData.append("visit_type", data.Visit_Type && data.Visit_Type !== "" ? data.Visit_Type : "");
        formData.append("visit_date", data.Visit_Date);
        formData.append("illness_description", data.Illness_Description);
        formData.append("service_provider", data.Service_Provider && data.Service_Provider !== "" ? data.Service_Provider : "");
        formData.append("amount", data.Amount);
        formData.append("acknowledge", data.Acknowledge || false);
        formData.append("status_id", data.Status_ID && data.Status_ID !== "" ? data.Status_ID : "1");
        formData.append("comment", data.Comment || "");

        if (hasReceipt) {
          formData.append("Receipt", data.Receipt[0]);
        }
        if (hasSupportingDocs) {
          formData.append("Supporting_Docs", data.Supporting_Docs[0]);
        }

        if (editItem) {
          formData.append("updated_by", getAuditName());
          await axiosApi.put(`${API_BASE_URL}/medicalReimbursement/${editItem.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          formData.append("created_by", getAuditName());
          await axiosApi.post(`${API_BASE_URL}/medicalReimbursement`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        const payload = {
          imam_profile_id: imamProfileId,
          relationship_type: data.Relationship_Type && data.Relationship_Type !== "" ? parseInt(data.Relationship_Type) : null,
          visit_type: data.Visit_Type && data.Visit_Type !== "" ? parseInt(data.Visit_Type) : null,
          visit_date: data.Visit_Date,
          illness_description: data.Illness_Description,
          service_provider: data.Service_Provider && data.Service_Provider !== "" ? parseInt(data.Service_Provider) : null,
          amount: parseFloat(data.Amount) || 0,
          acknowledge: data.Acknowledge || false,
          status_id: data.Status_ID && data.Status_ID !== "" ? parseInt(data.Status_ID) : 1,
          comment: data.Comment || null,
        };

        if (editItem) {
          payload.updated_by = getAuditName();
          await axiosApi.put(`${API_BASE_URL}/medicalReimbursement/${editItem.id}`, payload);
        } else {
          payload.created_by = getAuditName();
          await axiosApi.post(`${API_BASE_URL}/medicalReimbursement`, payload);
        }
      }

      showAlert(
        editItem ? "Medical Reimbursement has been updated successfully" : "Medical Reimbursement has been added successfully",
        "success"
      );
      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error saving medical reimbursement:", error);
      showAlert(error?.response?.data?.message || "Operation failed", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;

    const description = editItem.illness_description || 'Unknown Reimbursement';
    
    showDeleteConfirmation({
      id: editItem.id,
      name: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
      type: "medical reimbursement",
      message: "This medical reimbursement will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/medicalReimbursement/${editItem.id}`);
      showAlert("Medical Reimbursement has been deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const getLookupName = (lookupArray, id) => {
    if (!id) return "-";
    const item = lookupArray.find((l) => l.id == id);
    return item ? item.name : "-";
  };

  const columns = useMemo(
    () => [
      {
        header: "Visit Date",
        accessorKey: "visit_date",
        enableSorting: true,
        cell: (cell) => {
          const date = cell.getValue();
          const formattedDate = date ? new Date(date).toLocaleDateString() : "-";
          return (
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
              {formattedDate}
            </span>
          );
        },
      },
      {
        header: "Illness Description",
        accessorKey: "illness_description",
        enableSorting: true,
        cell: (cell) => {
          const desc = cell.getValue();
          return desc ? (desc.length > 50 ? desc.substring(0, 50) + "..." : desc) : "-";
        },
      },
      {
        header: "Service Provider",
        accessorKey: "service_provider",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.medicalServiceProvider || [], cell.row.original.service_provider),
      },
      {
        header: "Amount",
        accessorKey: "amount",
        enableSorting: true,
        cell: (cell) => {
          const amount = cell.getValue();
          return amount ? `R ${parseFloat(amount).toFixed(2)}` : "-";
        },
      },
      {
        header: "Status",
        accessorKey: "status_id",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.status || [], cell.row.original.status_id),
      },
      {
        header: "Receipt",
        accessorKey: "receipt",
        enableSorting: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasReceipt = row.receipt_show_link || row.receipt_filename;
          return hasReceipt ? (
            <a
              href={`${API_STREAM_BASE_URL}/medicalReimbursement/${row.id}/download-receipt`}
              target="_blank"
              rel="noopener noreferrer"
              title="Download Receipt"
            >
              <i className="bx bx-download text-primary" style={{ cursor: "pointer", fontSize: "18px" }}></i>
            </a>
          ) : (
            <span className="text-muted">-</span>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Medical Reimbursement</h5>
        {!isOrgExecutive && imamProfileId && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Reimbursement
          </Button>
        )}
      </div>

      {!imamProfileId ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          Please create the Imam Profile first before adding medical reimbursements.
        </div>
      ) : reimbursements.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No medical reimbursements found. Click "Add Reimbursement" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={reimbursements || []}
          isGlobalFilter={false}
          enableColumnFilters={false}
          isPagination={true}
          isCustomPageSize={true}
          pagination="pagination"
          paginationWrapper="dataTables_paginate paging_simple_numbers"
          tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
        />
      )}

      {/* Modal */}
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
                  <Label for="Relationship_Type">Relationship Type</Label>
                  <Controller
                    name="Relationship_Type"
                    control={control}
                    render={({ field }) => (
                      <Input id="Relationship_Type" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select Relationship Type</option>
                        {(lookupData.relationshipType || []).map((item) => (
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
                  <Label for="Visit_Type">Visit Type</Label>
                  <Controller
                    name="Visit_Type"
                    control={control}
                    render={({ field }) => (
                      <Input id="Visit_Type" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select Visit Type</option>
                        {(lookupData.medicalVisitType || []).map((item) => (
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
                  <Label for="Visit_Date">
                    Visit Date <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Visit_Date"
                    control={control}
                    rules={{ required: "Visit Date is required" }}
                    render={({ field }) => (
                      <Input
                        id="Visit_Date"
                        type="date"
                        invalid={!!errors.Visit_Date}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Visit_Date && <FormFeedback>{errors.Visit_Date.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Service_Provider">Service Provider</Label>
                  <Controller
                    name="Service_Provider"
                    control={control}
                    render={({ field }) => (
                      <Input id="Service_Provider" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select Service Provider</option>
                        {(lookupData.medicalServiceProvider || []).map((item) => (
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
                  <Label for="Illness_Description">
                    Illness Description <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Illness_Description"
                    control={control}
                    rules={{ required: "Illness Description is required" }}
                    render={({ field }) => (
                      <Input
                        id="Illness_Description"
                        type="textarea"
                        rows="3"
                        invalid={!!errors.Illness_Description}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Illness_Description && <FormFeedback>{errors.Illness_Description.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Amount">
                    Amount <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Amount"
                    control={control}
                    rules={{ required: "Amount is required" }}
                    render={({ field }) => (
                      <Input
                        id="Amount"
                        type="number"
                        step="0.01"
                        invalid={!!errors.Amount}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Amount && <FormFeedback>{errors.Amount.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Status_ID">Status</Label>
                  <Controller
                    name="Status_ID"
                    control={control}
                    render={({ field }) => (
                      <Input id="Status_ID" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select Status</option>
                        {(lookupData.status || []).map((item) => (
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
                <FormGroup check>
                  <Label check>
                    <Controller
                      name="Acknowledge"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          disabled={isOrgExecutive}
                        />
                      )}
                    />
                    <span className="ms-2">Acknowledge</span>
                  </Label>
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Receipt">Receipt</Label>
                  <Controller
                    name="Receipt"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Receipt"
                        type="file"
                        accept="image/*,.pdf"
                        disabled={isOrgExecutive}
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    )}
                  />
                  {editItem && (editItem.receipt_filename || editItem.receipt_show_link) && (
                    <small className="text-muted d-block mt-1">
                      Current: {editItem.receipt_filename || "Receipt file"} 
                      {editItem.receipt_size && ` (${formatFileSize(editItem.receipt_size)})`}
                    </small>
                  )}
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Supporting_Docs">Supporting Documents</Label>
                  <Controller
                    name="Supporting_Docs"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Supporting_Docs"
                        type="file"
                        accept="image/*,.pdf"
                        disabled={isOrgExecutive}
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    )}
                  />
                  {editItem && (editItem.supporting_docs_filename || editItem.supporting_docs_show_link) && (
                    <small className="text-muted d-block mt-1">
                      Current: {editItem.supporting_docs_filename || "Supporting documents"} 
                      {editItem.supporting_docs_size && ` (${formatFileSize(editItem.supporting_docs_size)})`}
                    </small>
                  )}
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Comment">Comment</Label>
                  <Controller
                    name="Comment"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Comment"
                        type="textarea"
                        rows="3"
                        disabled={isOrgExecutive}
                        {...field}
                      />
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        toggle={hideDeleteConfirmation}
        onConfirm={confirmDelete}
        title="Delete Medical Reimbursement"
        message={deleteItem?.message}
        itemName={deleteItem?.name}
        itemType={deleteItem?.type}
        loading={deleteLoading}
      />
    </>
  );
};

export default MedicalReimbursementTab;

