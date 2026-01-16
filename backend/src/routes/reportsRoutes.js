const express = require('express');
const router = express.Router();
const ReportsController = require('../controllers/reportsController');
const authenticateToken = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');

// ✅ Apply authentication, RBAC, and tenant filtering for reports
router.use(authenticateToken);
router.use(roleMiddleware());

router.use(filterMiddleware);


// Total Financial Assistance Report (includes both financial and food assistance)
router.get('/total-financial-assistance', ReportsController.getTotalFinancialAssistance.bind(ReportsController));

// Financial Assistance Report
router.get('/financial-assistance', ReportsController.getFinancialAssistance.bind(ReportsController));

// Food Assistance Report
router.get('/food-assistance', ReportsController.getFoodAssistance.bind(ReportsController));

// Home Visits Report
router.get('/home-visits', ReportsController.getHomeVisits.bind(ReportsController));

// Center Audits Report
router.get('/center-audits', ReportsController.getCenterAudits.bind(ReportsController));

// Relationship Report
router.get('/relationship-report', ReportsController.getRelationshipReport.bind(ReportsController));



// Skills Matrix Report
router.get('/skills-matrix', ReportsController.getSkillsMatrix.bind(ReportsController));

// Imam Details Report
router.get('/imam-details', ReportsController.getImamDetails.bind(ReportsController));

// Hardship Relief Report
router.get('/hardship-relief', ReportsController.getHardshipRelief.bind(ReportsController));

// Community Engagement Report
router.get('/community-engagement', ReportsController.getCommunityEngagement.bind(ReportsController));

// Borehole Report
router.get('/borehole', ReportsController.getBorehole.bind(ReportsController));

// Continuous Professional Development Report
router.get('/continuous-professional-development', ReportsController.getContinuousProfessionalDevelopment.bind(ReportsController));

// Higher Education Request Report
router.get('/higher-education-request', ReportsController.getHigherEducationRequest.bind(ReportsController));

// Jumuah Audio Khutbah Report
router.get('/jumuah-audio-khutbah', ReportsController.getJumuahAudioKhutbah.bind(ReportsController));

// Jumuah Khutbah Topic Report
router.get('/jumuah-khutbah-topic', ReportsController.getJumuahKhutbahTopicSubmission.bind(ReportsController));

// Medical Reimbursement Report
router.get('/medical-reimbursement', ReportsController.getMedicalReimbursement.bind(ReportsController));

// New Baby Bonus Report
router.get('/new-baby-bonus', ReportsController.getNewBabyBonus.bind(ReportsController));

// New Muslim Bonus Report
router.get('/new-muslim-bonus', ReportsController.getNewMuslimBonus.bind(ReportsController));

// Nikah Bonus Report
router.get('/nikah-bonus', ReportsController.getNikahBonus.bind(ReportsController));

// Pearls of Wisdom Report
router.get('/pearls-of-wisdom', ReportsController.getPearlsOfWisdom.bind(ReportsController));

// Tickets Report
router.get('/tickets', ReportsController.getTickets.bind(ReportsController));

// Tree Requests Report
router.get('/tree-requests', ReportsController.getTreeRequests.bind(ReportsController));

// WAQF Loan Report
router.get('/waqf-loan', ReportsController.getWaqfLoan.bind(ReportsController));

module.exports = router;
