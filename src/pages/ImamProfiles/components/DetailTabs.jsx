import React, { useState, useMemo, useCallback } from "react";
import { Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useRole } from "../../../helpers/useRole";
import JumuahKhutbahTopicTab from "./tabs/JumuahKhutbahTopicTab";
import JumuahAudioKhutbahTab from "./tabs/JumuahAudioKhutbahTab";
import PearlsOfWisdomTab from "./tabs/PearlsOfWisdomTab";
import MedicalReimbursementTab from "./tabs/MedicalReimbursementTab";
import CommunityEngagementTab from "./tabs/CommunityEngagementTab";
import NikahBonusTab from "./tabs/NikahBonusTab";
import NewMuslimBonusTab from "./tabs/NewMuslimBonusTab";
import NewBabyBonusTab from "./tabs/NewBabyBonusTab";

const DetailTabs = ({
  imamProfileId,
  imamProfile,
  jumuahKhutbahTopics,
  jumuahAudioKhutbah,
  pearlsOfWisdom,
  medicalReimbursements,
  communityEngagements,
  nikahBonuses,
  newMuslimBonuses,
  newBabyBonuses,
  lookupData,
  onUpdate,
  showAlert,
}) => {
  const { isOrgExecutive } = useRole();
  const [activeTab, setActiveTab] = useState("all");

  const toggleTab = useCallback((tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  }, [activeTab]);

  const currentId = Number(imamProfileId);
  const safeNum = useCallback((v) => (v === null || v === undefined || v === "" ? NaN : Number(v)), []);

  const topicsForImam = useMemo(() => 
    (jumuahKhutbahTopics || []).filter((x) => safeNum(x.imam_profile_id) === currentId),
    [jumuahKhutbahTopics, currentId, safeNum]
  );
  const audioForImam = useMemo(() => 
    (jumuahAudioKhutbah || []).filter((x) => safeNum(x.imam_profile_id) === currentId),
    [jumuahAudioKhutbah, currentId, safeNum]
  );
  const pearlsForImam = useMemo(() => 
    (pearlsOfWisdom || []).filter((x) => safeNum(x.imam_profile_id) === currentId),
    [pearlsOfWisdom, currentId, safeNum]
  );
  const medicalForImam = useMemo(() => 
    (medicalReimbursements || []).filter((x) => safeNum(x.imam_profile_id) === currentId),
    [medicalReimbursements, currentId, safeNum]
  );
  const engagementForImam = useMemo(() => 
    (communityEngagements || []).filter((x) => safeNum(x.imam_profile_id) === currentId),
    [communityEngagements, currentId, safeNum]
  );
  const nikahForImam = useMemo(() => 
    (nikahBonuses || []).filter((x) => safeNum(x.imam_profile_id) === currentId),
    [nikahBonuses, currentId, safeNum]
  );
  const newMuslimForImam = useMemo(() => 
    (newMuslimBonuses || []).filter((x) => safeNum(x.imam_profile_id) === currentId),
    [newMuslimBonuses, currentId, safeNum]
  );
  const newBabyForImam = useMemo(() => 
    (newBabyBonuses || []).filter((x) => safeNum(x.imam_profile_id) === currentId),
    [newBabyBonuses, currentId, safeNum]
  );

  const tabs = [
    { id: "all", label: "Show All" },
    { id: "jumuahTopics", label: "Topics" },
    { id: "jumuahAudio", label: "Audio" },
    { id: "pearls", label: "Pearls of Wisdom" },
    { id: "medical", label: "Reimbursement" },
    { id: "engagement", label: "Community" },
    { id: "nikah", label: "Nikah Bonus" },
    { id: "newMuslim", label: "Muslim Bonus" },
    { id: "newBaby", label: "Baby Bonus" },
  ];

  // Disable child tabs if imam profile doesn't exist yet
  const isProfileCreated = !!imamProfileId;

  return (
    <Card>
      <CardBody className="py-4">
        <Nav pills className="nav-pills-custom mb-1 d-flex flex-wrap border-bottom">
          {tabs.map((tab) => {
            const isDisabled = tab.id !== "all" && !isProfileCreated;
            return (
              <NavItem key={tab.id} className="me-2 mb-3">
                <NavLink
                  className={classnames({ 
                    active: activeTab === tab.id,
                    disabled: isDisabled
                  })}
                  onClick={() => !isDisabled && toggleTab(tab.id)}
                  style={{ 
                    cursor: isDisabled ? "not-allowed" : "pointer", 
                    padding: "0.25rem 0.5rem", 
                    fontSize: "0.75rem",
                    opacity: isDisabled ? 0.5 : 1
                  }}
                >
                  <span>{tab.label}</span>
                </NavLink>
              </NavItem>
            );
          })}
        </Nav>

        <TabContent activeTab={activeTab} className="mt-3">
          {activeTab === "all" && (
            <TabPane tabId="all">
              <div className="border rounded p-3 mb-3">
                <JumuahKhutbahTopicTab 
                  imamProfileId={imamProfileId} 
                  topics={topicsForImam} 
                  lookupData={lookupData}
                  onUpdate={onUpdate} 
                  showAlert={showAlert} 
                />
              </div>
              
              <div className="border rounded p-3 mb-3">
                <JumuahAudioKhutbahTab 
                  imamProfileId={imamProfileId} 
                  audioKhutbah={audioForImam} 
                  lookupData={lookupData}
                  onUpdate={onUpdate} 
                  showAlert={showAlert} 
                />
              </div>
              
              <div className="border rounded p-3 mb-3">
                <PearlsOfWisdomTab 
                  imamProfileId={imamProfileId} 
                  pearls={pearlsForImam} 
                  lookupData={lookupData}
                  onUpdate={onUpdate} 
                  showAlert={showAlert} 
                />
              </div>
              
              <div className="border rounded p-3 mb-3">
                <MedicalReimbursementTab 
                  imamProfileId={imamProfileId} 
                  reimbursements={medicalForImam} 
                  lookupData={lookupData}
                  onUpdate={onUpdate} 
                  showAlert={showAlert} 
                />
              </div>
              
              <div className="border rounded p-3 mb-3">
                <CommunityEngagementTab 
                  imamProfileId={imamProfileId} 
                  engagements={engagementForImam} 
                  lookupData={lookupData}
                  onUpdate={onUpdate} 
                  showAlert={showAlert} 
                />
              </div>
              
              <div className="border rounded p-3 mb-3">
                <NikahBonusTab 
                  imamProfileId={imamProfileId} 
                  bonuses={nikahForImam} 
                  lookupData={lookupData}
                  onUpdate={onUpdate} 
                  showAlert={showAlert} 
                />
              </div>
              
              <div className="border rounded p-3 mb-3">
                <NewMuslimBonusTab 
                  imamProfileId={imamProfileId} 
                  bonuses={newMuslimForImam} 
                  lookupData={lookupData}
                  onUpdate={onUpdate} 
                  showAlert={showAlert} 
                />
              </div>
              
              <div className="border rounded p-3 mb-3">
                <NewBabyBonusTab 
                  imamProfileId={imamProfileId} 
                  bonuses={newBabyForImam} 
                  lookupData={lookupData}
                  onUpdate={onUpdate} 
                  showAlert={showAlert} 
                />
              </div>
            </TabPane>
          )}

          {activeTab === "jumuahTopics" && (
            <TabPane tabId="jumuahTopics">
              <JumuahKhutbahTopicTab
                imamProfileId={imamProfileId}
                topics={topicsForImam}
                lookupData={lookupData}
                onUpdate={onUpdate}
                showAlert={showAlert}
              />
            </TabPane>
          )}

          {activeTab === "jumuahAudio" && (
            <TabPane tabId="jumuahAudio">
              <JumuahAudioKhutbahTab
                imamProfileId={imamProfileId}
                audioKhutbah={audioForImam}
                lookupData={lookupData}
                onUpdate={onUpdate}
                showAlert={showAlert}
              />
            </TabPane>
          )}

          {activeTab === "pearls" && (
            <TabPane tabId="pearls">
              <PearlsOfWisdomTab
                imamProfileId={imamProfileId}
                pearls={pearlsForImam}
                lookupData={lookupData}
                onUpdate={onUpdate}
                showAlert={showAlert}
              />
            </TabPane>
          )}

          {activeTab === "medical" && (
            <TabPane tabId="medical">
              <MedicalReimbursementTab
                imamProfileId={imamProfileId}
                reimbursements={medicalForImam}
                lookupData={lookupData}
                onUpdate={onUpdate}
                showAlert={showAlert}
              />
            </TabPane>
          )}

          {activeTab === "engagement" && (
            <TabPane tabId="engagement">
              <CommunityEngagementTab
                imamProfileId={imamProfileId}
                engagements={engagementForImam}
                lookupData={lookupData}
                onUpdate={onUpdate}
                showAlert={showAlert}
              />
            </TabPane>
          )}

          {activeTab === "nikah" && (
            <TabPane tabId="nikah">
              <NikahBonusTab
                imamProfileId={imamProfileId}
                bonuses={nikahForImam}
                lookupData={lookupData}
                onUpdate={onUpdate}
                showAlert={showAlert}
              />
            </TabPane>
          )}

          {activeTab === "newMuslim" && (
            <TabPane tabId="newMuslim">
              <NewMuslimBonusTab
                imamProfileId={imamProfileId}
                bonuses={newMuslimForImam}
                lookupData={lookupData}
                onUpdate={onUpdate}
                showAlert={showAlert}
              />
            </TabPane>
          )}

          {activeTab === "newBaby" && (
            <TabPane tabId="newBaby">
              <NewBabyBonusTab
                imamProfileId={imamProfileId}
                bonuses={newBabyForImam}
                lookupData={lookupData}
                onUpdate={onUpdate}
                showAlert={showAlert}
              />
            </TabPane>
          )}
        </TabContent>
      </CardBody>
    </Card>
  );
};

export default DetailTabs;

