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

const NewBabyBonusTab = ({ imamProfileId, bonuses, lookupData, onUpdate, showAlert }) => {
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
        Spouse_Name: editItem?.spouse_name || "",
        Baby_Name: editItem?.baby_name || "",
        Baby_Gender: editItem?.baby_gender || "",
        Baby_DOB: editItem?.baby_dob || "",
        Acknowledge: editItem?.acknowledge || false,
        Status_ID: editItem?.status_id || "",
        Comment: editItem?.comment || "",
        Baby_Image: null,
        Birth_Certificate: null,
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
      const hasBabyImage = data.Baby_Image && data.Baby_Image.length > 0;
      const hasBirthCert = data.Birth_Certificate && data.Birth_Certificate.length > 0;

      if (hasBabyImage || hasBirthCert) {
        const formData = new FormData();
        formData.append("imam_profile_id", imamProfileId);
        formData.append("spouse_name", data.Spouse_Name);
        formData.append("baby_name", data.Baby_Name);
        formData.append("baby_gender", data.Baby_Gender && data.Baby_Gender !== "" ? data.Baby_Gender : "");
        formData.append("baby_dob", data.Baby_DOB);
        formData.append("acknowledge", data.Acknowledge || false);
        formData.append("status_id", data.Status_ID && data.Status_ID !== "" ? data.Status_ID : "1");
        formData.append("comment", data.Comment || "");

        if (hasBabyImage) {
          formData.append("Baby_Image", data.Baby_Image[0]);
        }
        if (hasBirthCert) {
          formData.append("Birth_Certificate", data.Birth_Certificate[0]);
        }

        if (editItem) {
          formData.append("updated_by", getAuditName());
          await axiosApi.put(`${API_BASE_URL}/newBabyBonus/${editItem.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          formData.append("created_by", getAuditName());
          await axiosApi.post(`${API_BASE_URL}/newBabyBonus`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        const payload = {
          imam_profile_id: imamProfileId,
          spouse_name: data.Spouse_Name,
          baby_name: data.Baby_Name,
          baby_gender: data.Baby_Gender && data.Baby_Gender !== "" ? parseInt(data.Baby_Gender) : null,
          baby_dob: data.Baby_DOB,
          acknowledge: data.Acknowledge || false,
          status_id: data.Status_ID && data.Status_ID !== "" ? parseInt(data.Status_ID) : 1,
          comment: data.Comment || null,
        };

        if (editItem) {
          payload.updated_by = getAuditName();
          await axiosApi.put(`${API_BASE_URL}/newBabyBonus/${editItem.id}`, payload);
        } else {
          payload.created_by = getAuditName();
          await axiosApi.post(`${API_BASE_URL}/newBabyBonus`, payload);
        }
      }

      showAlert(
        editItem ? "New Baby Bonus has been updated successfully" : "New Baby Bonus has been added successfully",
        "success"
      );
      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error saving new baby bonus:", error);
      showAlert(error?.response?.data?.message || "Operation failed", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;

    const babyName = editItem.baby_name || 'Unknown Baby';
    
    showDeleteConfirmation({
      id: editItem.id,
      name: babyName,
      type: "new baby bonus",
      message: "This new baby bonus will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/newBabyBonus/${editItem.id}`);
      showAlert("New Baby Bonus has been deleted successfully", "success");
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
        header: "Spouse Name",
        accessorKey: "spouse_name",
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
        header: "Baby Name",
        accessorKey: "baby_name",
        enableSorting: true,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Baby Gender",
        accessorKey: "baby_gender",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.gender || [], cell.row.original.baby_gender),
      },
      {
        header: "Baby DOB",
        accessorKey: "baby_dob",
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
        header: "Baby Image",
        accessorKey: "baby_image",
        enableSorting: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasImage = row.baby_image_show_link || row.baby_image_filename;
          return hasImage ? (
            <a
              href={`${API_STREAM_BASE_URL}/newBabyBonus/${row.id}/download-baby-image`}
              target="_blank"
              rel="noopener noreferrer"
              title="Download Baby Image"
            >
              <i className="bx bx-download text-primary" style={{ cursor: "pointer", fontSize: "18px" }}></i>
            </a>
          ) : (
            <span className="text-muted">-</span>
          );
        },
      },
      {
        header: "Birth Certificate",
        accessorKey: "birth_certificate",
        enableSorting: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasCert = row.birth_certificate_show_link || row.birth_certificate_filename;
          return hasCert ? (
            <a
              href={`${API_STREAM_BASE_URL}/newBabyBonus/${row.id}/download-birth-certificate`}
              target="_blank"
              rel="noopener noreferrer"
              title="Download Birth Certificate"
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
        <h5 className="mb-0">New Baby Bonus</h5>
        {!isOrgExecutive && imamProfileId && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add New Baby Bonus
          </Button>
        )}
      </div>

      {!imamProfileId ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          Please create the Imam Profile first before adding new baby bonuses.
        </div>
      ) : bonuses.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No new baby bonuses found. Click "Add New Baby Bonus" to create one.
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
          {editItem ? "Edit" : "Add"} New Baby Bonus
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="Spouse_Name">
                    Spouse Name <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Spouse_Name"
                    control={control}
                    rules={{ required: "Spouse Name is required" }}
                    render={({ field }) => (
                      <Input
                        id="Spouse_Name"
                        type="text"
                        invalid={!!errors.Spouse_Name}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Spouse_Name && <FormFeedback>{errors.Spouse_Name.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Baby_Name">
                    Baby Name <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Baby_Name"
                    control={control}
                    rules={{ required: "Baby Name is required" }}
                    render={({ field }) => (
                      <Input
                        id="Baby_Name"
                        type="text"
                        invalid={!!errors.Baby_Name}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Baby_Name && <FormFeedback>{errors.Baby_Name.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Baby_Gender">Baby Gender</Label>
                  <Controller
                    name="Baby_Gender"
                    control={control}
                    render={({ field }) => (
                      <Input id="Baby_Gender" type="select" disabled={isOrgExecutive} {...field}>
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
                  <Label for="Baby_DOB">
                    Baby Date of Birth <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Baby_DOB"
                    control={control}
                    rules={{ required: "Baby Date of Birth is required" }}
                    render={({ field }) => (
                      <Input
                        id="Baby_DOB"
                        type="date"
                        invalid={!!errors.Baby_DOB}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Baby_DOB && <FormFeedback>{errors.Baby_DOB.message}</FormFeedback>}
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
                  <Label for="Baby_Image">Baby Image</Label>
                  <Controller
                    name="Baby_Image"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Baby_Image"
                        type="file"
                        accept="image/*"
                        disabled={isOrgExecutive}
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    )}
                  />
                  {editItem && (editItem.baby_image_filename || editItem.baby_image_show_link) && (
                    <small className="text-muted d-block mt-1">
                      Current: {editItem.baby_image_filename || "Baby image"} 
                      {editItem.baby_image_size && ` (${formatFileSize(editItem.baby_image_size)})`}
                    </small>
                  )}
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Birth_Certificate">Birth Certificate</Label>
                  <Controller
                    name="Birth_Certificate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Birth_Certificate"
                        type="file"
                        accept="image/*,.pdf"
                        disabled={isOrgExecutive}
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    )}
                  />
                  {editItem && (editItem.birth_certificate_filename || editItem.birth_certificate_show_link) && (
                    <small className="text-muted d-block mt-1">
                      Current: {editItem.birth_certificate_filename || "Birth certificate"} 
                      {editItem.birth_certificate_size && ` (${formatFileSize(editItem.birth_certificate_size)})`}
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
        title="Delete New Baby Bonus"
        message={deleteItem?.message}
        itemName={deleteItem?.name}
        itemType={deleteItem?.type}
        loading={deleteLoading}
      />
    </>
  );
};

export default NewBabyBonusTab;

