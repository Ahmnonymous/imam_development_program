import React, { useState } from "react";
import { Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useRole } from "../../../helpers/useRole";
import { IMAM_TABS, TAB_ID_MAPPING } from "../../../constants/imamTabs";
import PearlsOfWisdomTab from "./tabs/PearlsOfWisdomTab";
import JumuahKhutbahTopicSubmissionTab from "./tabs/JumuahKhutbahTopicSubmissionTab";
import JumuahAudioKhutbahTab from "./tabs/JumuahAudioKhutbahTab";
import MedicalReimbursementTab from "./tabs/MedicalReimbursementTab";
import CommunityEngagementTab from "./tabs/CommunityEngagementTab";
import NikahBonusTab from "./tabs/NikahBonusTab";
import NewMuslimBonusTab from "./tabs/NewMuslimBonusTab";
import NewBabyBonusTab from "./tabs/NewBabyBonusTab";
import ImamRelationshipsTab from "./tabs/ImamRelationshipsTab";
import BoreholeTab from "./tabs/BoreholeTab";
import EducationalDevelopmentTab from "./tabs/EducationalDevelopmentTab";
import TreePlantingTab from "./tabs/TreePlantingTab";
import WAQFLoanTab from "./tabs/WAQFLoanTab";
import HardshipReliefTab from "./tabs/HardshipReliefTab";
import HigherEducationRequestTab from "./tabs/HigherEducationRequestTab";
import BoreholeConstructionTasksTab from "./tabs/BoreholeConstructionTasksTab";
import BoreholeRepairsMatrixTab from "./tabs/BoreholeRepairsMatrixTab";
import TicketsTab from "./tabs/TicketsTab";

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
  relationships,
  borehole,
  educationalDevelopment,
  treePlanting,
  waqfLoan,
  hardshipRelief,
  higherEducationRequest,
  boreholeConstructionTasks,
  boreholeRepairsMatrix,
  tickets,
  lookupData,
  onUpdate,
  showAlert,
  activeTab = "all",
  onTabChange,
}) => {
  const { isOrgExecutive } = useRole();

  if (!imamProfileId) {
    return null;
  }

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      if (onTabChange) {
        onTabChange(tab);
      }
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
  const relationshipsForImam = (relationships || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const boreholeForImam = (borehole || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const educationalDevelopmentForImam = (educationalDevelopment || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const treePlantingForImam = (treePlanting || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const waqfLoanForImam = (waqfLoan || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const hardshipReliefForImam = (hardshipRelief || []).filter((x) => safeNum(x.imam_profile_id) === currentId);
  const higherEducationRequestForImam = (higherEducationRequest || []).filter((x) => safeNum(x.imam_profile_id) === currentId);

  // Use shared constant to ensure consistency with Dashboard buttons
  // DetailTabs uses different IDs for TabPane compatibility, but labels match IMAM_TABS
  const tabs = [
    { id: "all", label: "Show All" },
    { id: "khutbahTopics", label: IMAM_TABS[0].label }, // Jumah Topic
    { id: "audioKhutbah", label: IMAM_TABS[1].label }, // Jumah Audio
    { id: "pearls", label: IMAM_TABS[2].label }, // Wisdom Pearls
    { id: "medical", label: IMAM_TABS[3].label }, // Medical
    { id: "engagement", label: IMAM_TABS[4].label }, // Community
    { id: "nikah", label: IMAM_TABS[5].label }, // Nikah Bonus
    { id: "newMuslim", label: IMAM_TABS[6].label }, // Muslim Bonus
    { id: "newBaby", label: IMAM_TABS[7].label }, // Baby Bonus
    { id: "relationships", label: IMAM_TABS[8].label }, // Relationships
    { id: "borehole", label: IMAM_TABS[9].label }, // Borehole
    { id: "educationalDevelopment", label: "Educational Development" },
    { id: "treePlanting", label: "Tree Planting" },
    { id: "waqfLoan", label: "WAQF Loan" },
    { id: "hardshipRelief", label: "Hardship Relief" },
    { id: "higherEducationRequest", label: "Higher Education Request" },
    { id: "tickets", label: "Tickets" },
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
              <JumuahKhutbahTopicSubmissionTab imamProfileId={imamProfileId} imamProfile={imamProfile} jumuahKhutbahTopicSubmission={khutbahTopicsForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <JumuahAudioKhutbahTab imamProfileId={imamProfileId} imamProfile={imamProfile} jumuahAudioKhutbah={audioKhutbahForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <PearlsOfWisdomTab imamProfileId={imamProfileId} pearlsOfWisdom={pearlsForImam} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <MedicalReimbursementTab imamProfileId={imamProfileId} imamProfile={imamProfile} relationships={relationshipsForImam} medicalReimbursement={medicalForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <CommunityEngagementTab imamProfileId={imamProfileId} communityEngagement={engagementForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <NikahBonusTab imamProfileId={imamProfileId} nikahBonus={nikahForImam} relationships={relationshipsForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <NewMuslimBonusTab imamProfileId={imamProfileId} newMuslimBonus={newMuslimForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <NewBabyBonusTab imamProfileId={imamProfileId} newBabyBonus={newBabyForImam} relationships={relationshipsForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <ImamRelationshipsTab imamProfileId={imamProfileId} relationships={relationshipsForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <BoreholeTab imamProfileId={imamProfileId} borehole={boreholeForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <EducationalDevelopmentTab imamProfileId={imamProfileId} educationalDevelopment={educationalDevelopmentForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <TreePlantingTab imamProfileId={imamProfileId} treePlanting={treePlantingForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <WAQFLoanTab imamProfileId={imamProfileId} waqfLoan={waqfLoanForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <HardshipReliefTab imamProfileId={imamProfileId} hardshipRelief={hardshipReliefForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <HigherEducationRequestTab imamProfileId={imamProfileId} higherEducationRequest={higherEducationRequestForImam} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
            </div>
            
            <div className="border rounded p-3 mb-3">
              <TicketsTab tickets={tickets} lookupData={lookupData} onUpdate={onUpdate} showAlert={showAlert} />
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
              imamProfile={imamProfile}
              jumuahKhutbahTopicSubmission={khutbahTopicsForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="audioKhutbah">
            <JumuahAudioKhutbahTab
              imamProfileId={imamProfileId}
              imamProfile={imamProfile}
              jumuahAudioKhutbah={audioKhutbahForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="medical">
            <MedicalReimbursementTab
              imamProfileId={imamProfileId}
              imamProfile={imamProfile}
              relationships={relationshipsForImam}
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
              relationships={relationshipsForImam}
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
              relationships={relationshipsForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="relationships">
            <ImamRelationshipsTab
              imamProfileId={imamProfileId}
              relationships={relationshipsForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="borehole">
            <BoreholeTab
              imamProfileId={imamProfileId}
              borehole={boreholeForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="educationalDevelopment">
            <EducationalDevelopmentTab
              imamProfileId={imamProfileId}
              educationalDevelopment={educationalDevelopmentForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="treePlanting">
            <TreePlantingTab
              imamProfileId={imamProfileId}
              treePlanting={treePlantingForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="waqfLoan">
            <WAQFLoanTab
              imamProfileId={imamProfileId}
              waqfLoan={waqfLoanForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="hardshipRelief">
            <HardshipReliefTab
              imamProfileId={imamProfileId}
              hardshipRelief={hardshipReliefForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="higherEducationRequest">
            <HigherEducationRequestTab
              imamProfileId={imamProfileId}
              higherEducationRequest={higherEducationRequestForImam}
              lookupData={lookupData}
              onUpdate={onUpdate}
              showAlert={showAlert}
            />
          </TabPane>

          <TabPane tabId="tickets">
            <TicketsTab
              tickets={tickets}
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

