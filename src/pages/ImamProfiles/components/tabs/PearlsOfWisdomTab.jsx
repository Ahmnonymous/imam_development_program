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
import { API_BASE_URL } from "../../../../helpers/url_helper";
import { getAuditName } from "../../../../helpers/userStorage";

const PearlsOfWisdomTab = ({ imamProfileId, pearls, lookupData, onUpdate, showAlert }) => {
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

  useEffect(() => {
    if (modalOpen) {
      reset({
        Resource_Type: editItem?.resource_type || "",
        Resource_Title: editItem?.resource_title || "",
        Author_Speaker: editItem?.author_speaker || "",
        Heading_Description: editItem?.heading_description || "",
        Pearl_One: editItem?.pearl_one || "",
        Pearl_Two: editItem?.pearl_two || "",
        Pearl_Three: editItem?.pearl_three || "",
        Pearl_Four: editItem?.pearl_four || "",
        Pearl_Five: editItem?.pearl_five || "",
        Acknowledge: editItem?.acknowledge || false,
        Status_ID: editItem?.status_id || "",
        Comment: editItem?.comment || "",
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
      const payload = {
        imam_profile_id: imamProfileId,
        resource_type: data.Resource_Type && data.Resource_Type !== "" ? parseInt(data.Resource_Type) : null,
        resource_title: data.Resource_Title,
        author_speaker: data.Author_Speaker || null,
        heading_description: data.Heading_Description || null,
        pearl_one: data.Pearl_One,
        pearl_two: data.Pearl_Two || null,
        pearl_three: data.Pearl_Three || null,
        pearl_four: data.Pearl_Four || null,
        pearl_five: data.Pearl_Five || null,
        acknowledge: data.Acknowledge || false,
        status_id: data.Status_ID && data.Status_ID !== "" ? parseInt(data.Status_ID) : 1,
        comment: data.Comment || null,
      };

      if (editItem) {
        payload.updated_by = getAuditName();
        await axiosApi.put(`${API_BASE_URL}/pearlsOfWisdom/${editItem.id}`, payload);
        showAlert("Pearl of Wisdom has been updated successfully", "success");
      } else {
        payload.created_by = getAuditName();
        await axiosApi.post(`${API_BASE_URL}/pearlsOfWisdom`, payload);
        showAlert("Pearl of Wisdom has been added successfully", "success");
      }

      onUpdate();
      toggleModal();
    } catch (error) {
      console.error("Error saving pearl of wisdom:", error);
      showAlert(error?.response?.data?.message || "Operation failed", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;

    const title = editItem.resource_title || 'Unknown Resource';
    
    showDeleteConfirmation({
      id: editItem.id,
      name: title,
      type: "pearl of wisdom",
      message: "This pearl of wisdom will be permanently removed from the system."
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/pearlsOfWisdom/${editItem.id}`);
      showAlert("Pearl of Wisdom has been deleted successfully", "success");
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
        header: "Resource Type",
        accessorKey: "resource_type",
        enableSorting: false,
        cell: (cell) => {
          const value = getLookupName(lookupData.resourceType || [], cell.row.original.resource_type);
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
        header: "Resource Title",
        accessorKey: "resource_title",
        enableSorting: true,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Author/Speaker",
        accessorKey: "author_speaker",
        enableSorting: true,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Status",
        accessorKey: "status_id",
        enableSorting: false,
        cell: (cell) => getLookupName(lookupData.status || [], cell.row.original.status_id),
      },
      {
        header: "Date",
        accessorKey: "datestamp",
        enableSorting: true,
        cell: (cell) => {
          const date = cell.getValue();
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
    ],
    []
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Pearls of Wisdom</h5>
        {!isOrgExecutive && imamProfileId && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Pearl
          </Button>
        )}
      </div>

      {!imamProfileId ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          Please create the Imam Profile first before adding pearls of wisdom.
        </div>
      ) : pearls.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No pearls of wisdom found. Click "Add Pearl" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={pearls || []}
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
          {editItem ? "Edit" : "Add"} Pearl of Wisdom
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="Resource_Type">Resource Type</Label>
                  <Controller
                    name="Resource_Type"
                    control={control}
                    render={({ field }) => (
                      <Input id="Resource_Type" type="select" disabled={isOrgExecutive} {...field}>
                        <option value="">Select Resource Type</option>
                        {(lookupData.resourceType || []).map((item) => (
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
                  <Label for="Resource_Title">
                    Resource Title <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Resource_Title"
                    control={control}
                    rules={{ required: "Resource Title is required" }}
                    render={({ field }) => (
                      <Input
                        id="Resource_Title"
                        type="text"
                        invalid={!!errors.Resource_Title}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Resource_Title && <FormFeedback>{errors.Resource_Title.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Author_Speaker">Author/Speaker</Label>
                  <Controller
                    name="Author_Speaker"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Author_Speaker"
                        type="text"
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Heading_Description">Heading/Description</Label>
                  <Controller
                    name="Heading_Description"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Heading_Description"
                        type="textarea"
                        rows="3"
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Pearl_One">
                    Pearl One <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="Pearl_One"
                    control={control}
                    rules={{ required: "Pearl One is required" }}
                    render={({ field }) => (
                      <Input
                        id="Pearl_One"
                        type="textarea"
                        rows="3"
                        invalid={!!errors.Pearl_One}
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  {errors.Pearl_One && <FormFeedback>{errors.Pearl_One.message}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Pearl_Two">Pearl Two</Label>
                  <Controller
                    name="Pearl_Two"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Pearl_Two"
                        type="textarea"
                        rows="3"
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Pearl_Three">Pearl Three</Label>
                  <Controller
                    name="Pearl_Three"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Pearl_Three"
                        type="textarea"
                        rows="3"
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Pearl_Four">Pearl Four</Label>
                  <Controller
                    name="Pearl_Four"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Pearl_Four"
                        type="textarea"
                        rows="3"
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="Pearl_Five">Pearl Five</Label>
                  <Controller
                    name="Pearl_Five"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="Pearl_Five"
                        type="textarea"
                        rows="3"
                        disabled={isOrgExecutive}
                        {...field}
                      />
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

