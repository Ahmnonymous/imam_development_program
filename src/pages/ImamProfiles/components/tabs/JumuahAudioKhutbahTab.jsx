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

const JumuahAudioKhutbahTab = ({ imamProfileId, audioKhutbah, lookupData, onUpdate, showAlert }) => {
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
        Khutbah_Topic: editItem?.khutbah_topic || "",
        Khutbah_Date: editItem?.khutbah_date || "",
        Attendance_Count: editItem?.attendance_count || "",
        Language: editItem?.language || "",
        Acknowledge: editItem?.acknowledge || false,
        Status_ID: editItem?.status_id || "",
        Comment: editItem?.comment || "",
        Audio: null,
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
      const hasFile = data.Audio && data.Audio.length > 0;

      if (hasFile) {
        const formData = new FormData();
        formData.append("imam_profile_id", imamProfileId);
        formData.append("khutbah_topic", data.Khutbah_Topic);
        formData.append("khutbah_date", data.Khutbah_Date);
        formData.append("attendance_count", data.Attendance_Count || "");
        if (data.Language && data.Language !== "") formData.append("language", data.Language);
        formData.append("acknowledge", data.Acknowledge || false);
        formData.append("status_id", data.Status_ID && data.Status_ID !== "" ? data.Status_ID : "1");
        formData.append("comment", data.Comment || "");
        formData.append("Audio", data.Audio[0]);

        if (editItem) {
          formData.append("updated_by", getAuditName());
          await axiosApi.put(`${API_BASE_URL}/jumuahAudioKhutbah/${editItem.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          formData.append("created_by", getAuditName());
          await axiosApi.post(`${API_BASE_URL}/jumuahAudioKhutbah`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        const payload = {
          imam_profile_id: imamProfileId,
          khutbah_topic: data.Khutbah_Topic,
          khutbah_date: data.Khutbah_Date,
          attendance_count: data.Attendance_Count ? parseInt(data.Attendance_Count) : null,
          language: data.Language && data.Language !== "" ? parseInt(data.Language) : null,
          acknowledge: data.Acknowledge || false,
          status_id: data.Status_ID && data.Status_ID !== "" ? parseInt(data.Status_ID) : 1,
          comment: data.Comment || null,
        };

        if (editItem) {
          payload.updated_by = getAuditName();
          await axiosApi.put(`${API_BASE_URL}/jumuahAudioKhutbah/${editItem.id}`, payload);
        } else {
          payload.created_by = getAuditName();
          await axiosApi.post(`${API_BASE_URL}/jumuahAudioKhutbah`, payload);
        }
      }

      showAlert(
        editItem ? "Jumuah Audio Khutbah has been updated successfully" : "Jumuah Audio Khutbah has been added successfully",
        "success"
      );
      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error saving jumuah audio khutbah:", error);
      showAlert(error?.response?.data?.message || "Operation failed", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;

    const topicName = editItem.khutbah_topic || 'Unknown Topic';
    
    showDeleteConfirmation({
      id: editItem.id,
      name: topicName,
      type: "jumuah audio khutbah",
      message: "This jumuah audio khutbah will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/jumuahAudioKhutbah/${editItem.id}`);
      showAlert("Jumuah Audio Khutbah has been deleted successfully", "success");
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
        accessorKey: "khutbah_topic",
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
        header: "Date",
        accessorKey: "khutbah_date",
        enableSorting: true,
        cell: (cell) => {
          const date = cell.getValue();
          return date ? new Date(date).toLocaleDateString() : "-";
        },
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
        header: "Audio",
        accessorKey: "audio",
        enableSorting: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasAudio = row.audio_show_link || row.audio_filename;
          return hasAudio ? (
            <div className="d-flex gap-2">
              <a
                href={`${API_STREAM_BASE_URL}/jumuahAudioKhutbah/${row.id}/download-audio`}
                target="_blank"
                rel="noopener noreferrer"
                title="Download Audio"
              >
                <i className="bx bx-download text-primary" style={{ cursor: "pointer", fontSize: "18px" }}></i>
              </a>
              {row.audio_size && (
                <span className="text-muted small">{formatFileSize(row.audio_size)}</span>
              )}
            </div>
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
        <h5 className="mb-0">Jumuah Audio Khutbah</h5>
        {!isOrgExecutive && imamProfileId && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Audio Khutbah
          </Button>
        )}
      </div>

      {!imamProfileId ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          Please create the Imam Profile first before adding audio khutbah.
        </div>
      ) : audioKhutbah.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No audio khutbah found. Click "Add Audio Khutbah" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={audioKhutbah || []}
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
          {editItem ? "Edit" : "Add"} Jumuah Audio Khutbah
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="Khutbah_Topic">
                    Khutbah Topic <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Khutbah_Topic"
                    control={control}
                    rules={{ required: "Khutbah Topic is required" }}
                    render={({ field }) => (
                      <Input
                        id="Khutbah_Topic"
                        type="text"
                        invalid={!!errors.Khutbah_Topic}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Khutbah_Topic && <FormFeedback>{errors.Khutbah_Topic.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Khutbah_Date">
                    Khutbah Date <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Khutbah_Date"
                    control={control}
                    rules={{ required: "Khutbah Date is required" }}
                    render={({ field }) => (
                      <Input
                        id="Khutbah_Date"
                        type="date"
                        invalid={!!errors.Khutbah_Date}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Khutbah_Date && <FormFeedback>{errors.Khutbah_Date.message}</FormFeedback>}
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
                  <Label for="Audio">Audio File</Label>
                  <Controller
                    name="Audio"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Audio"
                        type="file"
                        accept="audio/*"
                        disabled={isOrgExecutive}
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    )}
                  />
                  {editItem && (editItem.audio_filename || editItem.audio_show_link) && (
                    <small className="text-muted d-block mt-1">
                      Current: {editItem.audio_filename || "Audio file"} 
                      {editItem.audio_size && ` (${formatFileSize(editItem.audio_size)})`}
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
        title="Delete Jumuah Audio Khutbah"
        message={deleteItem?.message}
        itemName={deleteItem?.name}
        itemType={deleteItem?.type}
        loading={deleteLoading}
      />
    </>
  );
};

export default JumuahAudioKhutbahTab;

