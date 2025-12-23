import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Alert } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axiosApi from "../../helpers/api_helper";
import { API_BASE_URL } from "../../helpers/url_helper";
import ImamProfileListPanel from "./components/ImamProfileListPanel";
import ImamProfileSummary from "./components/ImamProfileSummary";
import SummaryMetrics from "./components/SummaryMetrics";
import DetailTabs from "./components/DetailTabs";

const ImamProfilesManagement = () => {
  // Meta title
  document.title = "Imam Profiles Management | IDP";

  // State management
  const [imamProfiles, setImamProfiles] = useState([]);
  const [selectedImamProfile, setSelectedImamProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState(null);

  // Detail data states
  const [jumuahKhutbahTopics, setJumuahKhutbahTopics] = useState([]);
  const [jumuahAudioKhutbah, setJumuahAudioKhutbah] = useState([]);
  const [pearlsOfWisdom, setPearlsOfWisdom] = useState([]);
  const [medicalReimbursements, setMedicalReimbursements] = useState([]);
  const [communityEngagements, setCommunityEngagements] = useState([]);
  const [nikahBonuses, setNikahBonuses] = useState([]);
  const [newMuslimBonuses, setNewMuslimBonuses] = useState([]);
  const [newBabyBonuses, setNewBabyBonuses] = useState([]);

  // Lookup data states
  const [lookupData, setLookupData] = useState({
    title: [],
    madhab: [],
    status: [],
    yesNo: [],
    resourceType: [],
    medicalVisitType: [],
    medicalServiceProvider: [],
    communityEngagementType: [],
    language: [],
    currency: [],
    country: [],
    province: [],
    suburb: [],
    nationality: [],
    race: [],
    gender: [],
    maritalStatus: [],
    relationshipType: [],
  });

  // Fetch all imam profiles on mount
  useEffect(() => {
    fetchImamProfiles();
    fetchLookupData();
  }, []);

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

  const fetchLookupData = async () => {
    try {
      const [
        titleRes,
        madhabRes,
        statusRes,
        yesNoRes,
        resourceTypeRes,
        medicalVisitTypeRes,
        medicalServiceProviderRes,
        communityEngagementTypeRes,
        languageRes,
        currencyRes,
        countryRes,
        provinceRes,
        suburbRes,
        nationalityRes,
        raceRes,
        genderRes,
        maritalStatusRes,
        relationshipTypeRes,
      ] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/lookup/Title_Lookup`),
        axiosApi.get(`${API_BASE_URL}/lookup/Madhab`),
        axiosApi.get(`${API_BASE_URL}/lookup/Status`),
        axiosApi.get(`${API_BASE_URL}/lookup/Yes_No`),
        axiosApi.get(`${API_BASE_URL}/lookup/Resource_Type`),
        axiosApi.get(`${API_BASE_URL}/lookup/Medical_Visit_Type`),
        axiosApi.get(`${API_BASE_URL}/lookup/Medical_Service_Provider`),
        axiosApi.get(`${API_BASE_URL}/lookup/Community_Engagement_Type`),
        axiosApi.get(`${API_BASE_URL}/lookup/Language`),
        axiosApi.get(`${API_BASE_URL}/lookup/Currency`),
        axiosApi.get(`${API_BASE_URL}/lookup/Country`),
        axiosApi.get(`${API_BASE_URL}/lookup/Province`),
        axiosApi.get(`${API_BASE_URL}/lookup/Suburb`),
        axiosApi.get(`${API_BASE_URL}/lookup/Nationality`),
        axiosApi.get(`${API_BASE_URL}/lookup/Race`),
        axiosApi.get(`${API_BASE_URL}/lookup/Gender`),
        axiosApi.get(`${API_BASE_URL}/lookup/Marital_Status`),
        axiosApi.get(`${API_BASE_URL}/lookup/Relationship_Types`),
      ]);

      setLookupData({
        title: titleRes.data || [],
        madhab: madhabRes.data || [],
        status: statusRes.data || [],
        yesNo: yesNoRes.data || [],
        resourceType: resourceTypeRes.data || [],
        medicalVisitType: medicalVisitTypeRes.data || [],
        medicalServiceProvider: medicalServiceProviderRes.data || [],
        communityEngagementType: communityEngagementTypeRes.data || [],
        language: languageRes.data || [],
        currency: currencyRes.data || [],
        country: countryRes.data || [],
        province: provinceRes.data || [],
        suburb: suburbRes.data || [],
        nationality: nationalityRes.data || [],
        race: raceRes.data || [],
        gender: genderRes.data || [],
        maritalStatus: maritalStatusRes.data || [],
        relationshipType: relationshipTypeRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching lookup data:", error);
      showAlert("Failed to fetch lookup data", "warning");
    }
  };

  const fetchImamProfileDetails = async (imamProfileId) => {
    try {
      const [
        jumuahKhutbahTopicsRes,
        jumuahAudioKhutbahRes,
        pearlsOfWisdomRes,
        medicalReimbursementsRes,
        communityEngagementsRes,
        nikahBonusesRes,
        newMuslimBonusesRes,
        newBabyBonusesRes,
      ] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/jumuahKhutbahTopicSubmission?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/jumuahAudioKhutbah?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/pearlsOfWisdom?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/medicalReimbursement?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/communityEngagement?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/nikahBonus?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/newMuslimBonus?imam_profile_id=${imamProfileId}`),
        axiosApi.get(`${API_BASE_URL}/newBabyBonus?imam_profile_id=${imamProfileId}`),
      ]);

      setJumuahKhutbahTopics(jumuahKhutbahTopicsRes.data || []);
      setJumuahAudioKhutbah(jumuahAudioKhutbahRes.data || []);
      setPearlsOfWisdom(pearlsOfWisdomRes.data || []);
      setMedicalReimbursements(medicalReimbursementsRes.data || []);
      setCommunityEngagements(communityEngagementsRes.data || []);
      setNikahBonuses(nikahBonusesRes.data || []);
      setNewMuslimBonuses(newMuslimBonusesRes.data || []);
      setNewBabyBonuses(newBabyBonusesRes.data || []);
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
    setJumuahKhutbahTopics([]);
    setJumuahAudioKhutbah([]);
    setPearlsOfWisdom([]);
    setMedicalReimbursements([]);
    setCommunityEngagements([]);
    setNikahBonuses([]);
    setNewMuslimBonuses([]);
    setNewBabyBonuses([]);
    // Fetch fresh detail data immediately for better UX
    if (imamProfile?.id) {
      fetchImamProfileDetails(imamProfile.id);
    }
  };

  const handleImamProfileUpdate = useCallback(() => {
    fetchImamProfiles();
    if (selectedImamProfile) {
      fetchImamProfileDetails(selectedImamProfile.id);
    }
  }, [selectedImamProfile]);

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

        <Breadcrumbs title="Imam Profiles" breadcrumbItem="Imam Profiles Management" />

        <Row>
          {/* Left Panel - Imam Profile List */}
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

          {/* Main Panel - Imam Profile Details */}
          <Col lg={9}>
            {selectedImamProfile ? (
              <>
                {/* Summary Metrics */}
                <SummaryMetrics
                  imamProfileId={selectedImamProfile.id}
                  jumuahKhutbahTopics={jumuahKhutbahTopics}
                  jumuahAudioKhutbah={jumuahAudioKhutbah}
                  pearlsOfWisdom={pearlsOfWisdom}
                  medicalReimbursements={medicalReimbursements}
                  communityEngagements={communityEngagements}
                  nikahBonuses={nikahBonuses}
                  newMuslimBonuses={newMuslimBonuses}
                  newBabyBonuses={newBabyBonuses}
                />

                {/* Imam Profile Summary */}
                <ImamProfileSummary
                  imamProfile={selectedImamProfile}
                  lookupData={lookupData}
                  onUpdate={handleImamProfileUpdate}
                  showAlert={showAlert}
                />

                {/* Detail Tabs */}
                <DetailTabs
                  key={selectedImamProfile.id}
                  imamProfileId={selectedImamProfile.id}
                  imamProfile={selectedImamProfile}
                  jumuahKhutbahTopics={jumuahKhutbahTopics}
                  jumuahAudioKhutbah={jumuahAudioKhutbah}
                  pearlsOfWisdom={pearlsOfWisdom}
                  medicalReimbursements={medicalReimbursements}
                  communityEngagements={communityEngagements}
                  nikahBonuses={nikahBonuses}
                  newMuslimBonuses={newMuslimBonuses}
                  newBabyBonuses={newBabyBonuses}
                  lookupData={lookupData}
                  onUpdate={handleDetailUpdate}
                  showAlert={showAlert}
                />
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

