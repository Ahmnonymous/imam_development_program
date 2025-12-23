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

const CommunityEngagementTab = ({ imamProfileId, engagements, lookupData, onUpdate, showAlert }) => {
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
        Engagement_Type: editItem?.engagement_type || "",
        People_Count: editItem?.people_count || "",
        Engagement_Date: editItem?.engagement_date || "",
        Acknowledge: editItem?.acknowledge || false,
        Status_ID: editItem?.status_id || "",
        Comment: editItem?.comment || "",
        Engagement_Image: null,
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
      const hasImage = data.Engagement_Image && data.Engagement_Image.length > 0;

      if (hasImage) {
        const formData = new FormData();
        formData.append("imam_profile_id", imamProfileId);
        formData.append("engagement_type", data.Engagement_Type && data.Engagement_Type !== "" ? data.Engagement_Type : "");
        formData.append("people_count", data.People_Count);
        formData.append("engagement_date", data.Engagement_Date);
        formData.append("acknowledge", data.Acknowledge || false);
        formData.append("status_id", data.Status_ID && data.Status_ID !== "" ? data.Status_ID : "1");
        formData.append("comment", data.Comment || "");
        formData.append("Engagement_Image", data.Engagement_Image[0]);

        if (editItem) {
          formData.append("updated_by", getAuditName());
          await axiosApi.put(`${API_BASE_URL}/communityEngagement/${editItem.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          formData.append("created_by", getAuditName());
          await axiosApi.post(`${API_BASE_URL}/communityEngagement`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        const payload = {
          imam_profile_id: imamProfileId,
          engagement_type: data.Engagement_Type && data.Engagement_Type !== "" ? parseInt(data.Engagement_Type) : null,
          people_count: parseInt(data.People_Count) || 0,
          engagement_date: data.Engagement_Date,
          acknowledge: data.Acknowledge || false,
          status_id: data.Status_ID && data.Status_ID !== "" ? parseInt(data.Status_ID) : 1,
          comment: data.Comment || null,
        };

        if (editItem) {
          payload.updated_by = getAuditName();
          await axiosApi.put(`${API_BASE_URL}/communityEngagement/${editItem.id}`, payload);
        } else {
          payload.created_by = getAuditName();
          await axiosApi.post(`${API_BASE_URL}/communityEngagement`, payload);
        }
      }

      showAlert(
        editItem ? "Community Engagement has been updated successfully" : "Community Engagement has been added successfully",
        "success"
      );
      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error saving community engagement:", error);
      showAlert(error?.response?.data?.message || "Operation failed", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;

    const typeName = getLookupName(lookupData.communityEngagementType || [], editItem.engagement_type) || 'Unknown Engagement';
    
    showDeleteConfirmation({
      id: editItem.id,
      name: typeName,
      type: "community engagement",
      message: "This community engagement will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/communityEngagement/${editItem.id}`);
      showAlert("Community Engagement has been deleted successfully", "success");
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
        header: "Engagement Type",
        accessorKey: "engagement_type",
        enableSorting: false,
        cell: (cell) => {
          const value = getLookupName(lookupData.communityEngagementType || [], cell.row.original.engagement_type);
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
              {value}
            </span>
          );
        },
      },
      {
        header: "People Count",
        accessorKey: "people_count",
        enableSorting: true,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Engagement Date",
        accessorKey: "engagement_date",
        enableSorting: true,
        cell: (cell) => {
          const date = cell.getValue();
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
      {
        header: "Status",
        accessorKey: "status_id",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.status || [], cell.row.original.status_id),
      },
      {
        header: "Image",
        accessorKey: "engagement_image",
        enableSorting: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasImage = row.engagement_image_show_link || row.engagement_image_filename;
          return hasImage ? (
            <a
              href={`${API_STREAM_BASE_URL}/communityEngagement/${row.id}/download-image`}
              target="_blank"
              rel="noopener noreferrer"
              title="Download Image"
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
        <h5 className="mb-0">Community Engagement</h5>
        {!isOrgExecutive && imamProfileId && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Engagement
          </Button>
        )}
      </div>

      {!imamProfileId ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          Please create the Imam Profile first before adding community engagements.
        </div>
      ) : engagements.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No community engagements found. Click "Add Engagement" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={engagements || []}
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
          {editItem ? "Edit" : "Add"} Community Engagement
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="Engagement_Type">Engagement Type</Label>
                  <Controller
                    name="Engagement_Type"
                    control={control}
                    render={({ field }) => (
                      <Input id="Engagement_Type" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select Engagement Type</option>
                        {(lookupData.communityEngagementType || []).map((item) => (
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
                  <Label for="People_Count">
                    People Count <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="People_Count"
                    control={control}
                    rules={{ required: "People Count is required" }}
                    render={({ field }) => (
                      <Input
                        id="People_Count"
                        type="number"
                        invalid={!!errors.People_Count}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.People_Count && <FormFeedback>{errors.People_Count.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Engagement_Date">
                    Engagement Date <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Engagement_Date"
                    control={control}
                    rules={{ required: "Engagement Date is required" }}
                    render={({ field }) => (
                      <Input
                        id="Engagement_Date"
                        type="date"
                        invalid={!!errors.Engagement_Date}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Engagement_Date && <FormFeedback>{errors.Engagement_Date.message}</FormFeedback>}
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
                  <Label for="Engagement_Image">Engagement Image</Label>
                  <Controller
                    name="Engagement_Image"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Engagement_Image"
                        type="file"
                        accept="image/*"
                        disabled={isOrgExecutive}
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    )}
                  />
                  {editItem && (editItem.engagement_image_filename || editItem.engagement_image_show_link) && (
                    <small className="text-muted d-block mt-1">
                      Current: {editItem.engagement_image_filename || "Engagement image"} 
                      {editItem.engagement_image_size && ` (${formatFileSize(editItem.engagement_image_size)})`}
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
        title="Delete Community Engagement"
        message={deleteItem?.message}
        itemName={deleteItem?.name}
        itemType={deleteItem?.type}
        loading={deleteLoading}
      />
    </>
  );
};

export default CommunityEngagementTab;

