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

const TreePlantingTab = ({ imamProfileId, treePlanting, lookupData, onUpdate, showAlert }) => {
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
        number_of_trees: editItem?.number_of_trees || "",
        tree_type: editItem?.tree_type || "",
        planting_location: editItem?.planting_location || "",
        planting_date: formatDateForInput(editItem?.planting_date),
        acknowledge: editItem?.acknowledge || false,
        status_id: editItem?.status_id || "1",
        comment: editItem?.comment || "",
        Planting_Image: null,
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
      const hasImage = data.Planting_Image && data.Planting_Image.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("number_of_trees", data.number_of_trees ? parseInt(data.number_of_trees) : "");
      formData.append("tree_type", data.tree_type || "");
      formData.append("planting_location", data.planting_location || "");
      formData.append("planting_date", data.planting_date || "");
      formData.append("acknowledge", data.acknowledge || false);
      formData.append("status_id", parseInt(data.status_id));
      formData.append("comment", data.comment || "");
      
      if (hasImage) {
        formData.append("Planting_Image", data.Planting_Image[0]);
      }

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/treePlanting/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Tree planting updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/treePlanting`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Tree planting created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save tree planting", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: `Tree Planting - ${editItem.number_of_trees || "N/A"} trees`, 
      type: "tree planting", 
      message: "This tree planting record will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/treePlanting/${editItem.id}`);
      showAlert("Tree planting deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/treePlanting/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Tree planting approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve tree planting", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/treePlanting/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Tree planting declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline tree planting", "danger");
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
        header: "Number of Trees",
        accessorKey: "number_of_trees",
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
        header: "Tree Type",
        accessorKey: "tree_type",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Planting Location",
        accessorKey: "planting_location",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Planting Date",
        accessorKey: "planting_date",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const v = cell.getValue();
          return v ? new Date(v).toLocaleDateString() : "-";
        },
      },
      {
        header: "Image",
        accessorKey: "planting_image",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const img = cell.getValue();
          const rowId = cell.row.original.id;
          return img && (img === "exists" || cell.row.original.planting_image_filename) ? (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/treePlanting/${rowId}/view-planting-image`}
                target="_blank"
                rel="noopener noreferrer"
                title="View Image"
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
    ],
    [lookupData, isAdmin]
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Tree Planting</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Tree Planting
          </Button>
        )}
      </div>

      {(!treePlanting || treePlanting.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No tree planting records found. Click "Add Tree Planting" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={treePlanting}
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
          {editItem ? "Edit Tree Planting" : "Add Tree Planting"}
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Number of Trees</Label>
                  <Controller
                    name="number_of_trees"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="number" min="1" placeholder="Enter number of trees" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Tree Type</Label>
                  <Controller
                    name="tree_type"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter tree type" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Planting Location</Label>
                  <Controller
                    name="planting_location"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Enter planting location" />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Planting Date</Label>
                  <Controller
                    name="planting_date"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="date" />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
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
              <Label>Planting Image</Label>
              <Controller
                name="Planting_Image"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Input
                    {...field}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      onChange(e.target.files);
                    }}
                  />
                )}
              />
              {editItem?.planting_image_filename && (
                <small className="text-muted d-block mt-1">
                  Current: {editItem.planting_image_filename} ({formatFileSize(editItem.planting_image_size)})
                </small>
              )}
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
                render={({ field }) => (
                  <Input {...field} type="checkbox" checked={field.value} />
                )}
              />
              <Label check>Acknowledge</Label>
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

export default TreePlantingTab;

