import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Alert,
} from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import DeleteConfirmationModal from "../../components/Common/DeleteConfirmationModal";
import useDeleteConfirmation from "../../hooks/useDeleteConfirmation";
import { useRole } from "../../helpers/useRole";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuditName } from "../../helpers/userStorage";

// Redux actions
import {
  fetchLookup,
  createLookup,
  updateLookup,
  deleteLookup,
} from "../../store/actions";

const TableView = () => {
  const { table } = useParams();
  const dispatch = useDispatch();
  const { isOrgExecutive, isGlobalAdmin } = useRole(); // Read-only check

  const isHadithTable = table === "Hadith";
  const isCurrencyTable = table === "Currency";
  const isCountryTable = table === "Country";
  const isProvinceTable = table === "Province";
  const isSuburbTable = table === "Suburb";
  const isReadOnly = isOrgExecutive || (isHadithTable && !isGlobalAdmin);

  const { data, loading, error } = useSelector((state) => state.Lookup);
  const tableData = data[table] || [];

  // Fetch related lookup data for Province and Suburb
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);

  // Fetch Countries when viewing Province or Suburb
  useEffect(() => {
    if (isProvinceTable || isSuburbTable) {
      if (!data.Country || data.Country.length === 0) {
        dispatch(fetchLookup("Country"));
      } else {
        setCountries(data.Country);
      }
    }
  }, [isProvinceTable, isSuburbTable, dispatch, data.Country]);

  // Fetch Provinces when viewing Suburb
  useEffect(() => {
    if (isSuburbTable) {
      if (!data.Province || data.Province.length === 0) {
        dispatch(fetchLookup("Province"));
      } else {
        setProvinces(data.Province);
      }
    }
  }, [isSuburbTable, dispatch, data.Province]);

  // Update local state when Redux data changes
  useEffect(() => {
    if (data.Country && (isProvinceTable || isSuburbTable)) {
      setCountries(data.Country);
    }
    if (data.Province && isSuburbTable) {
      setProvinces(data.Province);
    }
  }, [data.Country, data.Province, isProvinceTable, isSuburbTable]);

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // --- Lookup Dialog State ---
  const [alert, setAlert] = useState(null);
  const primaryInputRef = useRef(null);

  // Delete confirmation hook
  const {
    deleteModalOpen,
    deleteItem,
    deleteLoading,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    confirmDelete
  } = useDeleteConfirmation();

  const defaultFormValues = useMemo(
    () => {
      if (isHadithTable) {
        return { hadith_arabic: "", hadith_english: "" };
      } else if (isCurrencyTable || isCountryTable) {
        return { name: "", code: "" };
      } else if (isProvinceTable) {
        return { name: "", country_id: "" };
      } else if (isSuburbTable) {
        return { name: "", province_id: "" };
      }
      return { name: "" };
    },
    [isHadithTable, isCurrencyTable, isCountryTable, isProvinceTable, isSuburbTable]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (table) {
      dispatch(fetchLookup(table));
    }
  }, [table, dispatch]);

  // Focus + reset logic for dialog
