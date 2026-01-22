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
import MapPicker from "../../../../components/Common/MapPicker";
import exifr from "exifr";

const BoreholeTab = ({ imamProfileId, borehole, lookupData, onUpdate, showAlert }) => {
  if (!imamProfileId) return null;
  const { isOrgExecutive, isAppAdmin, isGlobalAdmin } = useRole();
  const isAdmin = isAppAdmin || isGlobalAdmin;
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { deleteModalOpen, deleteItem, deleteLoading, showDeleteConfirmation, hideDeleteConfirmation, confirmDelete } = useDeleteConfirmation();
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm();

  const [selectedWaterUsagePurposeIds, setSelectedWaterUsagePurposeIds] = useState([]);
  const [showMap, setShowMap] = useState(true);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  useEffect(() => {
    if (modalOpen) {
      // Set water usage purpose IDs from editItem
      if (editItem?.water_usage_purpose_ids && Array.isArray(editItem.water_usage_purpose_ids)) {
        setSelectedWaterUsagePurposeIds(editItem.water_usage_purpose_ids.map(id => String(id)));
      } else {
        setSelectedWaterUsagePurposeIds([]);
      }
      
      setShowMap(true);
      
      reset({
        where_required: editItem?.where_required || "",
        has_electricity: editItem?.has_electricity || "",
        received_borehole_before: editItem?.received_borehole_before || "",
        current_water_source: editItem?.current_water_source || "",
        distance_to_water_source: editItem?.distance_to_water_source || "",
        beneficiaries_count: editItem?.beneficiaries_count || "",
        challenges_due_to_lack_of_water: editItem?.challenges_due_to_lack_of_water || "",
        motivation: editItem?.motivation || "",
        acknowledge: editItem?.acknowledge || false,
        status_id: editItem?.status_id || "1",
        comment: editItem?.comment || "",
        Current_Water_Source_Image: null,
        Masjid_Area_Image: null,
        Latitude: editItem?.latitude ? String(editItem.latitude) : "",
        Longitude: editItem?.longitude ? String(editItem.longitude) : "",
      });
    } else {
      setSelectedWaterUsagePurposeIds([]);
      setShowMap(false);
    }
  }, [editItem, modalOpen, reset]);

  const handleWaterUsagePurposeChange = (purposeId) => {
    const purposeIdStr = String(purposeId);
    const updated = selectedWaterUsagePurposeIds.includes(purposeIdStr)
      ? selectedWaterUsagePurposeIds.filter(id => id !== purposeIdStr)
      : [...selectedWaterUsagePurposeIds, purposeIdStr];
    setSelectedWaterUsagePurposeIds(updated);
  };

  const extractGPSFromImage = async (file) => {
    try {
      const exifData = await exifr.parse(file, {
        gps: true,
        pick: ['GPSLatitude', 'GPSLongitude', 'latitude', 'longitude']
      });

      if (exifData) {
        // Try different property names that exifr might return
        const lat = exifData.latitude || exifData.GPSLatitude || exifData.latitude?.value;
        const lng = exifData.longitude || exifData.GPSLongitude || exifData.longitude?.value;

        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          setValue("Latitude", lat.toString(), { shouldValidate: true });
          setValue("Longitude", lng.toString(), { shouldValidate: true });
          setShowMap(true);
          showAlert("GPS coordinates extracted from image successfully", "success");
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error extracting GPS from image:", error);
      return false;
    }
  };

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
      // Validate water usage purposes
      if (selectedWaterUsagePurposeIds.length === 0) {
        showAlert("Please select at least one water usage purpose", "danger");
        return;
      }

      // Validate required fields
      if (!data.beneficiaries_count || data.beneficiaries_count < 1) {
        showAlert("Please enter the number of beneficiaries (must be at least 1)", "danger");
        return;
      }

      if (!data.challenges_due_to_lack_of_water || data.challenges_due_to_lack_of_water.trim() === "") {
        showAlert("Please describe the challenges faced due to lack of clean water", "danger");
        return;
      }

      if (!data.motivation || data.motivation.trim() === "") {
        showAlert("Please write a motivation for why your community needs a borehole", "danger");
        return;
      }

      // Validate images for new records
      if (!editItem) {
        if (!data.Current_Water_Source_Image || data.Current_Water_Source_Image.length === 0) {
          showAlert("Please upload an image of the current water source", "danger");
          return;
        }
        if (!data.Masjid_Area_Image || data.Masjid_Area_Image.length === 0) {
          showAlert("Please upload an image of the Masjid/Area where the borehole will be", "danger");
          return;
        }
      }

      const hasCurrentWaterImage = data.Current_Water_Source_Image && data.Current_Water_Source_Image.length > 0;
      const hasMasjidAreaImage = data.Masjid_Area_Image && data.Masjid_Area_Image.length > 0;
      
      const formData = new FormData();
      formData.append("imam_profile_id", imamProfileId);
      formData.append("where_required", data.where_required ? String(data.where_required) : "");
      formData.append("has_electricity", data.has_electricity ? String(data.has_electricity) : "");
      formData.append("received_borehole_before", data.received_borehole_before ? String(data.received_borehole_before) : "");
      formData.append("current_water_source", data.current_water_source ? String(data.current_water_source) : "");
      formData.append("distance_to_water_source", data.distance_to_water_source || "");
      // Append water usage purpose IDs as JSON string (FormData doesn't handle arrays well)
      formData.append("water_usage_purpose_ids", JSON.stringify(selectedWaterUsagePurposeIds.map(id => parseInt(id))));
      formData.append("beneficiaries_count", data.beneficiaries_count || "");
      formData.append("challenges_due_to_lack_of_water", data.challenges_due_to_lack_of_water || "");
      formData.append("motivation", data.motivation || "");
      formData.append("longitude", data.Longitude || "");
      formData.append("latitude", data.Latitude || "");
      formData.append("acknowledge", data.acknowledge ? "true" : "false");
      formData.append("status_id", data.status_id || "1");
      formData.append("comment", data.comment || "");

      if (hasCurrentWaterImage) {
        formData.append("Current_Water_Source_Image", data.Current_Water_Source_Image[0]);
      }
      if (hasMasjidAreaImage) {
        formData.append("Masjid_Area_Image", data.Masjid_Area_Image[0]);
      }

      if (editItem) {
        formData.append("updated_by", getAuditName());
        await axiosApi.put(`${API_BASE_URL}/borehole/${editItem.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Borehole updated successfully", "success");
      } else {
        formData.append("created_by", getAuditName());
        await axiosApi.post(`${API_BASE_URL}/borehole`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("Borehole created successfully", "success");
      }
      onUpdate();
      toggleModal();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save borehole", "danger");
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    showDeleteConfirmation({ 
      id: editItem.id, 
      name: "Borehole Request", 
      type: "borehole", 
      message: "This borehole request will be permanently removed from the system." 
    }, async () => {
      await axiosApi.delete(`${API_BASE_URL}/borehole/${editItem.id}`);
      showAlert("Borehole deleted successfully", "success");
      onUpdate();
      if (modalOpen) {
        setModalOpen(false);
      }
    });
  };

  const handleApprove = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/borehole/${item.id}`, {
        status_id: 2,
        updated_by: getAuditName()
      });
      showAlert("Borehole request approved successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to approve borehole request", "danger");
    }
  };

  const handleDecline = async (item) => {
    try {
      await axiosApi.put(`${API_BASE_URL}/borehole/${item.id}`, {
        status_id: 3,
        updated_by: getAuditName()
      });
      showAlert("Borehole request declined successfully", "success");
      onUpdate();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to decline borehole request", "danger");
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
        header: "Where Required",
        accessorKey: "where_required",
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
            {cell.row.original.where_required_name || getLookupValue(lookupData?.boreholeLocation, cell.getValue()) || "-"}
          </span>
        ),
      },
      {
        header: "Has Electricity",
        accessorKey: "has_electricity",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => getLookupValue(lookupData?.yesNo, cell.getValue()),
      },
      {
        header: "Received Before",
        accessorKey: "received_borehole_before",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => getLookupValue(lookupData?.yesNo, cell.getValue()),
      },
      {
        header: "Water Source",
        accessorKey: "current_water_source",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.row.original.current_water_source_name || getLookupValue(lookupData?.waterSource, cell.getValue()) || "-",
      },
      {
        header: "Distance (km)",
        accessorKey: "distance_to_water_source",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() ? `${cell.getValue()}` : "-",
      },
      {
        header: "Water Usage",
        accessorKey: "water_usage_purposes",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          if (!value) return "-";
          const purposes = typeof value === 'string' ? value.split(',').map(p => p.trim()) : value;
          return purposes.length > 0 ? purposes.join(", ") : "-";
        },
      },
      {
        header: "Beneficiaries",
        accessorKey: "beneficiaries_count",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
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
        <h5 className="mb-0">Borehole</h5>
        {!isOrgExecutive && (
          <Button color="primary" size="sm" onClick={handleAdd}>
            <i className="bx bx-plus me-1"></i> Add Borehole Request
          </Button>
        )}
      </div>

      {(!borehole || borehole.length === 0) ? (
        <div className="alert alert-info" role="alert">
          <i className="bx bx-info-circle me-2"></i>
          No borehole requests found. Click "Add Borehole Request" to create one.
        </div>
      ) : (
        <TableContainer
          columns={columns}
          data={borehole}
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
          {editItem ? "Edit" : "Add"} Borehole Request
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label>Where is the borehole required? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="where_required" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        disabled={isOrgExecutive}
                        invalid={!!errors.where_required}
                        value={field.value ? String(field.value) : ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                      >
                        <option value="">Select...</option>
                        {(lookupData?.boreholeLocation || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.where_required && <FormFeedback>{errors.where_required.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Do you have electricity on the property? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="has_electricity" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        disabled={isOrgExecutive}
                        invalid={!!errors.has_electricity}
                        {...field}
                      >
                        <option value="">Select...</option>
                        {(lookupData?.yesNo || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.has_electricity && <FormFeedback>{errors.has_electricity.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Have you received a borehole from the IDP before? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="received_borehole_before" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        disabled={isOrgExecutive}
                        invalid={!!errors.received_borehole_before}
                        {...field}
                      >
                        <option value="">Select...</option>
                        {(lookupData?.yesNo || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.received_borehole_before && <FormFeedback>{errors.received_borehole_before.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>What is the current source of water in your area? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="current_water_source" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="select" 
                        disabled={isOrgExecutive}
                        invalid={!!errors.current_water_source}
                        value={field.value ? String(field.value) : ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                      >
                        <option value="">Select...</option>
                        {(lookupData?.waterSource || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.current_water_source && <FormFeedback>{errors.current_water_source.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>What is the distance to the current water source? (KM) <span className="text-danger">*</span></Label>
                  <Controller 
                    name="distance_to_water_source" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        disabled={isOrgExecutive}
                        invalid={!!errors.distance_to_water_source}
                        {...field} 
                      />
                    )} 
                  />
                  {errors.distance_to_water_source && <FormFeedback>{errors.distance_to_water_source.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>What will the water be used for? <span className="text-danger">*</span></Label>
                  <div>
                    {(lookupData?.waterUsagePurpose || []).map((item) => (
                      <FormGroup check key={item.id} className="mb-2">
                        <Input
                          type="checkbox"
                          id={`water_usage_${item.id}`}
                          checked={selectedWaterUsagePurposeIds.includes(String(item.id))}
                          onChange={() => handleWaterUsagePurposeChange(item.id)}
                          disabled={isOrgExecutive}
                        />
                        <Label check for={`water_usage_${item.id}`} className="ms-2">
                          {item.name}
                        </Label>
                      </FormGroup>
                    ))}
                  </div>
                  {selectedWaterUsagePurposeIds.length === 0 && (
                    <small className="text-danger">Please select at least one option</small>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>How many people will benefit/make use of this borehole? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="beneficiaries_count" 
                    control={control} 
                    rules={{ required: "This field is required", min: { value: 1, message: "Must be at least 1" } }}
                    render={({ field }) => (
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Enter number" 
                        disabled={isOrgExecutive}
                        invalid={!!errors.beneficiaries_count}
                        {...field} 
                      />
                    )} 
                  />
                  {errors.beneficiaries_count && <FormFeedback>{errors.beneficiaries_count.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>What are the main challenges faced due to the lack of clean water? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="challenges_due_to_lack_of_water" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="textarea" 
                        rows="3"
                        placeholder="Describe the challenges..." 
                        disabled={isOrgExecutive}
                        invalid={!!errors.challenges_due_to_lack_of_water}
                        {...field} 
                      />
                    )} 
                  />
                  {errors.challenges_due_to_lack_of_water && <FormFeedback>{errors.challenges_due_to_lack_of_water.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Write a motivation as to why your community needs a borehole and how they will benefit from the new borehole <span className="text-danger">*</span></Label>
                  <Controller 
                    name="motivation" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input 
                        type="textarea" 
                        rows="4"
                        placeholder="Write your motivation..." 
                        disabled={isOrgExecutive}
                        invalid={!!errors.motivation}
                        {...field} 
                      />
                    )} 
                  />
                  {errors.motivation && <FormFeedback>{errors.motivation.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Include Images of the current water source <span className="text-danger">*</span></Label>
                  <Controller 
                    name="Current_Water_Source_Image" 
                    control={control} 
                    rules={{ 
                      validate: (files) => {
                        if (!editItem && (!files || files.length === 0)) {
                          return "Image is required";
                        }
                        return true;
                      }
                    }}
                    render={({ field: { onChange, value, ...field } }) => (
                      <div>
                        <Input 
                          type="file" 
                          accept="image/*"
                          disabled={isOrgExecutive}
                          invalid={!!errors.Current_Water_Source_Image}
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          {...field}
                        />
                        {editItem && (editItem.current_water_source_image || editItem.current_water_source_image_filename) && (
                          <div className="mt-2 p-2 border rounded bg-light">
                            <div className="d-flex align-items-center">
                              <i className="bx bx-image font-size-24 text-primary me-2"></i>
                              <div className="flex-grow-1">
                                <div className="fw-medium">{editItem.current_water_source_image_filename || "current_water_source_image"}</div>
                                <small className="text-muted">
                                  {formatFileSize(editItem.current_water_source_image_size)} • Current file
                                </small>
                              </div>
                              <a
                                href={`${API_STREAM_BASE_URL}/borehole/${editItem.id}/view-current-water-source-image`}
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
                      </div>
                    )} 
                  />
                  {errors.Current_Water_Source_Image && <FormFeedback>{errors.Current_Water_Source_Image.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Image of the Masjid/Area where the borehole will be <span className="text-danger">*</span></Label>
                  <Controller 
                    name="Masjid_Area_Image" 
                    control={control} 
                    rules={{ 
                      validate: (files) => {
                        if (!editItem && (!files || files.length === 0)) {
                          return "Image is required";
                        }
                        return true;
                      }
                    }}
                    render={({ field: { onChange, value, ...field } }) => (
                      <div>
                        <Input 
                          type="file" 
                          accept="image/*"
                          capture="environment"
                          disabled={isOrgExecutive}
                          invalid={!!errors.Masjid_Area_Image}
                          onChange={async (e) => {
                            const files = e.target.files;
                            onChange(files);
                            if (files && files.length > 0) {
                              setShowMap(true);
                              // Try to extract GPS coordinates from image metadata
                              const hasGPS = await extractGPSFromImage(files[0]);
                              if (!hasGPS) {
                                showAlert("No GPS data found in image. Please use the map below to select the location.", "info");
                              }
                            }
                          }}
                          {...field}
                        />
                        <small className="text-muted d-block mt-1">GPS coordinates will be automatically extracted from the image if available. Otherwise, use the map below to select the location.</small>
                        {editItem && (editItem.masjid_area_image || editItem.masjid_area_image_filename) && (
                          <div className="mt-2 p-2 border rounded bg-light">
                            <div className="d-flex align-items-center">
                              <i className="bx bx-image font-size-24 text-primary me-2"></i>
                              <div className="flex-grow-1">
                                <div className="fw-medium">{editItem.masjid_area_image_filename || "masjid_area_image"}</div>
                                <small className="text-muted">
                                  {formatFileSize(editItem.masjid_area_image_size)} • Current file
                                </small>
                              </div>
                              <a
                                href={`${API_STREAM_BASE_URL}/borehole/${editItem.id}/view-masjid-area-image`}
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
                      </div>
                    )} 
                  />
                  {errors.Masjid_Area_Image && <FormFeedback>{errors.Masjid_Area_Image.message}</FormFeedback>}
                </FormGroup>
              </Col>
              
              {/* Map Picker - Always visible for location selection */}
              {showMap && (
                <Col md={12}>
                  <MapPicker
                    latitude={watch("Latitude") || ""}
                    longitude={watch("Longitude") || ""}
                    onLocationChange={(lat, lng) => {
                      setValue("Latitude", lat.toString(), { shouldValidate: true });
                      setValue("Longitude", lng.toString(), { shouldValidate: true });
                    }}
                    showMap={showMap}
                  />
                </Col>
              )}

              {/* Longitude and Latitude - Visible inputs for display only (read-only) */}
              <Col md={6}>
                <FormGroup>
                  <Label>Longitude</Label>
                  <Controller
                    name="Longitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter longitude (e.g., 28.2293)"
                        readOnly
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Longitude is set automatically from the map or image GPS data
                  </small>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label>Latitude</Label>
                  <Controller
                    name="Latitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter latitude (e.g., -25.7479)"
                        readOnly
                        disabled={isOrgExecutive}
                        {...field}
                      />
                    )}
                  />
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Latitude is set automatically from the map or image GPS data
                  </small>
                </FormGroup>
              </Col>
              {isOrgExecutive && (
                <>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Status</Label>
                      <Controller 
                        name="status_id" 
                        control={control} 
                        render={({ field }) => (
                          <Input 
                            type="select" 
                            {...field}
                          >
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
                  <Col md={12}>
                    <FormGroup>
                      <Label>Comment</Label>
                      <Controller 
                        name="comment" 
                        control={control} 
                        render={({ field }) => (
                          <Input 
                            type="textarea" 
                            rows="3" 
                            placeholder="Add comments..." 
                            {...field} 
                          />
                        )} 
                      />
                    </FormGroup>
                  </Col>
                </>
              )}
              <Col md={12}>
                <FormGroup check>
                  <Controller 
                    name="acknowledge" 
                    control={control} 
                    rules={{ required: "You must acknowledge the statement to proceed" }} 
                    render={({ field }) => (
                      <>
                        <Input 
                          type="checkbox" 
                          id="acknowledgment-borehole"
                          checked={field.value || false} 
                          onChange={(e) => field.onChange(e.target.checked)} 
                          disabled={isOrgExecutive}
                          invalid={!!errors.acknowledge}
                        />
                        <Label check htmlFor="acknowledgment-borehole">
                          I swear by Allah, the All-Hearing and the All-Seeing, that I have completed this form truthfully and honestly, to the best of my knowledge and belief.
                        </Label>
                        {errors.acknowledge && (
                          <FormFeedback>{errors.acknowledge.message}</FormFeedback>
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

export default BoreholeTab;

