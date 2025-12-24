import React, { useState } from "react";
import { Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useRole } from "../../../helpers/useRole";
import PearlsOfWisdomTab from "./tabs/PearlsOfWisdomTab";
import JumuahKhutbahTopicSubmissionTab from "./tabs/JumuahKhutbahTopicSubmissionTab";
import JumuahAudioKhutbahTab from "./tabs/JumuahAudioKhutbahTab";
import MedicalReimbursementTab from "./tabs/MedicalReimbursementTab";
import CommunityEngagementTab from "./tabs/CommunityEngagementTab";
import NikahBonusTab from "./tabs/NikahBonusTab";
import NewMuslimBonusTab from "./tabs/NewMuslimBonusTab";
import NewBabyBonusTab from "./tabs/NewBabyBonusTab";

const DetailTabs = ({
  imamProfileId,
  imamProfile,
  pearlsOfWisdom,
  jumuahKhutbahTopicSubmission,
  jumuahAudioKhutbah,
  medicalReimbursement,
  communityEngagement,
  nikahBonus,
  newMuslimBonus,
  newBabyBonus,
  lookupData,
  onUpdate,
  showAlert,
}) => {
  const { isOrgExecutive } = useRole();
  const [activeTab, setActiveTab] = useState("all");

  if (!imamProfileId) {
    return null;
  }

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const currentId = Number(imamProfileId);
  const safeNum = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));

  const pearlsForImam = (pearlsOfWisdom || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const khutbahTopicsForImam = (jumuahKhutbahTopicSubmission || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const audioKhutbahForImam = (jumuahAudioKhutbah || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const medicalForImam = (medicalReimbursement || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const engagementForImam = (communityEngagement || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const nikahForImam = (nikahBonus || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const newMuslimForImam = (newMuslimBonus || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const newBabyForImam = (newBabyBonus || []).filter((x) => safeNum(x.imam_profile_id) === currentId);

  const tabs = [
    { id: "all", label: "Show All" },
    { id: "khutbahTopics", label: "Topics" },
    { id: "audioKhutbah", label: "Audio" },
    { id: "pearls", label: "Wisdom Pearls" },
    { id: "medical", label: "Medical" },
    { id: "engagement", label: "Community" },
    { id: "nikah", label: "Nikah Bonus" },
    { id: "newMuslim", label: "Muslim Bonus" },
    { id: "newBaby", label: "Baby Bonus" },
  ];

  return (
    <Card>
      <CardBody className="py-4">
        <Nav pills className="nav-pills-custom mb-1 d-flex flex-wrap border-bottom">
          {tabs.map((tab) => (
            <NavItem key={tab.id} className="me-2 mb-3">
              <NavLink
                className={classnames({ active: activeTab === tab.id })}
                onClick={() => toggleTab(tab.id)}
                style={{ cursor: "pointer", padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
              >
                <span>{tab.label}</span>
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <TabContent activeTab={activeTab} className="mt-3">
          <TabPane tabId="all">
            <div className="border rounded p-3 mb-3">
              <JumuahKhutbahTopicSubmissionTab imamProfileId={imamProfileId} jumuahKhutbahTopicSubmission={khutbahTopicsForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <JumuahAudioKhutbahTab imamProfileId={imamProfileId} jumuahAudioKhutbah={audioKhutbahForImam} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <PearlsOfWisdomTab imamProfileId={imamProfileId} pearlsOfWisdom={pearlsForImam} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <MedicalReimbursementTab imamProfileId={imamProfileId} medicalReimbursement={medicalForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <CommunityEngagementTab imamProfileId={imamProfileId} communityEngagement={engagementForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <NikahBonusTab imamProfileId={imamProfileId} nikahBonus={nikahForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <NewMuslimBonusTab imamProfileId={imamProfileId} newMuslimBonus={newMuslimForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <NewBabyBonusTab imamProfileId={imamProfileId} newBabyBonus={newBabyForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
          </TabPane>

          <TabPane tabId="pearls">
            <PearlsOfWisdomTab
              imamProfileId={imamProfileId}
              pearlsOfWisdom={pearlsForImam}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="khutbahTopics">
            <JumuahKhutbahTopicSubmissionTab
              imamProfileId={imamProfileId}
              jumuahKhutbahTopicSubmission={khutbahTopicsForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="audioKhutbah">
            <JumuahAudioKhutbahTab
              imamProfileId={imamProfileId}
              jumuahAudioKhutbah={audioKhutbahForImam}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="medical">
            <MedicalReimbursementTab
              imamProfileId={imamProfileId}
              medicalReimbursement={medicalForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="engagement">
            <CommunityEngagementTab
              imamProfileId={imamProfileId}
              communityEngagement={engagementForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="nikah">
            <NikahBonusTab
              imamProfileId={imamProfileId}
              nikahBonus={nikahForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="newMuslim">
            <NewMuslimBonusTab
              imamProfileId={imamProfileId}
              newMuslimBonus={newMuslimForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="newBaby">
            <NewBabyBonusTab
              imamProfileId={imamProfileId}
              newBabyBonus={newBabyForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>
        </TabContent>
      </CardBody>
    </Card>
  );
};

export default DetailTabs;

