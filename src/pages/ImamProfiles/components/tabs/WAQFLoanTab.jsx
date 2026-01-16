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

const WAQFLoanTab = ({ imamProfileId, waqfLoan, lookupData, onUpdate, showAlert }) => {
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
        participated_recent_bonuses_90_days: editItem?.participated_recent_bonuses_90_days || "",
        recent_bonuses_details: editItem?.recent_bonuses_details || "",
        active_dawah: editItem?.active_dawah || "",
        dawah_activities_details: editItem?.dawah_activities_details || "",
        contributed_to_waqf_loan_fund: editItem?.contributed_to_waqf_loan_fund || "",
        loan_type: editItem?.loan_type || "",
        loan_reason: editItem?.loan_reason || "",
        tried_employer_request: editItem?.tried_employer_request || "",
        promise_to_repay: editItem?.promise_to_repay || "",
        understand_waqf_fund: editItem?.understand_waqf_fund || "",
        amount_required: editItem?.amount_required || "",
        monthly_income: editItem?.monthly_income || "",
        monthly_expenses: editItem?.monthly_expenses || "",
        repayment_structure: editItem?.repayment_structure || "",
        repayment_explanation: editItem?.repayment_explanation || "",
        first_guarantor_name: editItem?.first_guarantor_name || "",
        first_guarantor_contact: editItem?.first_guarantor_contact || "",
        second_guarantor_name: editItem?.second_guarantor_name || "",
        second_guarantor_contact: editItem?.second_guarantor_contact || "",
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
        participated_recent_bonuses_90_days: data.participated_recent_bonuses_90_days ? parseInt(data.participated_recent_bonuses_90_days) : null,
        recent_bonuses_details: data.recent_bonuses_details || "",
        active_dawah: data.active_dawah ? parseInt(data.active_dawah) : null,
        dawah_activities_details: data.dawah_activities_details || "",
        contributed_to_waqf_loan_fund: data.contributed_to_waqf_loan_fund ? parseInt(data.contributed_to_waqf_loan_fund) : null,
        loan_type: data.loan_type || "",
        loan_reason: data.loan_reason || "",
        tried_employer_request: data.tried_employer_request || "",
        promise_to_repay: data.promise_to_repay ? parseInt(data.promise_to_repay) : null,
        understand_waqf_fund: data.understand_waqf_fund ? parseInt(data.understand_waqf_fund) : null,
        amount_required: data.amount_required ? parseFloat(data.amount_required) : null,
        monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : null,
        monthly_expenses: data.monthly_expenses ? parseFloat(data.monthly_expenses) : null,
        repayment_structure: data.repayment_structure ? parseFloat(data.repayment_structure) : null,
        repayment_explanation: data.repayment_explanation || "",
        first_guarantor_name: data.first_guarantor_name || "",
        first_guarantor_contact: data.first_guarantor_contact || "",
        second_guarantor_name: data.second_guarantor_name || "",
        second_guarantor_contact: data.second_guarantor_contact || "",
        acknowledge: data.acknowledge || false,
        status_id: parseInt(data.status_id),
        comment: data.comment || "",
        created_by: getAuditName(),
        updated_by: getAuditName(),
      };

      if (editItem) {
        delete formData.created_by;
        await axiosApi.put(`${API_BASE_URL}/waqfLoan/${editItem.id}`, formData);
        showAlert("WAQF Loan updated successfully", "success");
      } else {
        await axiosApi.post(`${API_BASE_URL}/waqfLoan`, formData);
        showAlert("WAQF Loan created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save WAQF Loan", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: `WAQF Loan - ${editItem.amount_required || "N/A"}`, 
      type: "WAQF Loan", 
      message: "This WAQF Loan record will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/waqfLoan/${editItem.id}`);
      showAlert("WAQF Loan deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/waqfLoan/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("WAQF Loan approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve WAQF Loan", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/waqfLoan/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("WAQF Loan declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline WAQF Loan", "danger");
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
        header: "Loan Type",
        accessorKey: "loan_type",
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
        <h5 className="mb-0">WAQF Loan</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add WAQF Loan
          </Button>
        )}
      </div>

      {(!waqfLoan || waqfLoan.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No WAQF Loan records found. Click "Add WAQF Loan" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={waqfLoan}
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
          {editItem ? "Edit" : "Add"} WAQF Loan
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Participated in Recent Bonuses (90 days)</Label>
                  <Controller
                    name="participated_recent_bonuses_90_days"
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
              <Col md={6}>
                <FormGroup>
                  <Label>Active Dawah</Label>
                  <Controller
                    name="active_dawah"
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
              <Label>Recent Bonuses Details</Label>
              <Controller
                name="recent_bonuses_details"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="2" placeholder="Enter details" />
                )}
              />
            </FormGroup>
            <FormGroup>
              <Label>Dawah Activities Details</Label>
              <Controller
                name="dawah_activities_details"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="2" placeholder="Enter details" />
                )}
              />
            </FormGroup>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Contributed to WAQF Loan Fund</Label>
                  <Controller
                    name="contributed_to_waqf_loan_fund"
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
              <Col md={6}>
                <FormGroup>
                  <Label>Loan Type</Label>
                  <Controller
                    name="loan_type"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter loan type" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label>Loan Reason</Label>
              <Controller
                name="loan_reason"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="3" placeholder="Enter reason in full detail" />
                )}
              />
            </FormGroup>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Tried Employer Request</Label>
                  <Controller
                    name="tried_employer_request"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter details" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Promise to Repay</Label>
                  <Controller
                    name="promise_to_repay"
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
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Understand WAQF Fund</Label>
                  <Controller
                    name="understand_waqf_fund"
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
                  <Label>Monthly Income (Exclude IDP Stipend)</Label>
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
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Repayment Structure</Label>
                  <Controller
                    name="repayment_structure"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="number" step="0.01" placeholder="0.00" />
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
            <FormGroup>
              <Label>Repayment Explanation</Label>
              <Controller
                name="repayment_explanation"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="2" placeholder="Explain how you will meet monthly repayment" />
                )}
              />
            </FormGroup>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>First Guarantor Name</Label>
                  <Controller
                    name="first_guarantor_name"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter name" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>First Guarantor Contact</Label>
                  <Controller
                    name="first_guarantor_contact"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter contact number" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Second Guarantor Name</Label>
                  <Controller
                    name="second_guarantor_name"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter name" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Second Guarantor Contact</Label>
                  <Controller
                    name="second_guarantor_contact"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter contact number" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
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

export default WAQFLoanTab;

