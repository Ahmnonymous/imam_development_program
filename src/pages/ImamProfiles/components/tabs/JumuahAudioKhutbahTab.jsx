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

const JumuahAudioKhutbahTab = ({ imamProfileId, imamProfile, jumuahAudioKhutbah, lookupData, onUpdate, showAlert }) => {
  if (!imamProfileId) return null;
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
        khutbah_topic: editItem?.khutbah_topic || "",
        khutbah_date: formatDateForInput(editItem?.khutbah_date),
        masjid_name: editItem?.masjid_name || "",
        town: editItem?.town || "",
        attendance_count: editItem?.attendance_count || "",
        comment: editItem?.comment || "",
        Audio: null,
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
      const hasFile = data.Audio && data.Audio.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("khutbah_topic", data.khutbah_topic);
      formData.append("khutbah_date", data.khutbah_date);
      formData.append("masjid_name", data.masjid_name || "");
      formData.append("town", data.town ? parseInt(data.town) : "");
      formData.append("attendance_count", data.attendance_count || "");
      formData.append("comment", data.comment || "");
      
      if (hasFile) {
        formData.append("Audio", data.Audio[0]);
      }

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/jumuahAudioKhutbah/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Audio Khutbah updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/jumuahAudioKhutbah`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Audio Khutbah created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to save audio khutbah", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: editItem.khutbah_topic || "Audio Khutbah", 
      type: "audio khutbah", 
      message: "This audio khutbah will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/jumuahAudioKhutbah/${editItem.id}`);
      showAlert("Audio Khutbah deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/jumuahAudioKhutbah/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Audio Khutbah approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve audio khutbah", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/jumuahAudioKhutbah/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Audio Khutbah declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline audio khutbah", "danger");
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
        header: "Topic",
        accessorKey: "khutbah_topic",
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
        header: "Date",
        accessorKey: "khutbah_date",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return value ? new Date(value).toLocaleDateString() : "-";
        },
      },
      {
        header: "Masjid Name",
        accessorKey: "masjid_name",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Town",
        accessorKey: "town",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const townId = cell.getValue();
          return getLookupValue(lookupData?.suburb, townId);
        },
      },
      {
        header: "Attendance",
        accessorKey: "attendance_count",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Audio",
        accessorKey: "audio",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const audio = cell.getValue();
          const rowId = cell.row.original.id;
          return audio && (audio === "exists" || cell.row.original.audio_filename) ? (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/jumuahAudioKhutbah/${rowId}/view-audio`}
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
    [lookupData, isAdmin]
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Audio Khutbah</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Audio Khutbah
          </Button>
        )}
      </div>

      {(!jumuahAudioKhutbah || jumuahAudioKhutbah.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No audio khutbahs found. Click "Add Audio Khutbah" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={jumuahAudioKhutbah}
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
          {editItem ? "Edit" : "Add"} Audio Khutbah
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Khutbah Topic <span className="text-danger">*</span></Label>
                  <Controller 
                    name="khutbah_topic" 
                    control={control} 
                    rules={{ required: "Topic is required" }} 
                    render={({ field }) => <Input type="text" invalid={!!errors.khutbah_topic} disabled={isOrgExecutive} {...field} />} 
                  />
                  {errors.khutbah_topic && <FormFeedback>{errors.khutbah_topic.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Khutbah Date <span className="text-danger">*</span></Label>
                  <Controller 
                    name="khutbah_date" 
                    control={control} 
                    rules={{ required: "Date is required" }} 
                    render={({ field }) => <Input type="date" invalid={!!errors.khutbah_date} disabled={isOrgExecutive} {...field} />} 
                  />
                  {errors.khutbah_date && <FormFeedback>{errors.khutbah_date.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Masjid Name</Label>
                  <Controller 
                    name="masjid_name" 
                    control={control} 
                    render={({ field }) => <Input type="text" disabled={isOrgExecutive} {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Town</Label>
                  <Controller 
                    name="town" 
                    control={control} 
                    render={({ field }) => {
                      const imamSuburbId = imamProfile?.suburb_id ? Number(imamProfile.suburb_id) : null;
                      const filteredSuburbs = imamSuburbId 
                        ? (lookupData.suburb || []).filter((x) => Number(x.id) === imamSuburbId)
                        : (lookupData.suburb || []);
                      return (
                        <Input type="select" disabled={isOrgExecutive} {...field}>
                          <option value="">Select Town</option>
                          {filteredSuburbs.map((x) => (
                            <option key={x.id} value={x.id}>{x.name}</option>
                          ))}
                        </Input>
                      );
                    }} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Attendance Count</Label>
                  <Controller 
                    name="attendance_count" 
                    control={control} 
                    render={({ field }) => <Input type="number" disabled={isOrgExecutive} {...field} />} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Audio File</Label>
                  <Controller
                    name="Audio"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => onChange(e.target.files)}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {editItem && (editItem.Audio === "exists" || editItem.audio === "exists" || editItem.Audio_Filename || editItem.audio_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-primary me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.Audio_Filename || editItem.audio_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.Audio_Size || editItem.audio_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/jumuahAudioKhutbah/${editItem.id}/view-audio`}
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
                          id="acknowledgment-audio"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledgment}
                        />
                        <Label check htmlFor="acknowledgment-audio">
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
      <DeleteConfirmationModal isOpen={deleteModalOpen} toggle={hideDeleteConfirmation} onConfirm={confirmDelete} title="Delete Audio Khutbah" message={deleteItem?.message} itemName={deleteItem?.name} itemType={deleteItem?.type} loading={deleteLoading} />
    </>
  );
};

export default JumuahAudioKhutbahTab;
