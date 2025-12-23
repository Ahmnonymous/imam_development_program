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

const JumuahKhutbahTopicTab = ({ imamProfileId, topics, lookupData, onUpdate, showAlert }) => {
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
        Topic: editItem?.topic || "",
        Masjid_Name: editItem?.masjid_name || "",
        Town: editItem?.town || "",
        Attendance_Count: editItem?.attendance_count || "",
        Language: editItem?.language || "",
        Acknowledge: editItem?.acknowledge || false,
        Status_ID: editItem?.status_id || "",
        Comment: editItem?.comment || "",
      });
    }
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
        topic: data.Topic,
        masjid_name: data.Masjid_Name,
        town: data.Town && data.Town !== "" ? parseInt(data.Town) : null,
        attendance_count: data.Attendance_Count ? parseInt(data.Attendance_Count) : null,
        language: data.Language && data.Language !== "" ? parseInt(data.Language) : null,
        acknowledge: data.Acknowledge || false,
        status_id: data.Status_ID && data.Status_ID !== "" ? parseInt(data.Status_ID) : 1,
        comment: data.Comment || null,
      };

      if (editItem) {
        payload.updated_by = getAuditName();
        await axiosApi.put(`${API_BASE_URL}/jumuahKhutbahTopicSubmission/${editItem.id}`, payload);
        showAlert("Jumuah Khutbah Topic has been updated successfully", "success");
      } else {
        payload.created_by = getAuditName();
        await axiosApi.post(`${API_BASE_URL}/jumuahKhutbahTopicSubmission`, payload);
        showAlert("Jumuah Khutbah Topic has been added successfully", "success");
      }

      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error saving jumuah khutbah topic:", error);
      showAlert(error?.response?.data?.message || "Operation failed", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;

    const topicName = editItem.topic || 'Unknown Topic';
    
    showDeleteConfirmation({
      id: editItem.id,
      name: topicName,
      type: "jumuah khutbah topic",
      message: "This jumuah khutbah topic will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/jumuahKhutbahTopicSubmission/${editItem.id}`);
      showAlert("Jumuah Khutbah Topic has been deleted successfully", "success");
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
        header: "Topic",
        accessorKey: "topic",
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
        header: "Masjid Name",
        accessorKey: "masjid_name",
        enableSorting: true,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Town",
        accessorKey: "town",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.suburb || [], cell.row.original.town),
      },
      {
        header: "Attendance",
        accessorKey: "attendance_count",
        enableSorting: true,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Language",
        accessorKey: "language",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.language || [], cell.row.original.language),
      },
      {
        header: "Status",
        accessorKey: "status_id",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.status || [], cell.row.original.status_id),
      },
      {
        header: "Date",
        accessorKey: "datestamp",
        enableSorting: true,
        cell: (cell) => {
          const date = cell.getValue();
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
    ],
    []
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Jumuah Khutbah Topic Submission</h5>
        {!isOrgExecutive && imamProfileId && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Topic
          </Button>
        )}
      </div>

      {!imamProfileId ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          Please create the Imam Profile first before adding topics.
        </div>
      ) : topics.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No topics found. Click "Add Topic" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={topics || []}
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
          {editItem ? "Edit" : "Add"} Jumuah Khutbah Topic
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="Topic">
                    Topic <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Topic"
                    control={control}
                    rules={{ required: "Topic is required" }}
                    render={({ field }) => (
                      <Input
                        id="Topic"
                        type="text"
                        invalid={!!errors.Topic}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Topic && <FormFeedback>{errors.Topic.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Masjid_Name">
                    Masjid Name <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Masjid_Name"
                    control={control}
                    rules={{ required: "Masjid Name is required" }}
                    render={({ field }) => (
                      <Input
                        id="Masjid_Name"
                        type="text"
                        invalid={!!errors.Masjid_Name}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Masjid_Name && <FormFeedback>{errors.Masjid_Name.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Town">Town</Label>
                  <Controller
                    name="Town"
                    control={control}
                    render={({ field }) => (
                      <Input id="Town" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select Town</option>
                        {(lookupData.suburb || []).map((item) => (
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
                  <Label for="Attendance_Count">Attendance Count</Label>
                  <Controller
                    name="Attendance_Count"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Attendance_Count"
                        type="number"
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Language">Language</Label>
                  <Controller
                    name="Language"
                    control={control}
                    render={({ field }) => (
                      <Input id="Language" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select Language</option>
                        {(lookupData.language || []).map((item) => (
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
        title="Delete Jumuah Khutbah Topic"
        message={deleteItem?.message}
        itemName={deleteItem?.name}
        itemType={deleteItem?.type}
        loading={deleteLoading}
      />
    </>
  );
};

export default JumuahKhutbahTopicTab;

