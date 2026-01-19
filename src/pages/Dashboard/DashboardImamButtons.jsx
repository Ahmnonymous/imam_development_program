import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "reactstrap";
import { useRole } from "../../helpers/useRole";
import axiosApi from "../../helpers/api_helper";
import { API_BASE_URL } from "../../helpers/url_helper";
import { IMAM_TABS } from "../../constants/imamTabs";
import TopicsModal from "./modals/TopicsModal";
import AudioModal from "./modals/AudioModal";
import WisdomPearlsModal from "./modals/WisdomPearlsModal";
import MedicalModal from "./modals/MedicalModal";
import CommunityModal from "./modals/CommunityModal";
import NikahBonusModal from "./modals/NikahBonusModal";
import MuslimBonusModal from "./modals/MuslimBonusModal";
import BabyBonusModal from "./modals/BabyBonusModal";
import RelationshipsModal from "./modals/RelationshipsModal";
import BoreholeModal from "./modals/BoreholeModal";
import FinancialAssistanceModal from "./modals/FinancialAssistanceModal";
import EducationalDevelopmentModal from "./modals/EducationalDevelopmentModal";
import TreePlantingModal from "./modals/TreePlantingModal";
import WAQFLoanModal from "./modals/WAQFLoanModal";
import HardshipReliefModal from "./modals/HardshipReliefModal";
import HigherEducationRequestModal from "./modals/HigherEducationRequestModal";
import TicketsModal from "./modals/TicketsModal";

// Import animated SVG images as raw strings for inline rendering
import topicsSvg from "../../assets/images/animated_email_images/Jumuah Khutbah Topic Submissionder/creative-idea-lightbulb-cartoon-illustration-2025-10-20-02-21-50-utc.svg?raw";
import audioSvg from "../../assets/images/animated_email_images/Jumuah Khutbah Audio Submission/corporate-business-speaker-illustration-2025-10-20-04-28-31-utc.svg?raw";
import wisdomPearlsSvg from "../../assets/images/animated_email_images/Pearls of Wisdom/ai-brainstorming-duotone-illustration-2025-10-20-04-33-45-utc.svg?raw";
import medicalSvg from "../../assets/images/animated_email_images/Medical Assistance/medical-examination-tools-cartoon-illustration-2025-10-20-04-32-48-utc.svg?raw";
import communitySvg from "../../assets/images/animated_email_images/Community Engagement/diverse-people-in-community-disability-2025-10-20-04-28-17-utc.svg?raw";
import nikahBonusSvg from "../../assets/images/animated_email_images/Nikah Bonus/illustration-of-a-muslim-couple-in-love-2025-10-20-06-25-40-utc.svg?raw";
import muslimBonusSvg from "../../assets/images/animated_email_images/New Muslim Bonus/flat-illustration-of-arab-man-in-traditional-dress-2025-10-20-02-32-55-utc.svg?raw";
import babyBonusSvg from "../../assets/images/animated_email_images/New Baby Bonus/woman-cradling-a-baby-2025-11-05-06-06-57-utc.svg?raw";
import financialAssistanceSvg from "../../assets/images/animated_email_images/Financial Assistance/writing-a-check-illustration-2025-10-20-04-33-44-utc.svg?raw";

// Mapping object for button IDs to SVG imports
const SVG_MAPPING = {
  topics: topicsSvg,
  audio: audioSvg,
  wisdomPearls: wisdomPearlsSvg,
  medical: medicalSvg,
  community: communitySvg,
  nikahBonus: nikahBonusSvg,
  muslimBonus: muslimBonusSvg,
  babyBonus: babyBonusSvg,
  financialAssistance: financialAssistanceSvg,
};

