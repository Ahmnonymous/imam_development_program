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

const JumuahKhutbahTopicSubmissionTab = ({ imamProfileId, imamProfile, jumuahKhutbahTopicSubmission, lookupData, onUpdate, showAlert }) => {
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
        topic: editItem?.topic || "",
        masjid_name: editItem?.masjid_name || "",
        town: editItem?.town || "",
        attendance_count: editItem?.attendance_count || "",
        language: editItem?.language || "",
        comment: editItem?.comment || "",
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
      const payload = {
        imam_profile_id: parseInt(imamProfileId),
        topic: data.topic,
        masjid_name: data.masjid_name,
        town: data.town ? parseInt(data.town) : null,
        attendance_count: data.attendance_count ? parseInt(data.attendance_count) : null,
        language: data.language ? parseInt(data.language) : null,
        comment: data.comment || null,
        created_by: getAuditName(),
        updated_by: getAuditName(),
      };
      if (editItem) {
        await axiosApi.put(`${API_BASE_URL}/jumuahKhutbahTopic/${editItem.id}`, payload);
        showAlert("Khutbah topic updated successfully", "success");
      } else {
        await axiosApi.post(`${API_BASE_URL}/jumuahKhutbahTopic`, payload);
        showAlert("Khutbah topic created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to save khutbah topic", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: editItem.topic || "Khutbah Topic", 
      type: "khutbah topic", 
      message: "This khutbah topic will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/jumuahKhutbahTopic/${editItem.id}`);
      showAlert("Khutbah topic deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/jumuahKhutbahTopic/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Khutbah topic approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve khutbah topic", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/jumuahKhutbahTopic/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Khutbah topic declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline khutbah topic", "danger");
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
        accessorKey: "topic",
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
        header: "Masjid Name",
        accessorKey: "masjid_name",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Date",
        accessorKey: "datestamp",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return value ? new Date(value).toLocaleDateString() : "-";
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
    []
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Jumuah Khutbah Topics</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Khutbah Topic
          </Button>
        )}
      </div>

      {(!jumuahKhutbahTopicSubmission || jumuahKhutbahTopicSubmission.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No khutbah topics found. Click "Add Khutbah Topic" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={jumuahKhutbahTopicSubmission}
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
          {editItem ? "Edit" : "Add"} Khutbah Topic
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Topic <span className="text-danger">*</span></Label>
                  <Controller 
                    name="topic" 
                    control={control} 
                    rules={{ required: "Topic is required" }} 
                    render={({ field }) => <Input type="text" invalid={!!errors.topic} disabled={isOrgExecutive} {...field} />} 
                  />
                  {errors.topic && <FormFeedback>{errors.topic.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Masjid Name <span className="text-danger">*</span></Label>
                  <Controller 
                    name="masjid_name" 
                    control={control} 
                    rules={{ required: "Masjid name is required" }} 
                    render={({ field }) => <Input type="text" invalid={!!errors.masjid_name} disabled={isOrgExecutive} {...field} />} 
                  />
                  {errors.masjid_name && <FormFeedback>{errors.masjid_name.message}</FormFeedback>}
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
                          id="acknowledgment-khutbah-topic"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledgment}
                        />
                        <Label check htmlFor="acknowledgment-khutbah-topic">
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
      <DeleteConfirmationModal isOpen={deleteModalOpen} toggle={hideDeleteConfirmation} onConfirm={confirmDelete} title="Delete Khutbah Topic" message={deleteItem?.message} itemName={deleteItem?.name} itemType={deleteItem?.type} loading={deleteLoading} />
    </>
  );
};

export default JumuahKhutbahTopicSubmissionTab;
