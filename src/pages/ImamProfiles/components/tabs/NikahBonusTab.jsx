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

const NikahBonusTab = ({ imamProfileId, bonuses, lookupData, onUpdate, showAlert }) => {
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
        Nikah_Date: editItem?.nikah_date || "",
        Is_First_Nikah: editItem?.is_first_nikah || "",
        Acknowledge: editItem?.acknowledge || false,
        Status_ID: editItem?.status_id || "",
        Comment: editItem?.comment || "",
        Certificate: null,
        Nikah_Image: null,
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
      const hasCertificate = data.Certificate && data.Certificate.length > 0;
      const hasImage = data.Nikah_Image && data.Nikah_Image.length > 0;

      if (hasCertificate || hasImage) {
        const formData = new FormData();
        formData.append("imam_profile_id", imamProfileId);
        formData.append("spouse_name", data.Spouse_Name);
        formData.append("nikah_date", data.Nikah_Date);
        formData.append("is_first_nikah", data.Is_First_Nikah && data.Is_First_Nikah !== "" ? data.Is_First_Nikah : "");
        formData.append("acknowledge", data.Acknowledge || false);
        formData.append("status_id", data.Status_ID && data.Status_ID !== "" ? data.Status_ID : "1");
        formData.append("comment", data.Comment || "");

        if (hasCertificate) {
          formData.append("Certificate", data.Certificate[0]);
        }
        if (hasImage) {
          formData.append("Nikah_Image", data.Nikah_Image[0]);
        }

        if (editItem) {
          formData.append("updated_by", getAuditName());
          await axiosApi.put(`${API_BASE_URL}/nikahBonus/${editItem.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          formData.append("created_by", getAuditName());
          await axiosApi.post(`${API_BASE_URL}/nikahBonus`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        const payload = {
          imam_profile_id: imamProfileId,
          spouse_name: data.Spouse_Name,
          nikah_date: data.Nikah_Date,
          is_first_nikah: data.Is_First_Nikah && data.Is_First_Nikah !== "" ? parseInt(data.Is_First_Nikah) : null,
          acknowledge: data.Acknowledge || false,
          status_id: data.Status_ID && data.Status_ID !== "" ? parseInt(data.Status_ID) : 1,
          comment: data.Comment || null,
        };

        if (editItem) {
          payload.updated_by = getAuditName();
          await axiosApi.put(`${API_BASE_URL}/nikahBonus/${editItem.id}`, payload);
        } else {
          payload.created_by = getAuditName();
          await axiosApi.post(`${API_BASE_URL}/nikahBonus`, payload);
        }
      }

      showAlert(
        editItem ? "Nikah Bonus has been updated successfully" : "Nikah Bonus has been added successfully",
        "success"
      );
      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error saving nikah bonus:", error);
      showAlert(error?.response?.data?.message || "Operation failed", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;

    const spouseName = editItem.spouse_name || 'Unknown Spouse';
    
    showDeleteConfirmation({
      id: editItem.id,
      name: spouseName,
      type: "nikah bonus",
      message: "This nikah bonus will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/nikahBonus/${editItem.id}`);
      showAlert("Nikah Bonus has been deleted successfully", "success");
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
        header: "Nikah Date",
        accessorKey: "nikah_date",
        enableSorting: true,
        cell: (cell) => {
          const date = cell.getValue();
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
      {
        header: "First Nikah",
        accessorKey: "is_first_nikah",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.yesNo || [], cell.row.original.is_first_nikah),
      },
      {
        header: "Status",
        accessorKey: "status_id",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.status || [], cell.row.original.status_id),
      },
      {
        header: "Certificate",
        accessorKey: "certificate",
        enableSorting: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasCert = row.certificate_show_link || row.certificate_filename;
          return hasCert ? (
            <a
              href={`${API_STREAM_BASE_URL}/nikahBonus/${row.id}/download-certificate`}
              target="_blank"
              rel="noopener noreferrer"
              title="Download Certificate"
            >
              <i className="bx bx-download text-primary" style={{ cursor: "pointer", fontSize: "18px" }}></i>
            </a>
          ) : (
            <span className="text-muted">-</span>
          );
        },
      },
      {
        header: "Image",
        accessorKey: "nikah_image",
        enableSorting: false,
        cell: (cell) => {
          const row = cell.row.original;
          const hasImage = row.nikah_image_show_link || row.nikah_image_filename;
          return hasImage ? (
            <a
              href={`${API_STREAM_BASE_URL}/nikahBonus/${row.id}/download-image`}
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
        <h5 className="mb-0">Nikah Bonus</h5>
        {!isOrgExecutive && imamProfileId && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Nikah Bonus
          </Button>
        )}
      </div>

      {!imamProfileId ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          Please create the Imam Profile first before adding nikah bonuses.
        </div>
      ) : bonuses.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No nikah bonuses found. Click "Add Nikah Bonus" to create one.
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
          {editItem ? "Edit" : "Add"} Nikah Bonus
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
                  <Label for="Nikah_Date">
                    Nikah Date <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Nikah_Date"
                    control={control}
                    rules={{ required: "Nikah Date is required" }}
                    render={({ field }) => (
                      <Input
                        id="Nikah_Date"
                        type="date"
                        invalid={!!errors.Nikah_Date}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Nikah_Date && <FormFeedback>{errors.Nikah_Date.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="Is_First_Nikah">Is First Nikah</Label>
                  <Controller
                    name="Is_First_Nikah"
                    control={control}
                    render={({ field }) => (
                      <Input id="Is_First_Nikah" type="select" disabled={isOrgExecutive} {...field}>
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
                  <Label for="Certificate">Certificate</Label>
                  <Controller
                    name="Certificate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Certificate"
                        type="file"
                        accept="image/*,.pdf"
                        disabled={isOrgExecutive}
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    )}
                  />
                  {editItem && (editItem.certificate_filename || editItem.certificate_show_link) && (
                    <small className="text-muted d-block mt-1">
                      Current: {editItem.certificate_filename || "Certificate file"} 
                      {editItem.certificate_size && ` (${formatFileSize(editItem.certificate_size)})`}
                    </small>
                  )}
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Nikah_Image">Nikah Image</Label>
                  <Controller
                    name="Nikah_Image"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Nikah_Image"
                        type="file"
                        accept="image/*"
                        disabled={isOrgExecutive}
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    )}
                  />
                  {editItem && (editItem.nikah_image_filename || editItem.nikah_image_show_link) && (
                    <small className="text-muted d-block mt-1">
                      Current: {editItem.nikah_image_filename || "Nikah image"} 
                      {editItem.nikah_image_size && ` (${formatFileSize(editItem.nikah_image_size)})`}
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
        title="Delete Nikah Bonus"
        message={deleteItem?.message}
        itemName={deleteItem?.name}
        itemType={deleteItem?.type}
        loading={deleteLoading}
      />
    </>
  );
};

export default NikahBonusTab;

