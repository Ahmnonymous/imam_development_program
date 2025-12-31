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

const HardshipReliefTab = ({ imamProfileId, hardshipRelief, lookupData, onUpdate, showAlert }) => {
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
        request_for: editItem?.request_for ? String(editItem.request_for) : "",
        is_muslim: editItem?.is_muslim ? String(editItem.is_muslim) : "",
        name_of_person_community: editItem?.name_of_person_community || "",
        area_of_residence: editItem?.area_of_residence ? String(editItem.area_of_residence) : "",
        age_group: editItem?.age_group || "",
        has_disabilities: editItem?.has_disabilities ? String(editItem.has_disabilities) : "",
        disability_details: editItem?.disability_details || "",
        dependents: editItem?.dependents || "",
        assistance_type: editItem?.assistance_type || "",
        amount_required_local_currency: editItem?.amount_required_local_currency || "",
        acknowledge: editItem?.acknowledge || false,
        status_id: editItem?.status_id ? String(editItem.status_id) : "1",
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
        request_for: data.request_for ? parseInt(data.request_for) : null,
        is_muslim: data.is_muslim ? parseInt(data.is_muslim) : null,
        name_of_person_community: data.name_of_person_community || "",
        area_of_residence: data.area_of_residence ? parseInt(data.area_of_residence) : null,
        age_group: data.age_group || "",
        has_disabilities: data.has_disabilities ? parseInt(data.has_disabilities) : null,
        disability_details: data.disability_details || "",
        dependents: data.dependents || "",
        assistance_type: data.assistance_type || "",
        amount_required_local_currency: data.amount_required_local_currency ? parseFloat(data.amount_required_local_currency) : null,
        acknowledge: data.acknowledge || false,
        status_id: parseInt(data.status_id),
        created_by: getAuditName(),
        updated_by: getAuditName(),
      };

      if (editItem) {
        delete formData.created_by;
        await axiosApi.put(`${API_BASE_URL}/hardshipRelief/${editItem.id}`, formData);
        showAlert("Hardship relief updated successfully", "success");
      } else {
        await axiosApi.post(`${API_BASE_URL}/hardshipRelief`, formData);
        showAlert("Hardship relief created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save hardship relief", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
      showDeleteConfirmation({ 
      id: editItem.id, 
      name: `Hardship Relief - ${editItem.assistance_type || "N/A"}`, 
      type: "hardship relief",
      message: "This hardship relief will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/hardshipRelief/${editItem.id}`);
      showAlert("Hardship relief deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/hardshipRelief/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Hardship relief approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve hardship relief", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/hardshipRelief/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Hardship relief declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline hardship relief", "danger");
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
        header: "Request For",
        accessorKey: "request_for",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => getLookupValue(lookupData?.requestFor, cell.getValue()),
      },
      {
        header: "Type of Assistance",
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
        accessorKey: "amount_required_local_currency",
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
        <h5 className="mb-0">Hardship Relief</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Hardship Relief
          </Button>
        )}
      </div>

      {(!hardshipRelief || hardshipRelief.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No hardship relief records found. Click "Add Hardship Relief" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={hardshipRelief}
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
          {editItem ? "Edit Hardship Relief" : "Add Hardship Relief"}
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Request For</Label>
                  <Controller
                    name="request_for"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="select">
                        <option value="">Select</option>
                        {(lookupData?.requestFor || []).map((item) => (
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
                  <Label>Is Muslim</Label>
                  <Controller
                    name="is_muslim"
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
                  <Label>Name of Person/Community</Label>
                  <Controller
                    name="name_of_person_community"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter name" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Area of Residence</Label>
                  <Controller
                    name="area_of_residence"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="select">
                        <option value="">Select Suburb</option>
                        {(lookupData?.suburb || []).map((item) => (
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
                  <Label>Age Group</Label>
                  <Controller
                    name="age_group"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter age group" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Has Disabilities</Label>
                  <Controller
                    name="has_disabilities"
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
              <Label>Disability Details</Label>
              <Controller
                name="disability_details"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="2" placeholder="Enter details" />
                )}
              />
            </FormGroup>
            <FormGroup>
              <Label>Dependents</Label>
              <Controller
                name="dependents"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="2" placeholder="Enter dependents" />
                )}
              />
            </FormGroup>
            <FormGroup>
              <Label>Type of Assistance <span className="text-danger">*</span></Label>
              <Controller
                name="assistance_type"
                control={control}
                rules={{ required: "Type of assistance is required" }}
                render={({ field }) => (
                  <Input {...field} type="textarea" rows="3" placeholder="Enter type of assistance" invalid={!!errors.assistance_type} />
                )}
              />
              {errors.assistance_type && <FormFeedback>{errors.assistance_type.message}</FormFeedback>}
            </FormGroup>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Amount Required (Local Currency) <span className="text-danger">*</span></Label>
                  <Controller
                    name="amount_required_local_currency"
                    control={control}
                    rules={{ required: "Amount is required" }}
                    render={({ field }) => (
                      <Input {...field} type="number" step="0.01" placeholder="0.00" invalid={!!errors.amount_required_local_currency} />
                    )}
                  />
                  {errors.amount_required_local_currency && <FormFeedback>{errors.amount_required_local_currency.message}</FormFeedback>}
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
            <FormGroup check>
              <Controller
                name="acknowledge"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="checkbox" checked={field.value} />
                )}
              />
              <Label check>Acknowledge <span className="text-danger">*</span></Label>
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

export default HardshipReliefTab;

