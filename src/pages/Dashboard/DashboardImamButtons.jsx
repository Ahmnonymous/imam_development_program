import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "reactstrap";
import { useRole } from "../../helpers/useRole";
import axiosApi from "../../helpers/api_helper";
import { API_BASE_URL } from "../../helpers/url_helper";
import TopicsModal from "./modals/TopicsModal";
import AudioModal from "./modals/AudioModal";
import WisdomPearlsModal from "./modals/WisdomPearlsModal";
import MedicalModal from "./modals/MedicalModal";
import CommunityModal from "./modals/CommunityModal";
import NikahBonusModal from "./modals/NikahBonusModal";
import MuslimBonusModal from "./modals/MuslimBonusModal";
import BabyBonusModal from "./modals/BabyBonusModal";

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

  const buttons = [
    { id: "topics", label: "Topics", icon: "bx-book", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { id: "audio", label: "Audio", icon: "bx-music", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { id: "wisdomPearls", label: "Wisdom Pearls", icon: "bx-diamond", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { id: "medical", label: "Medical", icon: "bx-plus-medical", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { id: "community", label: "Community", icon: "bx-group", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { id: "nikahBonus", label: "Nikah Bonus", icon: "bx-heart", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
    { id: "muslimBonus", label: "Muslim Bonus", icon: "bx-star", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { id: "babyBonus", label: "Baby Bonus", icon: "bx-baby-carriage", gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
  ];

  return (
    <>
      <Row className="mb-4">
        {buttons.map((button) => (
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
              <i className={`bx ${button.icon} d-block mb-2`} style={{ fontSize: "2rem" }}></i>
              {button.label}
            </Button>
          </Col>
        ))}
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
    </>
  );
};

export default DashboardImamButtons;

