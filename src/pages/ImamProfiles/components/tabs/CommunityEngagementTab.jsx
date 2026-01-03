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

const CommunityEngagementTab = ({ imamProfileId, communityEngagement, lookupData, onUpdate, showAlert }) => {
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
        engagement_date: formatDateForInput(editItem?.engagement_date),
        engagement_type: editItem?.engagement_type || "",
        people_count: editItem?.people_count || "",
        comment: editItem?.comment || "",
        Engagement_Image: null,
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
      const hasFile = data.Engagement_Image && data.Engagement_Image.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("engagement_date", data.engagement_date);
      formData.append("engagement_type", data.engagement_type || "");
      formData.append("people_count", data.people_count);
      formData.append("comment", data.comment || "");
      
      if (hasFile) {
        formData.append("Engagement_Image", data.Engagement_Image[0]);
      }

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/communityEngagement/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Community engagement updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/communityEngagement`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Community engagement created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to save community engagement", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: `Community Engagement - ${editItem.engagement_date || "N/A"}`, 
      type: "community engagement", 
      message: "This community engagement will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/communityEngagement/${editItem.id}`);
      showAlert("Community engagement deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/communityEngagement/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Community engagement approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve community engagement", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/communityEngagement/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Community engagement declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline community engagement", "danger");
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
        header: "Engagement Date",
        accessorKey: "engagement_date",
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
        header: "Engagement Type",
        accessorKey: "engagement_type",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => getLookupValue(lookupData?.communityEngagementType, cell.getValue()),
      },
      {
        header: "People Count",
        accessorKey: "people_count",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Image",
        accessorKey: "engagement_image",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const image = cell.getValue();
          const rowId = cell.row.original.id;
          return image && (image === "exists" || cell.row.original.engagement_image_filename) ? (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/communityEngagement/${rowId}/view-engagement-image`}
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
        <h5 className="mb-0">Community Engagement</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Community Engagement
          </Button>
        )}
      </div>

      {(!communityEngagement || communityEngagement.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No community engagements found. Click "Add Community Engagement" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={communityEngagement}
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
          {editItem ? "Edit" : "Add"} Community Engagement
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Engagement Date <span className="text-danger">*</span></Label>
                  <Controller 
                    name="engagement_date" 
                    control={control} 
                    rules={{ required: "Engagement date is required" }} 
                    render={({ field }) => <Input type="date" invalid={!!errors.engagement_date} disabled={isOrgExecutive} {...field} />} 
                  />
                  {errors.engagement_date && <FormFeedback>{errors.engagement_date.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Engagement Type</Label>
                  <Controller 
                    name="engagement_type" 
                    control={control} 
                    render={({ field }) => (
                      <Input type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select Engagement Type</option>
                        {(lookupData?.communityEngagementType || []).map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>People Count <span className="text-danger">*</span></Label>
                  <Controller 
                    name="people_count" 
                    control={control} 
                    rules={{ required: "People count is required" }} 
                    render={({ field }) => <Input type="number" invalid={!!errors.people_count} disabled={isOrgExecutive} {...field} />} 
                  />
                  {errors.people_count && <FormFeedback>{errors.people_count.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Engagement Image</Label>
                  <Controller
                    name="Engagement_Image"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files)}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {editItem && (editItem.Engagement_Image || editItem.engagement_image || editItem.Engagement_Image_Filename || editItem.engagement_image_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-primary me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.Engagement_Image_Filename || editItem.engagement_image_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.Engagement_Image_Size || editItem.engagement_image_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/communityEngagement/${editItem.id}/view-engagement-image`}
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
      <DeleteConfirmationModal isOpen={deleteModalOpen} toggle={hideDeleteConfirmation} onConfirm={confirmDelete} title="Delete Community Engagement" message={deleteItem?.message} itemName={deleteItem?.name} itemType={deleteItem?.type} loading={deleteLoading} />
    </>
  );
};

export default CommunityEngagementTab;
