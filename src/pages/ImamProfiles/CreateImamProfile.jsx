import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { useForm, Controller } from "react-hook-form";
import { validateTabsAndNavigate } from "../../helpers/tabValidation";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TopRightAlert from "../../components/Common/TopRightAlert";
import axiosApi from "../../helpers/api_helper";
import { API_BASE_URL } from "../../helpers/url_helper";
import { getAuditName } from "../../helpers/userStorage";
import { useRole } from "../../helpers/useRole";
import { createFieldTabMap, handleTabbedFormErrors } from "../../helpers/formErrorHandler";

const CREATE_IMAM_PROFILE_TAB_LABELS = {
  1: "Personal Info",
  2: "Additional Details",
};

const CREATE_IMAM_PROFILE_TAB_FIELDS = {
  1: [
    "Name",
    "Surname",
    "ID_Number",
    "Nationality",
    "Title",
    "DOB",
    "Race",
    "Gender",
    "Marital_Status",
  ],
  2: [
    "Madhab",
    "suburb_id",
    "province_id",
    "nationality_id",
  ],
};

const CreateImamProfile = () => {
  document.title = "Create Imam Profile | IDP";

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [alert, setAlert] = useState(null);
  const [lookupData, setLookupData] = useState({
    nationality: [],
    title: [],
    race: [],
    gender: [],
    maritalStatus: [],
    madhab: [],
    suburb: [],
    province: [],
  });

  const { isGlobalAdmin, centerId: userCenterId } = useRole();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
    getValues,
  } = useForm({
    defaultValues: {
      Name: "",
      Surname: "",
      ID_Number: "",
      Nationality: "",
      Title: "",
      DOB: "",
      Race: "",
      Gender: "",
      Marital_Status: "",
      Madhab: "",
      suburb_id: "",
      province_id: "",
      nationality_id: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  useEffect(() => {
    fetchLookupData();
  }, []);

  const fetchLookupData = async () => {
    try {
      const [
        nationalityRes,
        titleRes,
        raceRes,
        genderRes,
        maritalStatusRes,
        madhabRes,
        suburbRes,
        provinceRes,
      ] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/lookup/Nationality`),
        axiosApi.get(`${API_BASE_URL}/lookup/Title_Lookup`),
        axiosApi.get(`${API_BASE_URL}/lookup/Race`),
        axiosApi.get(`${API_BASE_URL}/lookup/Gender`),
        axiosApi.get(`${API_BASE_URL}/lookup/Marital_Status`),
        axiosApi.get(`${API_BASE_URL}/lookup/Madhab`),
        axiosApi.get(`${API_BASE_URL}/lookup/Suburb`),
        axiosApi.get(`${API_BASE_URL}/lookup/Province`),
      ]);

      setLookupData({
        nationality: nationalityRes.data || [],
        title: titleRes.data || [],
        race: raceRes.data || [],
        gender: genderRes.data || [],
        maritalStatus: maritalStatusRes.data || [],
        madhab: madhabRes.data || [],
        suburb: suburbRes.data || [],
        province: provinceRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching lookup data:", error);
      showAlert("Failed to fetch lookup data", "warning");
    }
  };

  const showAlert = useCallback((message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.Name,
        surname: data.Surname,
        id_number: data.ID_Number || null,
        nationality: data.Nationality && data.Nationality !== "" ? parseInt(data.Nationality) : null,
        title: data.Title && data.Title !== "" ? parseInt(data.Title) : null,
        dob: data.DOB || null,
        race: data.Race && data.Race !== "" ? parseInt(data.Race) : null,
        gender: data.Gender && data.Gender !== "" ? parseInt(data.Gender) : null,
        marital_status: data.Marital_Status && data.Marital_Status !== "" ? parseInt(data.Marital_Status) : null,
        madhab: data.Madhab && data.Madhab !== "" ? parseInt(data.Madhab) : null,
        suburb_id: data.suburb_id && data.suburb_id !== "" ? parseInt(data.suburb_id) : null,
        province_id: data.province_id && data.province_id !== "" ? parseInt(data.province_id) : null,
        nationality_id: data.nationality_id && data.nationality_id !== "" ? parseInt(data.nationality_id) : null,
        created_by: getAuditName(),
      };

      await axiosApi.post(`${API_BASE_URL}/imamProfiles`, payload);

      showAlert("Imam profile has been created successfully", "success");
      setTimeout(() => {
        navigate("/imam-profiles");
      }, 1500);
    } catch (error) {
      console.error("Error creating imam profile:", error);
      showAlert(error?.response?.data?.message || "Failed to create imam profile", "danger");
    }
  };

  const tabFieldGroups = useMemo(() => CREATE_IMAM_PROFILE_TAB_FIELDS, []);
  const fieldTabMap = useMemo(() => createFieldTabMap(tabFieldGroups), [tabFieldGroups]);

  const requiredFields = useMemo(() => {
    return ["Name", "Surname"];
  }, []);

  const handleFormError = (formErrors) =>
    handleTabbedFormErrors({
      errors: formErrors,
      fieldTabMap,
      tabLabelMap: CREATE_IMAM_PROFILE_TAB_LABELS,
      setActiveTab,
      showAlert,
    });

  const handleValidatedSubmit = async () => {
    const ok = await validateTabsAndNavigate({
      requiredFields,
      fieldTabMap,
      trigger,
      getValues: (name) => getValues(name),
      setActiveTab,
      showAlert,
      tabLabelMap: CREATE_IMAM_PROFILE_TAB_LABELS,
    });
    if (!ok) return;
    return handleSubmit(onSubmit, handleFormError)();
  };

  return (
    <div className="page-content">
      <Container fluid>
        <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
        <Breadcrumbs title="Imam Profiles" breadcrumbItem="Create New Imam Profile" />

        <Row>
          <Col xl={12}>
            <Card className="border shadow-sm">
              <div className="card-header bg-transparent border-bottom py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="card-title mb-0 fw-semibold font-size-16">
                    Create New Imam Profile
                  </h5>
                </div>
              </div>

              <CardBody className="p-4">
                <Form onSubmit={(e) => { e.preventDefault(); handleValidatedSubmit(); }}>
                  <Nav tabs className="nav-tabs-custom">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => toggleTab("1")}
                        style={{ cursor: "pointer" }}
                      >
                        Personal Info
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => toggleTab("2")}
                        style={{ cursor: "pointer" }}
                      >
                        Additional Details
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent activeTab={activeTab} className="p-4 border border-top-0">
                    {/* === TAB 1: PERSONAL INFO === */}
                    <TabPane tabId="1">
                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="Name">Name <span className="text-danger">*</span></Label>
                            <Controller
                              name="Name"
                              control={control}
                              rules={{ required: "Name is required" }}
                              render={({ field }) => (
                                <Input id="Name" type="text" invalid={!!errors.Name} {...field} />
                              )}
                            />
                            {errors.Name && <FormFeedback>{errors.Name.message}</FormFeedback>}
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="Surname">Surname <span className="text-danger">*</span></Label>
                            <Controller
                              name="Surname"
                              control={control}
                              rules={{ required: "Surname is required" }}
                              render={({ field }) => (
                                <Input id="Surname" type="text" invalid={!!errors.Surname} {...field} />
                              )}
                            />
                            {errors.Surname && <FormFeedback>{errors.Surname.message}</FormFeedback>}
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="ID_Number">ID Number</Label>
                            <Controller
                              name="ID_Number"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  id="ID_Number"
                                  type="text"
                                  maxLength={13}
                                  onInput={(e) => {
                                    e.target.value = (e.target.value || "").replace(/\D/g, "").slice(0, 13);
                                    field.onChange(e);
                                  }}
                                  value={field.value}
                                  onBlur={field.onBlur}
                                  {...field}
                                />
                              )}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="DOB">Date of Birth</Label>
                            <Controller
                              name="DOB"
                              control={control}
                              render={({ field }) => (
                                <Input id="DOB" type="date" {...field} />
                              )}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="Title">Title</Label>
                            <Controller
                              name="Title"
                              control={control}
                              render={({ field }) => (
                                <Input id="Title" type="select" {...field}>
                                  <option value="">Select Title</option>
                                  {(lookupData.title || []).map((x) => (
                                    <option key={x.id} value={x.id}>{x.name}</option>
                                  ))}
                                </Input>
                              )}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="Nationality">Nationality</Label>
                            <Controller
                              name="Nationality"
                              control={control}
                              render={({ field }) => (
                                <Input id="Nationality" type="select" {...field}>
                                  <option value="">Select Nationality</option>
                                  {(lookupData.nationality || []).map((x) => (
                                    <option key={x.id} value={x.id}>{x.name}</option>
                                  ))}
                                </Input>
                              )}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="Race">Race</Label>
                            <Controller
                              name="Race"
                              control={control}
                              render={({ field }) => (
                                <Input id="Race" type="select" {...field}>
                                  <option value="">Select Race</option>
                                  {(lookupData.race || []).map((x) => (
                                    <option key={x.id} value={x.id}>{x.name}</option>
                                  ))}
                                </Input>
                              )}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="Gender">Gender</Label>
                            <Controller
                              name="Gender"
                              control={control}
                              render={({ field }) => (
                                <Input id="Gender" type="select" {...field}>
                                  <option value="">Select Gender</option>
                                  {(lookupData.gender || []).map((x) => (
                                    <option key={x.id} value={x.id}>{x.name}</option>
                                  ))}
                                </Input>
                              )}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="Marital_Status">Marital Status</Label>
                            <Controller
                              name="Marital_Status"
                              control={control}
                              render={({ field }) => (
                                <Input id="Marital_Status" type="select" {...field}>
                                  <option value="">Select Status</option>
                                  {(lookupData.maritalStatus || []).map((x) => (
                                    <option key={x.id} value={x.id}>{x.name}</option>
                                  ))}
                                </Input>
                              )}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </TabPane>

                    {/* === TAB 2: ADDITIONAL DETAILS === */}
                    <TabPane tabId="2">
                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="Madhab">Madhab</Label>
                            <Controller
                              name="Madhab"
                              control={control}
                              render={({ field }) => (
                                <Input id="Madhab" type="select" {...field}>
                                  <option value="">Select Madhab</option>
                                  {(lookupData.madhab || []).map((x) => (
                                    <option key={x.id} value={x.id}>{x.name}</option>
                                  ))}
                                </Input>
                              )}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="province_id">Province</Label>
                            <Controller
                              name="province_id"
                              control={control}
                              render={({ field }) => (
                                <Input id="province_id" type="select" {...field}>
                                  <option value="">Select Province</option>
                                  {(lookupData.province || []).map((x) => (
                                    <option key={x.id} value={x.id}>{x.name}</option>
                                  ))}
                                </Input>
                              )}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="suburb_id">Suburb</Label>
                            <Controller
                              name="suburb_id"
                              control={control}
                              render={({ field }) => (
                                <Input id="suburb_id" type="select" {...field}>
                                  <option value="">Select Suburb</option>
                                  {(lookupData.suburb || []).map((x) => (
                                    <option key={x.id} value={x.id}>{x.name}</option>
                                  ))}
                                </Input>
                              )}
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup>
                            <Label for="nationality_id">Nationality ID</Label>
                            <Controller
                              name="nationality_id"
                              control={control}
                              render={({ field }) => (
                                <Input id="nationality_id" type="select" {...field}>
                                  <option value="">Select Nationality ID</option>
                                  {(lookupData.nationality || []).map((x) => (
                                    <option key={x.id} value={x.id}>{x.name}</option>
                                  ))}
                                </Input>
                              )}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </TabPane>
                  </TabContent>

                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <Button
                      type="button"
                      color="light"
                      onClick={() => navigate("/imam-profiles")}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button color="success" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Creating...
                        </>
                      ) : (
                        <>Create Imam Profile</>
                      )}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateImamProfile;