useEffect(() => {
  if (showDialog) {
    if (isHadithTable) {
      reset({
        hadith_arabic: editItem?.hadith_arabic || "",
        hadith_english: editItem?.hadith_english || "",
      });
    } else if (isCurrencyTable || isCountryTable) {
      reset({
        name: editItem?.name || "",
        code: editItem?.code || "",
      });
    } else if (isProvinceTable) {
      reset({
        name: editItem?.name || "",
        country_id: editItem?.country_id || "",
      });
    } else if (isSuburbTable) {
      reset({
        name: editItem?.name || "",
        province_id: editItem?.province_id || "",
      });
    } else {
      reset({ name: editItem?.name || "" });
    }
    setTimeout(() => {
      if (primaryInputRef.current) primaryInputRef.current.focus();
    }, 100);
  }
}, [showDialog, editItem, reset, isHadithTable, isCurrencyTable, isCountryTable, isProvinceTable, isSuburbTable]);

  // --- Dialog alert helpers ---
  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const getAlertIcon = (color) => {
    switch (color) {
      case "success":
        return "mdi mdi-check-all";
      case "danger":
        return "mdi mdi-block-helper";
      case "warning":
        return "mdi mdi-alert-outline";
      case "info":
        return "mdi mdi-alert-circle-outline";
      case "primary":
        return "mdi mdi-bullseye-arrow";
      default:
        return "mdi mdi-information";
    }
  };

  const getAlertBackground = (color) => {
    switch (color) {
      case "success":
        return "#d4edda";
      case "danger":
        return "#f8d7da";
      case "warning":
        return "#fff3cd";
      case "info":
        return "#d1ecf1";
      case "primary":
        return "#cce5ff";
      default:
        return "#f8f9fa";
    }
  };

  const getAlertBorder = (color) => {
    switch (color) {
      case "success":
        return "#c3e6cb";
      case "danger":
        return "#f5c6cb";
      case "warning":
        return "#ffeaa7";
      case "info":
        return "#bee5eb";
      case "primary":
        return "#b8daff";
      default:
        return "#dee2e6";
    }
  };

  // --- Table logic ---
  const handleAdd = () => {
    if (isReadOnly) {
      showAlert(
        `You have read-only access to ${formatTableName(table)} records.`,
        "info"
      );
      return;
    }
    setEditItem(null);
    setShowDialog(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowDialog(true);
  };

  const handleSave = async (formData) => {
    if (isReadOnly) {
      setShowDialog(false);
      return;
    }

    try {
      // Add audit fields based on workspace rules
      let payload;
      if (isHadithTable) {
        payload = {
          hadith_arabic: formData.hadith_arabic?.trim(),
          hadith_english: formData.hadith_english?.trim(),
        };
      } else if (isCurrencyTable || isCountryTable) {
        payload = {
          name: formData.name?.trim(),
          code: formData.code?.trim() || null,
        };
      } else if (isProvinceTable) {
        payload = {
          name: formData.name?.trim(),
          country_id: formData.country_id ? parseInt(formData.country_id) : null,
        };
      } else if (isSuburbTable) {
        payload = {
          name: formData.name?.trim(),
          province_id: formData.province_id ? parseInt(formData.province_id) : null,
        };
      } else {
        payload = {
          name: formData.name?.trim(),
        };
      }

      const auditUser = getAuditName();
      const timestamp = new Date().toISOString();

      if (editItem) {
        payload.updated_by = auditUser;
        if (isHadithTable) {
          payload.updated_on = timestamp;
        }
      } else {
        payload.created_by = auditUser;
        if (isHadithTable) {
          payload.created_on = timestamp;
        }
      }

      if (editItem) {
        await dispatch(updateLookup(table, editItem.id, payload));
      } else {
        await dispatch(createLookup(table, payload));
      }

      await dispatch(fetchLookup(table));
      showAlert(
        `${formatTableName(table)} has been ${
          editItem ? "updated" : "added"
        } successfully.`,
        "success"
      );

      setShowDialog(false);
      setEditItem(null);
    } catch (err) {
      console.error("Save failed:", err);
      showAlert(err?.message || "Operation failed", "danger");
    }
  };

  const handleDelete = async (item) => {
    try {
      await dispatch(deleteLookup(table, item.id));
      await dispatch(fetchLookup(table));
      showAlert(`${formatTableName(table)} has been deleted successfully.`, "success");
      setShowDialog(false);
      setEditItem(null);
    } catch (err) {
      console.error("Delete failed:", err);
      showAlert(err?.message || "Delete failed", "danger");
    }
  };

  const handleDeleteClick = () => {
    if (!editItem || isReadOnly) return;

    const itemName = isHadithTable
      ? editItem.hadith_english ||
        editItem.hadith_arabic ||
        `${formatTableName(table)} #${editItem.id}`
      : editItem.name ||
        editItem.title ||
        `${formatTableName(table)} #${editItem.id}`;

    showDeleteConfirmation(
      {
        id: editItem.id,
        name: itemName,
        type: formatTableName(table).toLowerCase(),
        message: `This ${formatTableName(
          table
        ).toLowerCase()} will be permanently removed from the system.`,
      },
      async () => {
        await handleDelete(editItem);
      }
    );
  };

  const handleClose = () => {
    reset(defaultFormValues);
    setShowDialog(false);
  };

  const formatDateValue = (value, includeTime = false) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return includeTime ? parsed.toLocaleString() : parsed.toLocaleDateString();
  };

  const columns = useMemo(() => {
    const commonAuditColumns = [
      {
        header: "Created By",
        accessorKey: "created_by",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "-",
      },
      {
        header: "Created On",
        accessorKey: isHadithTable ? "created_on" : "created_at",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) =>
          formatDateValue(cell.getValue(), isHadithTable /* include time */),
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
        accessorKey: isHadithTable ? "updated_on" : "updated_at",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) =>
          formatDateValue(cell.getValue(), isHadithTable /* include time */),
      },
    ];

    if (isHadithTable) {
      return [
        {
          header: "Hadith (Arabic)",
          accessorKey: "hadith_arabic",
          enableSorting: false,
          enableColumnFilter: false,
          cell: (cell) => (
            <span
              className={!isReadOnly ? "lookup-primary-cell interactive" : "lookup-primary-cell"}
              onClick={() => !isReadOnly && handleEdit(cell.row.original)}
            >
              {cell.getValue()}
            </span>
          ),
        },
        {
          header: "Hadith (English)",
          accessorKey: "hadith_english",
          enableSorting: false,
          enableColumnFilter: false,
          cell: (cell) => (
            <span style={{ whiteSpace: "normal" }}>{cell.getValue()}</span>
          ),
        },
        ...commonAuditColumns,
      ];
    }

    if (isProvinceTable) {
      return [
        {
          header: "Name",
          accessorKey: "name",
          enableSorting: true,
          enableColumnFilter: false,
          cell: (cell) => (
            <span
              className={!isReadOnly ? "lookup-primary-cell interactive" : "lookup-primary-cell"}
              onClick={() => !isReadOnly && handleEdit(cell.row.original)}
            >
              {cell.getValue()}
            </span>
          ),
        },
        {
          header: "Country",
          accessorKey: "country_id",
          enableSorting: true,
          enableColumnFilter: false,
          cell: (cell) => {
            const countryId = cell.getValue();
            const country = countries.find(c => c.id === countryId || c.ID === countryId);
            return <span>{country ? (country.name || country.Name) : "-"}</span>;
          },
        },
        ...commonAuditColumns,
      ];
    }

    if (isSuburbTable) {
      return [
        {
          header: "Name",
          accessorKey: "name",
          enableSorting: true,
          enableColumnFilter: false,
          cell: (cell) => (
            <span
              className={!isReadOnly ? "lookup-primary-cell interactive" : "lookup-primary-cell"}
              onClick={() => !isReadOnly && handleEdit(cell.row.original)}
            >
              {cell.getValue()}
            </span>
          ),
        },
        {
          header: "Province",
          accessorKey: "province_id",
          enableSorting: true,
          enableColumnFilter: false,
          cell: (cell) => {
            const provinceId = cell.getValue();
            const province = provinces.find(p => p.id === provinceId || p.ID === provinceId);
            return <span>{province ? (province.name || province.Name) : "-"}</span>;
          },
        },
        {
          header: "Country",
          enableSorting: false,
          enableColumnFilter: false,
          cell: (cell) => {
            const provinceId = cell.row.original.province_id || cell.row.original.Province_ID;
            const province = provinces.find(p => (p.id === provinceId || p.ID === provinceId));
            if (province) {
              const countryId = province.country_id || province.Country_ID || province.country_ID;
              const country = countries.find(c => (c.id === countryId || c.ID === countryId));
              return <span>{country ? (country.name || country.Name) : "-"}</span>;
            }
            return <span>-</span>;
          },
        },
        ...commonAuditColumns,
      ];
    }

    return [
      {
        header: "Name",
        accessorKey: "name",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (cell) => (
          <span
            className={!isReadOnly ? "lookup-primary-cell interactive" : "lookup-primary-cell"}
            onClick={() => !isReadOnly && handleEdit(cell.row.original)}
          >
            {cell.getValue()}
          </span>
        ),
      },
      ...commonAuditColumns,
    ];
  }, [tableData, isHadithTable, isCurrencyTable, isCountryTable, isProvinceTable, isSuburbTable, isReadOnly, countries, provinces]);

  const formatTableName = (tableName) => tableName.replace(/_/g, " ");
  document.title = `${formatTableName(table)} | Lookup Setup`;

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Lookup Setup" breadcrumbItem={formatTableName(table)} />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Row className="mb-3">
                  <Col sm={6}>
                    <div className="d-flex align-items-center">
                      <Link to="/lookups" className="btn btn-light btn-sm me-2">
                        <i className="bx bx-arrow-back"></i> Back
                      </Link>
                      <h4 className="card-title mb-0">
                        {formatTableName(table)}
                        {isReadOnly && <span className="ms-2 badge bg-info">Read Only</span>}
                      </h4>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-sm-end">
                      {!isReadOnly && (
                        <Button color="primary" style={{ borderRadius: 0 }} onClick={handleAdd}>
                          <i className="mdi mdi-plus me-1"></i> Add New
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>

                {loading && (
                  <div className="text-center my-5">
                    <Spinner color="primary" />
                    <p className="mt-2 text-muted">Loading data...</p>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bx bx-error-circle me-2"></i>
                    {error}
                  </div>
                )}

                {!loading && tableData.length === 0 && (
                  <div className="alert alert-info" role="alert">
                    <i className="bx bx-info-circle me-2"></i>
                    No {formatTableName(table)} found.{" "}
                    {isReadOnly
                      ? "You currently have read-only access to this lookup."
                      : 'Click "Add New" to create one.'}
                  </div>
                )}

                {!loading && !error && tableData.length !== 0 && (
                  <TableContainer
                    columns={columns}
                    data={tableData || []}
                    isGlobalFilter={true}
                    isPagination={true}
                    isCustomPageSize={true}
                    SearchPlaceholder={`Search ${formatTableName(table)}...`}
                    pagination="pagination"
                    paginationWrapper="dataTables_paginate paging_simple_numbers"
                    tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Merged LookupDialog */}
        {alert && (
          <div
            className="position-fixed top-0 end-0 p-3"
            style={{ zIndex: 1060, minWidth: "300px", maxWidth: "500px" }}
          >
            <Alert
              color={alert.color}
              isOpen={!!alert}
              toggle={() => setAlert(null)}
              className="alert-dismissible fade show shadow-lg"
              role="alert"
              style={{
                opacity: 1,
                backgroundColor: getAlertBackground(alert.color),
                border: `1px solid ${getAlertBorder(alert.color)}`,
                color: "#000",
              }}
            >
              <i className={`${getAlertIcon(alert.color)} me-2`}></i>
              {alert.message}
            </Alert>
          </div>
        )}

        <Modal
          isOpen={showDialog}
          toggle={handleClose}
          centered
          size={isHadithTable ? "lg" : "md"}
          backdrop="static"
        >
          <ModalHeader toggle={handleClose}>
            <i
              className={`bx ${
                editItem
                  ? isReadOnly
                    ? "bx-show"
                    : "bx-edit"
                  : "bx-plus-circle"
              } me-2`}
            ></i>
            {editItem
              ? `${isReadOnly ? "View" : "Edit"} ${formatTableName(table)}`
              : `Add New ${formatTableName(table)}`}
          </ModalHeader>

          <Form onSubmit={handleSubmit(handleSave)}>
            <ModalBody>
              {isHadithTable ? (
                <>
                  <FormGroup>
                    <Label for="hadith_arabic">
                      Hadith (Arabic) <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      name="hadith_arabic"
                      control={control}
                      rules={{
                        required: "Arabic text is required",
                        minLength: {
                          value: 4,
                          message: "Arabic text must be at least 4 characters",
                        },
                      }}
                      render={({ field }) => {
                        const { ref, ...fieldProps } = field;
                        return (
                          <Input
                            type="textarea"
                            id="hadith_arabic"
                            rows="4"
                            placeholder="Enter the Hadith in Arabic"
                            invalid={!!errors.hadith_arabic}
                            disabled={isReadOnly}
                            innerRef={(element) => {
                              primaryInputRef.current = element;
                              ref(element);
                            }}
                            {...fieldProps}
                          />
                        );
                      }}
                    />
                    {errors.hadith_arabic && (
                      <FormFeedback>{errors.hadith_arabic.message}</FormFeedback>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label for="hadith_english">
                      Hadith (English Translation){" "}
                      <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      name="hadith_english"
                      control={control}
                      rules={{
                        required: "English translation is required",
                        minLength: {
                          value: 4,
                          message:
                            "English translation must be at least 4 characters",
                        },
                      }}
                      render={({ field }) => {
                        const { ref, ...fieldProps } = field;
                        return (
                          <Input
                            type="textarea"
                            id="hadith_english"
                            rows="4"
                            placeholder="Enter the Hadith translation in English"
                            invalid={!!errors.hadith_english}
                            disabled={isReadOnly}
                            innerRef={ref}
                            {...fieldProps}
                          />
                        );
                      }}
                    />
                    {errors.hadith_english && (
                      <FormFeedback>{errors.hadith_english.message}</FormFeedback>
                    )}
                  </FormGroup>
                </>
              ) : isCurrencyTable || isCountryTable ? (
                <>
                  <FormGroup>
                    <Label for="name">
                      Name <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      name="name"
                      control={control}
                      rules={{
                        required: "Name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters",
                        },
                        maxLength: {
                          value: 255,
                          message: "Name must not exceed 255 characters",
                        },
                      }}
                      render={({ field }) => {
                        const { ref, ...fieldProps } = field;
                        return (
                          <Input
                            id="name"
                            placeholder="Enter name"
                            invalid={!!errors.name}
                            disabled={isReadOnly}
                            innerRef={(element) => {
                              primaryInputRef.current = element;
                              ref(element);
                            }}
                            {...fieldProps}
                          />
                        );
                      }}
                    />
                    {errors.name && (
                      <FormFeedback>{errors.name.message}</FormFeedback>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label for="code">
                      Code {isCurrencyTable ? "(e.g., USD, ZAR)" : "(e.g., ZA, US)"}
                    </Label>
                    <Controller
                      name="code"
                      control={control}
                      rules={{
                        maxLength: {
                          value: 10,
                          message: "Code must not exceed 10 characters",
                        },
                        pattern: {
                          value: /^[A-Z0-9]*$/,
                          message: "Code must contain only uppercase letters and numbers",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          id="code"
                          placeholder={isCurrencyTable ? "Enter currency code (e.g., USD)" : "Enter country code (e.g., ZA)"}
                          invalid={!!errors.code}
                          disabled={isReadOnly}
                          style={{ textTransform: "uppercase" }}
                          {...field}
                        />
                      )}
                    />
                    {errors.code && (
                      <FormFeedback>{errors.code.message}</FormFeedback>
                    )}
                  </FormGroup>
                </>
              ) : isProvinceTable ? (
                <>
                  <FormGroup>
                    <Label for="name">
                      Province Name <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      name="name"
                      control={control}
                      rules={{
                        required: "Province name is required",
                        minLength: {
                          value: 2,
                          message: "Province name must be at least 2 characters",
                        },
                        maxLength: {
                          value: 255,
                          message: "Province name must not exceed 255 characters",
                        },
                      }}
                      render={({ field }) => {
                        const { ref, ...fieldProps } = field;
                        return (
                          <Input
                            id="name"
                            placeholder="Enter province name"
                            invalid={!!errors.name}
                            disabled={isReadOnly}
                            innerRef={(element) => {
                              primaryInputRef.current = element;
                              ref(element);
                            }}
                            {...fieldProps}
                          />
                        );
                      }}
                    />
                    {errors.name && (
                      <FormFeedback>{errors.name.message}</FormFeedback>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label for="country_id">
                      Country <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      name="country_id"
                      control={control}
                      rules={{
                        required: "Country is required",
                      }}
                      render={({ field }) => (
                        <Input
                          id="country_id"
                          type="select"
                          invalid={!!errors.country_id}
                          disabled={isReadOnly || countries.length === 0}
                          {...field}
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country.id || country.ID} value={country.id || country.ID}>
                              {country.name || country.Name} {country.code || country.Code ? `(${country.code || country.Code})` : ""}
                            </option>
                          ))}
                        </Input>
                      )}
                    />
                    {errors.country_id && (
                      <FormFeedback>{errors.country_id.message}</FormFeedback>
                    )}
                    {countries.length === 0 && (
                      <small className="text-muted">Please add countries first before creating provinces.</small>
                    )}
                  </FormGroup>
                </>
              ) : isSuburbTable ? (
                <>
                  <FormGroup>
                    <Label for="name">
                      Suburb Name <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      name="name"
                      control={control}
                      rules={{
                        required: "Suburb name is required",
                        minLength: {
                          value: 2,
                          message: "Suburb name must be at least 2 characters",
                        },
                        maxLength: {
                          value: 255,
                          message: "Suburb name must not exceed 255 characters",
                        },
                      }}
                      render={({ field }) => {
                        const { ref, ...fieldProps } = field;
                        return (
                          <Input
                            id="name"
                            placeholder="Enter suburb name"
                            invalid={!!errors.name}
                            disabled={isReadOnly}
                            innerRef={(element) => {
                              primaryInputRef.current = element;
                              ref(element);
                            }}
                            {...fieldProps}
                          />
                        );
                      }}
                    />
                    {errors.name && (
                      <FormFeedback>{errors.name.message}</FormFeedback>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label for="province_id">
                      Province <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      name="province_id"
                      control={control}
                      rules={{
                        required: "Province is required",
                      }}
                      render={({ field }) => (
                        <Input
                          id="province_id"
                          type="select"
                          invalid={!!errors.province_id}
                          disabled={isReadOnly || provinces.length === 0}
                          {...field}
                        >
                          <option value="">Select Province</option>
                          {provinces.map((province) => {
                            const countryId = province.country_id || province.Country_ID || province.country_ID;
                            const country = countries.find(c => (c.id === countryId || c.ID === countryId));
                            const countryName = country ? (country.name || country.Name) : "";
                            return (
                              <option key={province.id || province.ID} value={province.id || province.ID}>
                                {province.name || province.Name} {countryName ? `(${countryName})` : ""}
                              </option>
                            );
                          })}
                        </Input>
                      )}
                    />
                    {errors.province_id && (
                      <FormFeedback>{errors.province_id.message}</FormFeedback>
                    )}
                    {provinces.length === 0 && (
                      <small className="text-muted">Please add provinces first before creating suburbs.</small>
                    )}
                  </FormGroup>
                </>
              ) : (
                <FormGroup>
                  <Label for="name">
                    Name <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Name must not exceed 100 characters",
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9\s\-_.,()]+$/,
                        message: "Name contains invalid characters",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        id="name"
                        placeholder="Enter name"
                        invalid={!!errors.name}
                        disabled={isReadOnly}
                        innerRef={primaryInputRef}
                        {...field}
                      />
                    )}
                  />
                  {errors.name && <FormFeedback>{errors.name.message}</FormFeedback>}
                </FormGroup>
              )}

              {isReadOnly && (
                <div className="alert alert-info mt-3 mb-0" role="alert">
                  <i className="bx bx-info-circle me-2"></i>
                  You have read-only access to this lookup. Please contact an App
                  Admin or HQ user for changes.
                </div>
              )}
            </ModalBody>

            <ModalFooter className="d-flex justify-content-between">
              <div>
                {editItem && !isReadOnly && (
                  <Button color="danger" onClick={handleDeleteClick} disabled={isSubmitting}>
                    <i className="bx bx-trash me-1"></i> Delete
                  </Button>
                )}
              </div>

              <div>
                <Button
                  color="light"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="me-2"
                >
                  <i className="bx bx-x label-icon"></i> Cancel
                </Button>

                {!isReadOnly && (
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
          title={`Delete ${formatTableName(table)}`}
          message={deleteItem?.message}
          itemName={deleteItem?.name}
          itemType={deleteItem?.type}
          loading={deleteLoading}
        />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Container>
      <style jsx="true">{`
        .lookup-primary-cell {
          color: inherit;
          text-decoration: none;
        }

        .lookup-primary-cell.interactive {
          cursor: pointer;
        }

        .lookup-primary-cell.interactive:hover {
          color: #0d6efd;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default TableView;
