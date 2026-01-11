import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Alert } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axiosApi from "../../helpers/api_helper";
import { API_BASE_URL } from "../../helpers/url_helper";
import { useRole } from "../../helpers/useRole";
import BoreholeListPanel from "./components/BoreholeListPanel";
import BoreholeSummary from "./components/BoreholeSummary";
import BoreholeDetailTabs from "./components/BoreholeDetailTabs";

const BoreholeManagement = () => {
  // Meta title
  document.title = "Borehole Management | Welfare App";

  // Get user role
  const { userType, isAppAdmin } = useRole();

  // State management
  const [boreholes, setBoreholes] = useState([]);
  const [imamProfiles, setImamProfiles] = useState([]);
  const [selectedBorehole, setSelectedBorehole] = useState(null);
  const [selectedImamProfile, setSelectedImamProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState(null);

  // Detail data states
  const [boreholeConstructionTasks, setBoreholeConstructionTasks] = useState([]);
  const [boreholeRepairsMatrix, setBoreholeRepairsMatrix] = useState([]);

  // Lookup data states
  const [lookupData, setLookupData] = useState({
    boreholeLocation: [],
    waterSource: [],
    waterUsagePurpose: [],
    yesNo: [],
    status: [],
    boreholeConstructionTasks: [],
    tasksStatus: [],
    supplier: [],
  });

  // Fetch all approved boreholes on mount
  useEffect(() => {
    fetchLookupData();
    fetchApprovedBoreholes();
  }, []);

  // Fetch detail data when a borehole is selected
  useEffect(() => {
    if (selectedBorehole) {
      fetchBoreholeDetails(selectedBorehole.id);
    }
  }, [selectedBorehole]);

  const fetchApprovedBoreholes = async () => {
    try {
      setLoading(true);
      // Fetch all boreholes
      const boreholesResponse = await axiosApi.get(`${API_BASE_URL}/borehole`);
      const allBoreholes = boreholesResponse.data || [];
      
      // Filter only approved boreholes (status_id === 2)
      const approvedBoreholes = allBoreholes.filter(b => Number(b.status_id) === 2);
      setBoreholes(approvedBoreholes);

      // Get unique imam profile IDs from approved boreholes
      const imamProfileIds = [...new Set(approvedBoreholes.map(b => b.imam_profile_id))];
      
      // Fetch imam profiles for these IDs
      if (imamProfileIds.length > 0) {
        const imamProfilesResponse = await axiosApi.get(`${API_BASE_URL}/imamProfiles`);
        const allImamProfiles = imamProfilesResponse.data || [];
        const filteredImamProfiles = allImamProfiles.filter(ip => 
          imamProfileIds.includes(ip.id)
        );
        setImamProfiles(filteredImamProfiles);
        
        // If we have profiles, select the first one and its first borehole
        if (filteredImamProfiles.length > 0) {
          const firstProfile = filteredImamProfiles[0];
          setSelectedImamProfile(firstProfile);
          const firstBorehole = approvedBoreholes.find(b => b.imam_profile_id === firstProfile.id);
          if (firstBorehole) {
            setSelectedBorehole(firstBorehole);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching approved boreholes:", error);
      showAlert("Failed to fetch approved boreholes", "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchLookupData = async () => {
    try {
      const [
        boreholeLocationRes,
        waterSourceRes,
        waterUsagePurposeRes,
        yesNoRes,
        statusRes,
        boreholeConstructionTasksRes,
        tasksStatusRes,
        supplierRes,
      ] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/lookup/Borehole_Location`),
        axiosApi.get(`${API_BASE_URL}/lookup/Water_Source`),
        axiosApi.get(`${API_BASE_URL}/lookup/Water_Usage_Purpose`),
        axiosApi.get(`${API_BASE_URL}/lookup/Yes_No`),
        axiosApi.get(`${API_BASE_URL}/lookup/Status`),
        axiosApi.get(`${API_BASE_URL}/lookup/Borehole_Construction_Tasks_Lookup`),
        axiosApi.get(`${API_BASE_URL}/lookup/Tasks_Status`),
        axiosApi.get(`${API_BASE_URL}/lookup/Supplier`).catch(() => ({ data: [] })),
      ]);

      setLookupData({
        boreholeLocation: boreholeLocationRes.data || [],
        waterSource: waterSourceRes.data || [],
        waterUsagePurpose: waterUsagePurposeRes.data || [],
        yesNo: yesNoRes.data || [],
        status: statusRes.data || [],
        boreholeConstructionTasks: boreholeConstructionTasksRes.data || [],
        tasksStatus: tasksStatusRes.data || [],
        supplier: supplierRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching lookup data:", error);
      showAlert("Failed to fetch lookup data", "warning");
    }
  };

  const fetchBoreholeDetails = async (boreholeId) => {
    try {
      const [constructionTasksRes, repairsMatrixRes] = await Promise.all([
        axiosApi.get(`${API_BASE_URL}/boreholeConstructionTasks?borehole_id=${boreholeId}`),
        axiosApi.get(`${API_BASE_URL}/boreholeRepairsMatrix?borehole_id=${boreholeId}`),
      ]);

      setBoreholeConstructionTasks(constructionTasksRes.data || []);
      setBoreholeRepairsMatrix(repairsMatrixRes.data || []);
    } catch (error) {
      console.error("Error fetching borehole details:", error);
      showAlert("Failed to fetch borehole details", "warning");
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
    // Find the first approved borehole for this imam profile
    const profileBorehole = boreholes.find(b => 
      b.imam_profile_id === imamProfile.id && Number(b.status_id) === 2
    );
    if (profileBorehole) {
      setSelectedBorehole(profileBorehole);
    } else {
      setSelectedBorehole(null);
      setBoreholeConstructionTasks([]);
      setBoreholeRepairsMatrix([]);
    }
  };

  const handleBoreholeSelect = (borehole) => {
    setSelectedBorehole(borehole);
    // Find the imam profile for this borehole
    const profile = imamProfiles.find(ip => ip.id === borehole.imam_profile_id);
    if (profile) {
      setSelectedImamProfile(profile);
    }
  };

  const handleBoreholeUpdate = useCallback(async () => {
    await fetchApprovedBoreholes();
    // Refresh detail data if borehole is selected
    if (selectedBorehole) {
      fetchBoreholeDetails(selectedBorehole.id);
    }
  }, [selectedBorehole]);

  const handleDetailUpdate = useCallback(() => {
    if (selectedBorehole) {
      fetchBoreholeDetails(selectedBorehole.id);
    }
  }, [selectedBorehole]);

  // Filter imam profiles based on search term
  const filteredImamProfiles = imamProfiles.filter((imamProfile) => {
    const searchLower = searchTerm.toLowerCase();
    const profileBoreholes = boreholes.filter(b => 
      b.imam_profile_id === imamProfile.id && Number(b.status_id) === 2
    );
    return (
      (imamProfile.name || "").toLowerCase().includes(searchLower) ||
      (imamProfile.surname || "").toLowerCase().includes(searchLower) ||
      (imamProfile.file_number || "").toLowerCase().includes(searchLower) ||
      (imamProfile.id_number || "").toLowerCase().includes(searchLower) ||
      profileBoreholes.some(b => String(b.id).includes(searchLower))
    );
  });

  // Get boreholes for selected imam profile
  const getBoreholesForProfile = (imamProfileId) => {
    return boreholes.filter(b => 
      b.imam_profile_id === imamProfileId && Number(b.status_id) === 2
    );
  };

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

        <Breadcrumbs title="Borehole Management" breadcrumbItem="Borehole Management" />

        <Row>
          {/* Left Panel - Imam Profile List with Approved Boreholes */}
          <Col lg={3}>
            <BoreholeListPanel
              imamProfiles={filteredImamProfiles}
              selectedImamProfile={selectedImamProfile}
              selectedBorehole={selectedBorehole}
              onSelectImamProfile={handleImamProfileSelect}
              onSelectBorehole={handleBoreholeSelect}
              getBoreholesForProfile={getBoreholesForProfile}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              loading={loading}
              onRefresh={fetchApprovedBoreholes}
            />
          </Col>

          {/* Main Panel - Borehole Details */}
          <Col lg={9}>
            {selectedBorehole ? (
              <>
                {/* Borehole Summary - Master Borehole Data */}
                <BoreholeSummary
                  borehole={selectedBorehole}
                  imamProfile={selectedImamProfile}
                  lookupData={lookupData}
                  onUpdate={handleBoreholeUpdate}
                  showAlert={showAlert}
                />

                {/* Detail Tabs - Construction Tasks and Repairs Matrix */}
                <BoreholeDetailTabs
                  key={selectedBorehole.id}
                  boreholeId={selectedBorehole.id}
                  borehole={selectedBorehole}
                  boreholeConstructionTasks={boreholeConstructionTasks}
                  boreholeRepairsMatrix={boreholeRepairsMatrix}
                  lookupData={lookupData}
                  onUpdate={handleDetailUpdate}
                  showAlert={showAlert}
                />
              </>
            ) : (
              <div className="text-center mt-5 pt-5">
                <i className="bx bx-droplet display-1 text-muted"></i>
                <h4 className="mt-4 text-muted">
                  {loading ? "Loading boreholes..." : "Select an imam profile with approved borehole to view details"}
                </h4>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BoreholeManagement;

