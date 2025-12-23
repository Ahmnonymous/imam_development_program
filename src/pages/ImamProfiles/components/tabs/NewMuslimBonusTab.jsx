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
import { API_BASE_URL } from "../../../../helpers/url_helper";
import { getAuditName } from "../../../../helpers/userStorage";

const NewMuslimBonusTab = ({ imamProfileId, bonuses, lookupData, onUpdate, showAlert }) => {
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

  useEffect(() => {
    if (modalOpen) {
      reset({
        Revert_Name: editItem?.revert_name || "",
        Revert_Gender: editItem?.revert_gender || "",
        Revert_DOB: editItem?.revert_dob || "",
        Revert_Phone: editItem?.revert_phone || "",
        Revert_Email: editItem?.revert_email || "",
        Revert_Reason: editItem?.revert_reason || "",
        Revert_Pack_Requested: editItem?.revert_pack_requested || "",
        Course_Completed: editItem?.course_completed || "",
        Acknowledge: editItem?.acknowledge || false,
        Status_ID: editItem?.status_id || "",
        Comment: editItem?.comment || "",
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
      const payload = {
        imam_profile_id: imamProfileId,
        revert_name: data.Revert_Name,
        revert_gender: data.Revert_Gender && data.Revert_Gender !== "" ? parseInt(data.Revert_Gender) : null,
        revert_dob: data.Revert_DOB || null,
        revert_phone: data.Revert_Phone || null,
        revert_email: data.Revert_Email || null,
        revert_reason: data.Revert_Reason,
        revert_pack_requested: data.Revert_Pack_Requested && data.Revert_Pack_Requested !== "" ? parseInt(data.Revert_Pack_Requested) : null,
        course_completed: data.Course_Completed && data.Course_Completed !== "" ? parseInt(data.Course_Completed) : null,
        acknowledge: data.Acknowledge || false,
        status_id: data.Status_ID && data.Status_ID !== "" ? parseInt(data.Status_ID) : 1,
        comment: data.Comment || null,
      };

      if (editItem) {
        payload.updated_by = getAuditName();
        await axiosApi.put(`${API_BASE_URL}/newMuslimBonus/${editItem.id}`, payload);
        showAlert("New Muslim Bonus has been updated successfully", "success");
      } else {
        payload.created_by = getAuditName();
        await axiosApi.post(`${API_BASE_URL}/newMuslimBonus`, payload);
        showAlert("New Muslim Bonus has been added successfully", "success");
      }

      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error saving new muslim bonus:", error);
      showAlert(error?.response?.data?.message || "Operation failed", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;

    const revertName = editItem.revert_name || 'Unknown Revert';
    
    showDeleteConfirmation({
      id: editItem.id,
      name: revertName,
      type: "new muslim bonus",
      message: "This new muslim bonus will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/newMuslimBonus/${editItem.id}`);
      showAlert("New Muslim Bonus has been deleted successfully", "success");
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
        header: "Revert Name",
        accessorKey: "revert_name",
        enableSorting: true,
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
        header: "Gender",
        accessorKey: "revert_gender",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.gender || [], cell.row.original.revert_gender),
      },
      {
        header: "DOB",
        accessorKey: "revert_dob",
        enableSorting: true,
        cell: (cell) => {
          const date = cell.getValue();
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
      {
        header: "Phone",
        accessorKey: "revert_phone",
        enableSorting: true,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Email",
        accessorKey: "revert_email",
        enableSorting: true,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Pack Requested",
        accessorKey: "revert_pack_requested",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.yesNo || [], cell.row.original.revert_pack_requested),
      },
      {
        header: "Course Completed",
        accessorKey: "course_completed",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.yesNo || [], cell.row.original.course_completed),
      },
      {
        header: "Status",
        accessorKey: "status_id",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.status || [], cell.row.original.status_id),
      },
    ],
    []
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">New Muslim Bonus</h5>
        {!isOrgExecutive && imamProfileId && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add New Muslim Bonus
          </Button>
        )}
      </div>

      {!imamProfileId ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          Please create the Imam Profile first before adding new muslim bonuses.
        </div>
      ) : bonuses.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No new muslim bonuses found. Click "Add New Muslim Bonus" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={bonuses || []}
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
          {editItem ? "Edit" : "Add"} New Muslim Bonus
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="Revert_Name">
                    Revert Name <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Revert_Name"
                    control={control}
                    rules={{ required: "Revert Name is required" }}
                    render={({ field }) => (
                      <Input
                        id="Revert_Name"
                        type="text"
                        invalid={!!errors.Revert_Name}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Revert_Name && <FormFeedback>{errors.Revert_Name.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Revert_Gender">Revert Gender</Label>
                  <Controller
                    name="Revert_Gender"
                    control={control}
                    render={({ field }) => (
                      <Input id="Revert_Gender" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select Gender</option>
                        {(lookupData.gender || []).map((item) => (
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
                  <Label for="Revert_DOB">Revert Date of Birth</Label>
                  <Controller
                    name="Revert_DOB"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Revert_DOB"
                        type="date"
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Revert_Phone">Revert Phone</Label>
                  <Controller
                    name="Revert_Phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Revert_Phone"
                        type="text"
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Revert_Email">Revert Email</Label>
                  <Controller
                    name="Revert_Email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Revert_Email"
                        type="email"
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Revert_Pack_Requested">Pack Requested</Label>
                  <Controller
                    name="Revert_Pack_Requested"
                    control={control}
                    render={({ field }) => (
                      <Input id="Revert_Pack_Requested" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select</option>
                        {(lookupData.yesNo || []).map((item) => (
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
                  <Label for="Course_Completed">Course Completed</Label>
                  <Controller
                    name="Course_Completed"
                    control={control}
                    render={({ field }) => (
                      <Input id="Course_Completed" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select</option>
                        {(lookupData.yesNo || []).map((item) => (
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
                  <Label for="Revert_Reason">
                    Revert Reason <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Revert_Reason"
                    control={control}
                    rules={{ required: "Revert Reason is required" }}
                    render={({ field }) => (
                      <Input
                        id="Revert_Reason"
                        type="textarea"
                        rows="3"
                        invalid={!!errors.Revert_Reason}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Revert_Reason && <FormFeedback>{errors.Revert_Reason.message}</FormFeedback>}
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
        title="Delete New Muslim Bonus"
        message={deleteItem?.message}
        itemName={deleteItem?.name}
        itemType={deleteItem?.type}
        loading={deleteLoading}
      />
    </>
  );
};

export default NewMuslimBonusTab;

