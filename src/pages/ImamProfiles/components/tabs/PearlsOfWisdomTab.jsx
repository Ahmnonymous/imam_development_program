import React, { useState, useEffect, useMemo } from "react";
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

const PearlsOfWisdomTab = ({ imamProfileId, pearlsOfWisdom, lookupData, onUpdate, showAlert }) => {
  if (!imamProfileId) return null;
  const { isOrgExecutive, isAppAdmin, isGlobalAdmin } = useRole();
  const isAdmin = isAppAdmin || isGlobalAdmin;
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
        resource_title: editItem?.resource_title || "",
        author_speaker: editItem?.author_speaker || "",
        heading_description: editItem?.heading_description || "",
        pearl_one: editItem?.pearl_one || "",
        pearl_two: editItem?.pearl_two || "",
        pearl_three: editItem?.pearl_three || "",
        pearl_four: editItem?.pearl_four || "",
        pearl_five: editItem?.pearl_five || "",
        comment: editItem?.comment || "",
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

  const onSubmit = async (data) => {
    try {
      const payload = {
        imam_profile_id: parseInt(imamProfileId),
        resource_title: data.resource_title,
        author_speaker: data.author_speaker || null,
        heading_description: data.heading_description || null,
        pearl_one: data.pearl_one,
        pearl_two: data.pearl_two || null,
        pearl_three: data.pearl_three || null,
        pearl_four: data.pearl_four || null,
        pearl_five: data.pearl_five || null,
        comment: data.comment || null,
        created_by: getAuditName(),
        updated_by: getAuditName(),
      };

      if (editItem) {
        await axiosApi.put(`${API_BASE_URL}/pearlsOfWisdom/${editItem.id}`, payload);
        showAlert("Pearl of Wisdom updated successfully", "success");
      } else {
        await axiosApi.post(`${API_BASE_URL}/pearlsOfWisdom`, payload);
        showAlert("Pearl of Wisdom created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error saving pearl of wisdom:", error);
      showAlert(error?.response?.data?.message || "Failed to save pearl of wisdom", "danger");
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({
      id: editItem.id,
      name: editItem.resource_title || "Pearl of Wisdom",
      type: "pearl of wisdom",
      message: "This pearl of wisdom will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/pearlsOfWisdom/${editItem.id}`);
      showAlert("Pearl of Wisdom deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/pearlsOfWisdom/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Pearl of Wisdom approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve pearl of wisdom", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/pearlsOfWisdom/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Pearl of Wisdom declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline pearl of wisdom", "danger");
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
        header: "Resource Title",
        accessorKey: "resource_title",
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
        header: "Author/Speaker",
        accessorKey: "author_speaker",
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
    [lookupData, isAdmin]
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Pearls of Wisdom</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Pearl of Wisdom
          </Button>
        )}
      </div>

      {(!pearlsOfWisdom || pearlsOfWisdom.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No pearls of wisdom found. Click "Add Pearl of Wisdom" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={pearlsOfWisdom}
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
          {editItem ? "Edit" : "Add"} Pearl of Wisdom
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <FormGroup>
              <Label>Resource Title <span className="text-danger">*</span></Label>
              <Controller
                name="resource_title"
                control={control}
                rules={{ required: "Resource title is required" }}
                render={({ field }) => <Input type="text" invalid={!!errors.resource_title} {...field} />}
              />
              {errors.resource_title && <FormFeedback>{errors.resource_title.message}</FormFeedback>}
            </FormGroup>
            <FormGroup>
              <Label>Author/Speaker</Label>
              <Controller
                name="author_speaker"
                control={control}
                render={({ field }) => <Input type="text" {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Heading/Description</Label>
              <Controller
                name="heading_description"
                control={control}
                render={({ field }) => <Input type="textarea" rows={3} {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Pearl One <span className="text-danger">*</span></Label>
              <Controller
                name="pearl_one"
                control={control}
                rules={{ required: "Pearl one is required" }}
                render={({ field }) => <Input type="textarea" rows={3} invalid={!!errors.pearl_one} {...field} />}
              />
              {errors.pearl_one && <FormFeedback>{errors.pearl_one.message}</FormFeedback>}
            </FormGroup>
            <FormGroup>
              <Label>Pearl Two</Label>
              <Controller
                name="pearl_two"
                control={control}
                render={({ field }) => <Input type="textarea" rows={3} {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Pearl Three</Label>
              <Controller
                name="pearl_three"
                control={control}
                render={({ field }) => <Input type="textarea" rows={3} {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Pearl Four</Label>
              <Controller
                name="pearl_four"
                control={control}
                render={({ field }) => <Input type="textarea" rows={3} {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Pearl Five</Label>
              <Controller
                name="pearl_five"
                control={control}
                render={({ field }) => <Input type="textarea" rows={3} {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Comment</Label>
              <Controller
                name="comment"
                control={control}
                render={({ field }) => <Input type="textarea" rows={2} {...field} />}
              />
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
        title="Delete Pearl of Wisdom"
        message={deleteItem?.message}
        itemName={deleteItem?.name}
        itemType={deleteItem?.type}
        loading={deleteLoading}
      />
    </>
  );
};

export default PearlsOfWisdomTab;

