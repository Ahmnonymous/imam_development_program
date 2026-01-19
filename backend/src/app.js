const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Serve static files from public directory
app.use("/public", express.static(path.join(__dirname, "../public")));

// ===========================
// 📦 ROUTE IMPORTS
// ===========================

// 🔹 Auth & Lookup
const authRoutes = require("./routes/authRoutes");
const lookupRoutes = require("./routes/lookupRoutes");

// 🔹 Communication
const foldersRoutes = require("./routes/foldersRoutes");
const messagesRoutes = require("./routes/messagesRoutes");
const conversationParticipantsRoutes = require("./routes/conversationParticipantsRoutes");
const conversationsRoutes = require("./routes/conversationsRoutes");

// 🔹 Service Rating
const serviceRatingRoutes = require("./routes/serviceRatingRoutes");

// 🔹 Beneficiary
const financialAssessmentRoutes = require("./routes/financialAssessmentRoutes");
const programsRoutes = require("./routes/programsRoutes");
const employeeSkillsRoutes = require("./routes/employeeSkillsRoutes");
const employeeInitiativeRoutes = require("./routes/employeeInitiativeRoutes");
const employeeAppraisalRoutes = require("./routes/employeeAppraisalRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const policyAndProcedureRoutes = require("./routes/policyAndProcedureRoutes");
const trainingCoursesRoutes = require("./routes/trainingCoursesRoutes");
const trainingInstitutionsRoutes = require("./routes/trainingInstitutionsRoutes");

// 🔹 Personal Files
const personalFilesRoutes = require("./routes/personalFilesRoutes");

// 🔹 Reports
const reportsRoutes = require("./routes/reportsRoutes");

// 🔹 Dashboard
const dashboardRoutes = require("./routes/dashboardRoutes");

// 🔹 Imam Management
const imamProfilesRoutes = require("./routes/imamProfilesRoutes");
const jumuahKhutbahTopicSubmissionRoutes = require("./routes/jumuahKhutbahTopicSubmissionRoutes");
const jumuahAudioKhutbahRoutes = require("./routes/jumuahAudioKhutbahRoutes");
const pearlsOfWisdomRoutes = require("./routes/pearlsOfWisdomRoutes");
const medicalReimbursementRoutes = require("./routes/medicalReimbursementRoutes");
const communityEngagementRoutes = require("./routes/communityEngagementRoutes");
const nikahBonusRoutes = require("./routes/nikahBonusRoutes");
const newMuslimBonusRoutes = require("./routes/newMuslimBonusRoutes");
const newBabyBonusRoutes = require("./routes/newBabyBonusRoutes");
const imamRelationshipsRoutes = require("./routes/imamRelationshipsRoutes");
const boreholeRoutes = require("./routes/boreholeRoutes");
const imamFinancialAssistanceRoutes = require("./routes/imamFinancialAssistanceRoutes");
const educationalDevelopmentRoutes = require("./routes/educationalDevelopmentRoutes");
const treePlantingRoutes = require("./routes/treePlantingRoutes");
const waqfLoanRoutes = require("./routes/waqfLoanRoutes");
const hardshipReliefRoutes = require("./routes/hardshipReliefRoutes");
const higherEducationRequestRoutes = require("./routes/higherEducationRequestRoutes");
const boreholeConstructionTasksRoutes = require("./routes/boreholeConstructionTasksRoutes");
const boreholeRepairsMatrixRoutes = require("./routes/boreholeRepairsMatrixRoutes");
const ticketsRoutes = require("./routes/ticketsRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");

// ===========================
// 📦 ROUTE REGISTRATION
// ===========================

// 🔹 Auth & Lookup
app.use("/api/auth", authRoutes);
app.use("/api/lookup", lookupRoutes);

// 🔹 Communication
app.use("/api/folders", foldersRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/conversationParticipants", conversationParticipantsRoutes);
app.use("/api/conversations", conversationsRoutes);

// 🔹 Service Rating
app.use("/api/serviceRating", serviceRatingRoutes);

// 🔹 Beneficiary
app.use("/api/financialAssessment", financialAssessmentRoutes);
app.use("/api/programs", programsRoutes);

// 🔹 Employee / HSEQ
app.use("/api/employee", employeeRoutes);
app.use("/api/employeeAppraisal", employeeAppraisalRoutes);
app.use("/api/employeeInitiative", employeeInitiativeRoutes);
app.use("/api/employeeSkills", employeeSkillsRoutes);

// 🔹 Training & Centers
app.use("/api/trainingInstitutions", trainingInstitutionsRoutes);
app.use("/api/trainingCourses", trainingCoursesRoutes);
app.use("/api/policyAndProcedure", policyAndProcedureRoutes);

// 🔹 Personal Files
app.use("/api/personalFiles", personalFilesRoutes);

// 🔹 Reports
app.use("/api/reports", reportsRoutes);

// 🔹 Dashboard
app.use("/api/dashboard", dashboardRoutes);

// 🔹 Imam Management
app.use("/api/imamProfiles", imamProfilesRoutes);
app.use("/api/jumuahKhutbahTopic", jumuahKhutbahTopicSubmissionRoutes);
app.use("/api/jumuahAudioKhutbah", jumuahAudioKhutbahRoutes);
app.use("/api/pearlsOfWisdom", pearlsOfWisdomRoutes);
app.use("/api/medicalReimbursement", medicalReimbursementRoutes);
app.use("/api/communityEngagement", communityEngagementRoutes);
app.use("/api/nikahBonus", nikahBonusRoutes);
app.use("/api/newMuslimBonus", newMuslimBonusRoutes);
app.use("/api/newBabyBonus", newBabyBonusRoutes);
app.use("/api/imamRelationships", imamRelationshipsRoutes);
app.use("/api/borehole", boreholeRoutes);
app.use("/api/imamFinancialAssistance", imamFinancialAssistanceRoutes);
app.use("/api/educationalDevelopment", educationalDevelopmentRoutes);
app.use("/api/treePlanting", treePlantingRoutes);
app.use("/api/waqfLoan", waqfLoanRoutes);
app.use("/api/hardshipRelief", hardshipReliefRoutes);
app.use("/api/higherEducationRequest", higherEducationRequestRoutes);
app.use("/api/boreholeConstructionTasks", boreholeConstructionTasksRoutes);
app.use("/api/boreholeRepairsMatrix", boreholeRepairsMatrixRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/emailTemplates", emailTemplateRoutes);

// ✅ Export app for testing
module.exports = app;

// ✅ Server Start (only if not in test environment)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}