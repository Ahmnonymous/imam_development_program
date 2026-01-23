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

const NikahBonusTab = ({ imamProfileId, nikahBonus, relationships, lookupData, onUpdate, showAlert }) => {
  if (!imamProfileId) return null;
  const { isOrgExecutive, isAppAdmin, isGlobalAdmin } = useRole();
  const isAdmin = isAppAdmin || isGlobalAdmin;
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { deleteModalOpen, deleteItem, deleteLoading, showDeleteConfirmation, hideDeleteConfirmation, confirmDelete } = useDeleteConfirmation();
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  // Filter relationships to only show husband and wife relationships
  const spouseRelationships = useMemo(() => {
    if (!relationships || !lookupData?.relationshipTypes) return [];
    const husbandType = lookupData.relationshipTypes.find(rt => rt.name?.toLowerCase() === "husband");
    const wifeType = lookupData.relationshipTypes.find(rt => rt.name?.toLowerCase() === "wife");
    const spouseTypeIds = [];
    if (husbandType) spouseTypeIds.push(Number(husbandType.id));
    if (wifeType) spouseTypeIds.push(Number(wifeType.id));
    if (spouseTypeIds.length === 0) return [];
    return relationships.filter(rel => spouseTypeIds.includes(Number(rel.relationship_type)));
  }, [relationships, lookupData]);

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
        spouse_relationship_id: editItem?.spouse_relationship_id ? String(editItem.spouse_relationship_id) : "",
        nikah_date: formatDateForInput(editItem?.nikah_date),
        comment: editItem?.comment || "",
        Certificate: null,
        Nikah_Image: null,
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
      const hasCertificate = data.Certificate && data.Certificate.length > 0;
      const hasNikahImage = data.Nikah_Image && data.Nikah_Image.length > 0;
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("spouse_relationship_id", data.spouse_relationship_id ? parseInt(data.spouse_relationship_id) : "");
      formData.append("nikah_date", data.nikah_date);
      formData.append("comment", data.comment || "");
      
      if (hasCertificate) {
        formData.append("Certificate", data.Certificate[0]);
      }
      if (hasNikahImage) {
        formData.append("Nikah_Image", data.Nikah_Image[0]);
      }

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/nikahBonus/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Nikah bonus updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/nikahBonus`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Nikah bonus created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to save nikah bonus", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    const spouseName = editItem?.spouse_name || editItem?.spouse_relationship_name || "Nikah Bonus";
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: spouseName, 
      type: "nikah bonus", 
      message: "This nikah bonus will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/nikahBonus/${editItem.id}`);
      showAlert("Nikah bonus deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/nikahBonus/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Nikah bonus approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve nikah bonus", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/nikahBonus/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Nikah bonus declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline nikah bonus", "danger");
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
        header: "Spouse Name",
        accessorKey: "spouse_name",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const row = cell.row.original;
          const spouseName = row.spouse_name || row.spouse_relationship_name || 
            (row.spouse_relationship_id && relationships ? 
              (() => {
                const rel = relationships.find(r => Number(r.id) === Number(row.spouse_relationship_id));
                return rel ? `${rel.name || ""} ${rel.surname || ""}`.trim() : "-";
              })() : "-");
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
              {spouseName || "-"}
            </span>
          );
        },
      },
      {
        header: "Nikah Date",
        accessorKey: "nikah_date",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return value ? new Date(value).toLocaleDateString() : "-";
        },
      },
      {
        header: "Certificate",
        accessorKey: "certificate",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const cert = cell.getValue();
          const rowId = cell.row.original.id;
          return cert && (cert === "exists" || cell.row.original.certificate_filename) ? (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/nikahBonus/${rowId}/view-certificate`}
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
        header: "Image",
        accessorKey: "nikah_image",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const image = cell.getValue();
          const rowId = cell.row.original.id;
          return image && (image === "exists" || cell.row.original.nikah_image_filename) ? (
            <div className="d-flex justify-content-center">
              <a
                href={`${API_STREAM_BASE_URL}/nikahBonus/${rowId}/view-nikah-image`}
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
    [lookupData, isAdmin, relationships]
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Nikah Bonus</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Nikah Bonus
          </Button>
        )}
      </div>

      {(!nikahBonus || nikahBonus.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No nikah bonuses found. Click "Add Nikah Bonus" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={nikahBonus}
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
          {editItem ? "Edit" : "Add"} Nikah Bonus
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Spouse Name <span className="text-danger">*</span></Label>
                  <Controller 
                    name="spouse_relationship_id" 
                    control={control} 
                    rules={{ required: "Spouse name is required" }} 
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.spouse_relationship_id} disabled={isOrgExecutive} {...field}>
                        <option value="">Select Spouse</option>
                        {spouseRelationships.map((rel) => (
                          <option key={rel.id} value={rel.id}>
                            {rel.name || ""} {rel.surname || ""}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.spouse_relationship_id && <FormFeedback>{errors.spouse_relationship_id.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Nikah Date <span className="text-danger">*</span></Label>
                  <Controller 
                    name="nikah_date" 
                    control={control} 
                    rules={{ required: "Nikah date is required" }} 
                    render={({ field }) => <Input type="date" invalid={!!errors.nikah_date} disabled={isOrgExecutive} {...field} />} 
                  />
                  {errors.nikah_date && <FormFeedback>{errors.nikah_date.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Certificate</Label>
                  <Controller
                    name="Certificate"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => onChange(e.target.files)}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {editItem && (editItem.Certificate || editItem.certificate || editItem.Certificate_Filename || editItem.certificate_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-primary me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.Certificate_Filename || editItem.certificate_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.Certificate_Size || editItem.certificate_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/nikahBonus/${editItem.id}/view-certificate`}
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
              <Col md={6}>
                <FormGroup>
                  <Label>Nikah Image</Label>
                  <Controller
                    name="Nikah_Image"
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
                  {editItem && (editItem.Nikah_Image || editItem.nikah_image || editItem.Nikah_Image_Filename || editItem.nikah_image_filename) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <i className="bx bx-file font-size-24 text-primary me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{editItem.Nikah_Image_Filename || editItem.nikah_image_filename || "file"}</div>
                          <small className="text-muted">
                            {formatFileSize(editItem.Nikah_Image_Size || editItem.nikah_image_size)} • Current file
                          </small>
                        </div>
                        <a
                          href={`${API_STREAM_BASE_URL}/nikahBonus/${editItem.id}/view-nikah-image`}
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
                          id="acknowledgment-nikah"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledgment}
                        />
                        <Label check htmlFor="acknowledgment-nikah">
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
      <DeleteConfirmationModal isOpen={deleteModalOpen} toggle={hideDeleteConfirmation} onConfirm={confirmDelete} title="Delete Nikah Bonus" message={deleteItem?.message} itemName={deleteItem?.name} itemType={deleteItem?.type} loading={deleteLoading} />
    </>
  );
};

export default NikahBonusTab;
