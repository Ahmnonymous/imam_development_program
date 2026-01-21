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
import relationshipsSvg from "../../assets/images/animated_email_images/Relationships/elderly-couple-sitting-together-illustration-2025-10-20-06-26-38-utc.svg?raw";
import educationalDevelopmentSvg from "../../assets/images/animated_email_images/Educational Development/online-education-with-graduation-cap-and-laptop-il-2025-10-20-06-01-25-utc.svg?raw";
import treePlantingSvg from "../../assets/images/animated_email_images/Tree/planting-a-sapling-duotone-illustration-2025-10-20-04-36-48-utc.svg?raw";
import waqfLoanSvg from "../../assets/images/animated_email_images/Waqf Loan/quick-loans-illustration-2025-10-20-06-01-21-utc.svg?raw";
import hardshipReliefSvg from "../../assets/images/animated_email_images/Hardship Relief/thumb-showdown-2025-12-15-16-36-45-utc.svg?raw";
import higherEducationRequestSvg from "../../assets/images/animated_email_images/Higher Education/hand-holding-books-with-graduation-cap-and-diploma-2025-10-20-04-29-14-utc.svg?raw";
import ticketsSvg from "../../assets/images/animated_email_images/Tickets/customer-service-employee-in-online-call-2025-11-05-03-42-36-utc.svg?raw";
import boreholeSvg from "../../assets/images/animated_email_images/Borehole/person-with-watering-can-watering-a-tree-2025-11-05-03-30-16-utc.svg?raw";

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
  relationships: relationshipsSvg,
  educationalDevelopment: educationalDevelopmentSvg,
  treePlanting: treePlantingSvg,
  waqfLoan: waqfLoanSvg,
  hardshipRelief: hardshipReliefSvg,
  higherEducationRequest: higherEducationRequestSvg,
  tickets: ticketsSvg,
  borehole: boreholeSvg,
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
    // Add responsive styles for imam cards
    const styleId = 'imam-card-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .imam-card-button {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
        }
        @media (max-width: 768px) {
          .imam-card-button {
            min-height: 100px !important;
            padding: 0.75rem 1rem !important;
          }
          .imam-card-text {
            font-size: 1.5rem !important;
          }
          .imam-card-icon {
            width: 80px !important;
            height: 80px !important;
          }
          .imam-card-icon i {
            font-size: 80px !important;
            line-height: 1 !important;
          }
        }
        @media (max-width: 576px) {
          .imam-card-button {
            min-height: 90px !important;
            padding: 0.625rem 0.875rem !important;
          }
          .imam-card-text {
            font-size: 1rem !important;
          }
          .imam-card-icon {
            width: 70px !important;
            height: 70px !important;
          }
          .imam-card-icon i {
            font-size: 70px !important;
            line-height: 1 !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

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
          <Col key={button.id} xs="12" md="6" lg="4" className="mb-3">
            <div
              className="w-100"
              style={{
                background: 'transparent',
                border: '1px solid rgb(96, 119, 231)',
                borderRadius: "12px",
                padding: "3px",
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
            >
              <Button
                className="w-100 border-0 d-flex align-items-center justify-content-between imam-card-button"
                style={{
                  background: "transparent",
                  backgroundColor: "transparent",
                  backgroundImage: "none",
                  color: "#495057",
                  minHeight: "120px",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  borderRadius: "9px",
                  padding: "1rem 1.25rem",
                }}
                onClick={() => openModal(button.id)}
              >
                <span 
                  className="text-start fw-bold imam-card-text" 
                  style={{ 
                    fontSize: "1.5rem", 
                    fontWeight: "700",
                    background: button.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  {button.label}
                </span>
                {svgSrc ? (
                  <div
                    className="flex-shrink-0 ms-3 imam-card-icon"
                    style={{ 
                      width: "110px", 
                      height: "110px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    dangerouslySetInnerHTML={{ __html: svgSrc }}
                  />
                ) : (
                  <i className={`bx ${button.icon} flex-shrink-0 ms-3 imam-card-icon`} style={{ fontSize: "110px", lineHeight: "1" }}></i>
                )}
              </Button>
            </div>
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