const DashboardImamButtons = () => {
  const { userType } = useRole();
  const [imamProfile, setImamProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState({
    topics: false,
    audio: false,
    wisdomPearls: false,
    medical: false,
    community: false,
    nikahBonus: false,
    muslimBonus: false,
    babyBonus: false,
    relationships: false,
    borehole: false,
    financialAssistance: false,
    educationalDevelopment: false,
    treePlanting: false,
    waqfLoan: false,
    hardshipRelief: false,
    higherEducationRequest: false,
    tickets: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (userType === 6) {
        try {
          const response = await axiosApi.get(`${API_BASE_URL}/imamProfiles/my-profile`);
          if (response.data) {
            setImamProfile(response.data);
            console.log("Imam profile fetched:", response.data);
            console.log("Profile status_id:", response.data.status_id);
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error("Error fetching imam profile:", error);
          } else {
            console.log("No imam profile found (404)");
          }
        } finally {
          setLoading(false);
        }
      } else {
        console.log("Not Imam User, userType:", userType);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userType]);

  const openModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  };

  if (loading) {
    return null;
  }

  // Only show buttons if user is Imam User and profile is approved (status_id === 2)
  if (userType !== 6) {
    console.log("Not showing buttons: userType is not 6, userType =", userType);
    return null;
  }
  
  if (!imamProfile) {
    console.log("Not showing buttons: no imam profile found");
    return null;
  }
  
  if (Number(imamProfile.status_id) !== 2) {
    console.log("Not showing buttons: profile status is not approved, status_id =", imamProfile.status_id);
    return null;
  }
  
  console.log("Showing buttons: All conditions met");

  // Use shared constant to ensure consistency with DetailTabs
  const buttons = IMAM_TABS;

  return (
    <>
      <Row className="mb-4">
        {buttons.map((button) => {
          const svgSrc = SVG_MAPPING[button.id];
          return (
          <Col key={button.id} xs="12" md="6" lg="3" className="mb-3">
            <Button
              className="w-100 text-white border-0 shadow-sm"
              style={{
                background: button.gradient,
                minHeight: "100px",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
              onClick={() => openModal(button.id)}
            >
                {svgSrc ? (
                  <div
                    className="d-block mb-2 mx-auto"
                    style={{ 
                      width: "48px", 
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    dangerouslySetInnerHTML={{ __html: svgSrc }}
                  />
                ) : (
              <i className={`bx ${button.icon} d-block mb-2`} style={{ fontSize: "2rem" }}></i>
                )}
              {button.label}
            </Button>
          </Col>
          );
        })}
      </Row>

      <TopicsModal
        isOpen={modals.topics}
        toggle={() => closeModal("topics")}
        imamProfileId={imamProfile.id}
      />
      <AudioModal
        isOpen={modals.audio}
        toggle={() => closeModal("audio")}
        imamProfileId={imamProfile.id}
      />
      <WisdomPearlsModal
        isOpen={modals.wisdomPearls}
        toggle={() => closeModal("wisdomPearls")}
        imamProfileId={imamProfile.id}
      />
      <MedicalModal
        isOpen={modals.medical}
        toggle={() => closeModal("medical")}
        imamProfileId={imamProfile.id}
      />
      <CommunityModal
        isOpen={modals.community}
        toggle={() => closeModal("community")}
        imamProfileId={imamProfile.id}
      />
      <NikahBonusModal
        isOpen={modals.nikahBonus}
        toggle={() => closeModal("nikahBonus")}
        imamProfileId={imamProfile.id}
      />
      <MuslimBonusModal
        isOpen={modals.muslimBonus}
        toggle={() => closeModal("muslimBonus")}
        imamProfileId={imamProfile.id}
      />
      <BabyBonusModal
        isOpen={modals.babyBonus}
        toggle={() => closeModal("babyBonus")}
        imamProfileId={imamProfile.id}
      />
      <RelationshipsModal
        isOpen={modals.relationships}
        toggle={() => closeModal("relationships")}
        imamProfileId={imamProfile.id}
      />
      <BoreholeModal
        isOpen={modals.borehole}
        toggle={() => closeModal("borehole")}
        imamProfileId={imamProfile.id}
      />
      <FinancialAssistanceModal
        isOpen={modals.financialAssistance}
        toggle={() => closeModal("financialAssistance")}
        imamProfileId={imamProfile.id}
      />
      <EducationalDevelopmentModal
        isOpen={modals.educationalDevelopment}
        toggle={() => closeModal("educationalDevelopment")}
        imamProfileId={imamProfile.id}
      />
      <TreePlantingModal
        isOpen={modals.treePlanting}
        toggle={() => closeModal("treePlanting")}
        imamProfileId={imamProfile.id}
      />
      <WAQFLoanModal
        isOpen={modals.waqfLoan}
        toggle={() => closeModal("waqfLoan")}
        imamProfileId={imamProfile.id}
      />
      <HardshipReliefModal
        isOpen={modals.hardshipRelief}
        toggle={() => closeModal("hardshipRelief")}
        imamProfileId={imamProfile.id}
      />
      <HigherEducationRequestModal
        isOpen={modals.higherEducationRequest}
        toggle={() => closeModal("higherEducationRequest")}
        imamProfileId={imamProfile.id}
      />
      <TicketsModal
        isOpen={modals.tickets}
        toggle={() => closeModal("tickets")}
      />
    </>
  );
};

export default DashboardImamButtons;

