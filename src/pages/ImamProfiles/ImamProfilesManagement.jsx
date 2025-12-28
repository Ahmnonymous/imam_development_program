import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Alert } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axiosApi from "../../helpers/api_helper";
import { API_BASE_URL } from "../../helpers/url_helper";
import { useRole } from "../../helpers/useRole";
import ImamProfileListPanel from "./components/ImamProfileListPanel";
import ImamProfileSummary from "./components/ImamProfileSummary";
import SummaryMetrics from "./components/SummaryMetrics";
import DetailTabs from "./components/DetailTabs";

const ImamProfilesManagement = () => {
  // Meta title
  document.title = "Imam Profile Management | Welfare App";

  // Get user role
  const { userType, isAppAdmin } = useRole();
  const isImamUser = userType === 6;

  // State management
  const [imamProfiles, setImamProfiles] = useState([]);
  const [selectedImamProfile, setSelectedImamProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState(null);

  // Detail data states - ALL FROM IMAM TABLES
  const [pearlsOfWisdom, setPearlsOfWisdom] = useState([]);
  const [jumuahKhutbahTopicSubmission, setJumuahKhutbahTopicSubmission] = useState([]);
  const [nikahBonus, setNikahBonus] = useState([]);
  const [communityEngagement, setCommunityEngagement] = useState([]);
  const [medicalReimbursement, setMedicalReimbursement] = useState([]);
  const [jumuahAudioKhutbah, setJumuahAudioKhutbah] = useState([]);
  const [newMuslimBonus, setNewMuslimBonus] = useState([]);
  const [newBabyBonus, setNewBabyBonus] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [borehole, setBorehole] = useState([]);

  // Lookup data states
  const [lookupData, setLookupData] = useState({
    race: [],
    nationality: [],
    gender: [],
    maritalStatus: [],
    suburb: [],
    title: [],
    madhab: [],
    province: [],
    status: [],
    relationshipTypes: [],
    employmentStatus: [],
    educationLevel: [],
    healthConditions: [],
    yesNo: [],
    boreholeLocation: [],
    waterSource: [],
    waterUsagePurpose: [],
  });

  // Fetch all imam profiles on mount
  useEffect(() => {
    fetchLookupData();
    if (isImamUser) {
      // For Imam User, fetch only their own profile
      fetchMyProfile();
    } else {
      // For Admin and others, fetch all profiles
      fetchImamProfiles();
    }
  }, [isImamUser]);

  // Fetch detail data when an imam profile is selected
  useEffect(() => {
    if (selectedImamProfile) {
      fetchImamProfileDetails(selectedImamProfile.id);
    }
  }, [selectedImamProfile]);

  const fetchImamProfiles = async () => {
    try {
      setLoading(true);
      const response = await axiosApi.get(`${API_BASE_URL}/imamProfiles`);
      setImamProfiles(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedImamProfile(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching imam profiles:", error);
      showAlert("Failed to fetch imam profiles", "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosApi.get(`${API_BASE_URL}/imamProfiles/my-profile`);
      if (response.data) {
        setImamProfiles([response.data]);
        setSelectedImamProfile(response.data);
      } else {
        // No profile exists - redirect to create page
        window.location.href = "/imam-profiles/create";
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No profile exists - redirect to create page
        window.location.href = "/imam-profiles/create";
      } else {
        console.error("Error fetching my imam profile:", error);
        showAlert("Failed to fetch imam profile", "danger");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLookupData = async () => {
    try {
      const [
        raceRes,
        nationalityRes,
        genderRes,
        maritalStatusRes,
        suburbRes,
        titleRes,
        madhabRes,
        provinceRes,
        countryRes,
        statusRes,
        relationshipTypesRes,
        employmentStatusRes,
        educationLevelRes,
        healthConditionsRes,
        yesNoRes,
        boreholeLocationRes,
        waterSourceRes,
        waterUsagePurposeRes,
      ] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/lookup/Race`),
        axiosApi.get(`${API_BASE_URL}/lookup/Nationality`),
        axiosApi.get(`${API_BASE_URL}/lookup/Gender`),
        axiosApi.get(`${API_BASE_URL}/lookup/Marital_Status`),
        axiosApi.get(`${API_BASE_URL}/lookup/Suburb`),
        axiosApi.get(`${API_BASE_URL}/lookup/Title_Lookup`),
        axiosApi.get(`${API_BASE_URL}/lookup/Madhab`),
        axiosApi.get(`${API_BASE_URL}/lookup/Province`),
        axiosApi.get(`${API_BASE_URL}/lookup/Country`),
        axiosApi.get(`${API_BASE_URL}/lookup/Status`),
        axiosApi.get(`${API_BASE_URL}/lookup/Relationship_Types`),
        axiosApi.get(`${API_BASE_URL}/lookup/Employment_Status`),
        axiosApi.get(`${API_BASE_URL}/lookup/Education_Level`),
        axiosApi.get(`${API_BASE_URL}/lookup/Health_Conditions`),
        axiosApi.get(`${API_BASE_URL}/lookup/Yes_No`),
        axiosApi.get(`${API_BASE_URL}/lookup/Borehole_Location`),
        axiosApi.get(`${API_BASE_URL}/lookup/Water_Source`),
        axiosApi.get(`${API_BASE_URL}/lookup/Water_Usage_Purpose`),
      ]);

      setLookupData({
        race: raceRes.data || [],
        nationality: nationalityRes.data || [],
        gender: genderRes.data || [],
        maritalStatus: maritalStatusRes.data || [],
        suburb: suburbRes.data || [],
        title: titleRes.data || [],
        madhab: madhabRes.data || [],
        province: provinceRes.data || [],
        country: countryRes.data || [],
        status: statusRes.data || [],
        relationshipTypes: relationshipTypesRes.data || [],
        employmentStatus: employmentStatusRes.data || [],
        educationLevel: educationLevelRes.data || [],
        healthConditions: healthConditionsRes.data || [],
        yesNo: yesNoRes.data || [],
        boreholeLocation: boreholeLocationRes.data || [],
        waterSource: waterSourceRes.data || [],
        waterUsagePurpose: waterUsagePurposeRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching lookup data:", error);
      showAlert("Failed to fetch lookup data", "warning");
    }
  };

  const fetchImamProfileDetails = async (imamProfileId) => {
    try {
      const [
        pearlsOfWisdomRes,
        jumuahKhutbahTopicsRes,
        nikahBonusesRes,
        communityEngagementsRes,
        medicalReimbursementsRes,
        jumuahAudioKhutbahsRes,
        newMuslimBonusesRes,
        newBabyBonusesRes,
        relationshipsRes,
        boreholeRes,
      ] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/pearlsOfWisdom?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/jumuahKhutbahTopicSubmission?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/nikahBonus?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/communityEngagement?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/medicalReimbursement?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/jumuahAudioKhutbah?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/newMuslimBonus?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/newBabyBonus?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/imamRelationships?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/borehole?imam_profile_id=${imamProfileId}`),
      ]);

      setPearlsOfWisdom(pearlsOfWisdomRes.data || []);
      setJumuahKhutbahTopicSubmission(jumuahKhutbahTopicsRes.data || []);
      setNikahBonus(nikahBonusesRes.data || []);
      setCommunityEngagement(communityEngagementsRes.data || []);
      setMedicalReimbursement(medicalReimbursementsRes.data || []);
      setJumuahAudioKhutbah(jumuahAudioKhutbahsRes.data || []);
      setNewMuslimBonus(newMuslimBonusesRes.data || []);
      setNewBabyBonus(newBabyBonusesRes.data || []);
      setRelationships(relationshipsRes.data || []);
      setBorehole(boreholeRes.data || []);
    } catch (error) {
      console.error("Error fetching imam profile details:", error);
      showAlert("Failed to fetch imam profile details", "warning");
    }
  };

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
      default:
        return "#dee2e6";
    }
  };

  const handleImamProfileSelect = (imamProfile) => {
    setSelectedImamProfile(imamProfile);
    // Clear existing detail data to avoid showing stale records while fetching
    setPearlsOfWisdom([]);
    setJumuahKhutbahTopicSubmission([]);
    setNikahBonus([]);
    setCommunityEngagement([]);
    setMedicalReimbursement([]);
    setJumuahAudioKhutbah([]);
      setNewMuslimBonus([]);
      setNewBabyBonus([]);
      setRelationships([]);
      setBorehole([]);
    // Fetch fresh detail data immediately for better UX
    if (imamProfile?.id) {
      fetchImamProfileDetails(imamProfile.id);
    }
  };

  const handleImamProfileUpdate = useCallback(async () => {
    if (isImamUser) {
      // For Imam User, refresh their own profile
      await fetchMyProfile();
    } else {
      // For Admin and others, refresh all profiles
      fetchImamProfiles();
    }
    // Refresh detail data if profile is selected
    if (selectedImamProfile) {
      fetchImamProfileDetails(selectedImamProfile.id);
    }
  }, [selectedImamProfile, isImamUser]);

  const handleDetailUpdate = useCallback(() => {
    if (selectedImamProfile) {
      fetchImamProfileDetails(selectedImamProfile.id);
    }
  }, [selectedImamProfile]);

  const filteredImamProfiles = imamProfiles.filter((imamProfile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (imamProfile.name || "").toLowerCase().includes(searchLower) ||
      (imamProfile.surname || "").toLowerCase().includes(searchLower) ||
      (imamProfile.file_number || "").toLowerCase().includes(searchLower) ||
      (imamProfile.id_number || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="page-content">
      <Container fluid>
        {/* Alert Notification - Top Right */}
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

        <Breadcrumbs title="Imam Profiles" breadcrumbItem="Imam Profile Management" />

        <Row>
          {/* Left Panel - Imam Profile List (Only for Admin) */}
          {!isImamUser && (
            <Col lg={3}>
              <ImamProfileListPanel
                imamProfiles={filteredImamProfiles}
                selectedImamProfile={selectedImamProfile}
                onSelectImamProfile={handleImamProfileSelect}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                loading={loading}
                onRefresh={fetchImamProfiles}
              />
            </Col>
          )}

          {/* Main Panel - Imam Profile Details */}
          <Col lg={isImamUser ? 12 : 9}>
            {selectedImamProfile ? (
              <>
                {/* Summary Metrics - Hide for Imam User if status is pending (1), show if approved (2) */}
                {(!isImamUser || Number(selectedImamProfile.status_id) === 2) && (
                  <SummaryMetrics
                    imamProfileId={selectedImamProfile.id}
                    medicalReimbursement={medicalReimbursement}
                    communityEngagement={communityEngagement}
                    jumuahKhutbahTopicSubmission={jumuahKhutbahTopicSubmission}
                    jumuahAudioKhutbah={jumuahAudioKhutbah}
                  />
                )}

                {/* Imam Profile Summary - Always show */}
                <ImamProfileSummary
                  imamProfile={selectedImamProfile}
                  lookupData={lookupData}
                  onUpdate={handleImamProfileUpdate}
                  showAlert={showAlert}
                />

                {/* Detail Tabs - Hide for Imam User if status is pending (1), show if approved (2) */}
                {(!isImamUser || Number(selectedImamProfile.status_id) === 2) && (
                  <DetailTabs
                    key={selectedImamProfile.id}
                    imamProfileId={selectedImamProfile.id}
                    imamProfile={selectedImamProfile}
                    pearlsOfWisdom={pearlsOfWisdom}
                    jumuahKhutbahTopicSubmission={jumuahKhutbahTopicSubmission}
                    jumuahAudioKhutbah={jumuahAudioKhutbah}
                    medicalReimbursement={medicalReimbursement}
                    communityEngagement={communityEngagement}
                    nikahBonus={nikahBonus}
                    newMuslimBonus={newMuslimBonus}
                    newBabyBonus={newBabyBonus}
                    relationships={relationships}
                    borehole={borehole}
                    lookupData={lookupData}
                    onUpdate={handleDetailUpdate}
                    showAlert={showAlert}
                  />
                )}
              </>
            ) : (
              <div className="text-center mt-5 pt-5">
                <i className="bx bx-user-circle display-1 text-muted"></i>
                <h4 className="mt-4 text-muted">
                  {loading ? "Loading imam profiles..." : "Select an imam profile to view details"}
                </h4>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ImamProfilesManagement;
