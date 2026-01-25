import React, { useState, useEffect, useMemo } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import TableContainer from "../../../../components/Common/TableContainer";
import DeleteConfirmationModal from "../../../../components/Common/DeleteConfirmationModal";
import useDeleteConfirmation from "../../../../hooks/useDeleteConfirmation";
import { useRole } from "../../../../helpers/useRole";
import axiosApi from "../../../../helpers/api_helper";
import { API_BASE_URL } from "../../../../helpers/url_helper";
import { getAuditName } from "../../../../helpers/userStorage";

const ImamFinancialAssistanceTab = ({ imamProfileId, imamFinancialAssistance, lookupData, onUpdate, showAlert }) => {
  if (!imamProfileId) return null;
  const { isOrgExecutive, isAppAdmin, isGlobalAdmin } = useRole();
  const isAdmin = isAppAdmin || isGlobalAdmin;
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { deleteModalOpen, deleteItem, deleteLoading, showDeleteConfirmation, hideDeleteConfirmation, confirmDelete } = useDeleteConfirmation();
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (modalOpen) {
      reset({
        assistance_type: editItem?.assistance_type || "",
        amount_required: editItem?.amount_required || "",
        amount_required_currency: editItem?.amount_required_currency || "",
        reason_for_assistance: editItem?.reason_for_assistance || "",
        monthly_income: editItem?.monthly_income || "",
        monthly_expenses: editItem?.monthly_expenses || "",
        acknowledge: editItem?.acknowledge || false,
        status_id: editItem?.status_id || "1",
        comment: editItem?.comment || "",
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
      const formData = {
        imam_profile_id: imamProfileId,
        assistance_type: data.assistance_type,
        amount_required: data.amount_required ? parseFloat(data.amount_required) : null,
        amount_required_currency: data.amount_required_currency ? parseInt(data.amount_required_currency) : null,
        reason_for_assistance: data.reason_for_assistance,
        monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : null,
        monthly_expenses: data.monthly_expenses ? parseFloat(data.monthly_expenses) : null,
        acknowledge: data.acknowledge || false,
        status_id: parseInt(data.status_id),
        comment: data.comment || "",
        created_by: getAuditName(),
        updated_by: getAuditName(),
      };

      if (editItem) {
        delete formData.created_by;
        await axiosApi.put(`${API_BASE_URL}/imamFinancialAssistance/${editItem.id}`, formData);
        showAlert("Financial assistance updated successfully", "success");
      } else {
        await axiosApi.post(`${API_BASE_URL}/imamFinancialAssistance`, formData);
        showAlert("Financial assistance created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save financial assistance", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: `Financial Assistance - ${editItem.amount_required || "N/A"}`, 
      type: "financial assistance", 
      message: "This financial assistance will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/imamFinancialAssistance/${editItem.id}`);
      showAlert("Financial assistance deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/imamFinancialAssistance/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Financial assistance approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve financial assistance", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/imamFinancialAssistance/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Financial assistance declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline financial assistance", "danger");
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
        header: "Assistance Type",
        accessorKey: "assistance_type",
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
        header: "Amount Required",
        accessorKey: "amount_required",
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
        <h5 className="mb-0">Financial Assistance</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Financial Assistance
          </Button>
        )}
      </div>

      {(!imamFinancialAssistance || imamFinancialAssistance.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No financial assistance records found. Click "Add Financial Assistance" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={imamFinancialAssistance}
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
          {editItem ? "Edit" : "Add"} Financial Assistance
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Assistance Type</Label>
                  <Controller
                    name="assistance_type"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter assistance type" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Amount Required</Label>
                  <Controller
                    name="amount_required"
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
                  <Label>Currency</Label>
                  <Controller
                    name="amount_required_currency"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="select">
                        <option value="">Select Currency</option>
                        {(lookupData?.currency || []).map((item) => (
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
                  <Label>Monthly Income</Label>
                  <Controller
                    name="monthly_income"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="number" step="0.01" placeholder="0.00" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Monthly Expenses</Label>
                  <Controller
                    name="monthly_expenses"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="number" step="0.01" placeholder="0.00" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label>Reason for Assistance</Label>
              <Controller
                name="reason_for_assistance"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="3" placeholder="Enter reason" />
                )}
              />
            </FormGroup>
            <FormGroup>
              <Label>Comment</Label>
              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="2" placeholder="Enter comment" />
                )}
              />
            </FormGroup>
            <FormGroup check>
              <Controller
                name="acknowledge"
                control={control}
                rules={{ required: "You must acknowledge the statement to proceed" }}
                render={({ field }) => (
                  <>
                    <Input
                      type="checkbox"
                      id="acknowledgment-financial"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      invalid={!!errors.acknowledge}
                    />
                    <Label check htmlFor="acknowledgment-financial">
                      I swear by Allah, the All-Hearing and the All-Seeing, that I have completed this form truthfully and honestly, to the best of my knowledge and belief.
                    </Label>
                    {errors.acknowledge && (
                      <FormFeedback>{errors.acknowledge.message}</FormFeedback>
                    )}
                  </>
                )}
              />
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

export default ImamFinancialAssistanceTab;

