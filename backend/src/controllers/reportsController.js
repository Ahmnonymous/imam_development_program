const ReportsModel = require('../models/reportsModel');

class ReportsController {
    // ✅ FIXED: Use req.center_id from filterMiddleware (App Admin = null, others = their center_id)
    // Center Audits Report
    static async getCenterAudits(req, res) {
        try {
            const centerId = req.center_id; // Set by filterMiddleware
            const data = await ReportsModel.getCenterAudits(centerId, req.user);
            res.status(200).json({ success: true, data, count: data.length, message: 'Center audits report retrieved successfully' });
        } catch (error) {
            console.error('Error in getCenterAudits:', error);
            res.status(500).json({ success: false, message: 'Error retrieving center audits report', error: error.message });
        }
    }

    // Get Total Financial Assistance Report
    static async getTotalFinancialAssistance(req, res) {
        try {
            const centerId = req.center_id; // Set by filterMiddleware
            const data = await ReportsModel.getTotalFinancialAssistance(centerId, req.user);
            
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Total financial assistance report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getTotalFinancialAssistance:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving total financial assistance report',
                error: error.message
            });
        }
    }

    // Get Financial Assistance Report
    static async getFinancialAssistance(req, res) {
        try {
            const centerId = req.center_id; // Set by filterMiddleware
            const data = await ReportsModel.getFinancialAssistance(centerId, req.user);
            
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Financial assistance report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getFinancialAssistance:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving financial assistance report',
                error: error.message
            });
        }
    }

    // Get Food Assistance Report
    static async getFoodAssistance(req, res) {
        try {
            const centerId = req.center_id; // Set by filterMiddleware
            const data = await ReportsModel.getFoodAssistance(centerId, req.user);
            
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Food assistance report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getFoodAssistance:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving food assistance report',
                error: error.message
            });
        }
    }

    // Get Home Visits Report
    static async getHomeVisits(req, res) {
        try {
            const centerId = req.center_id; // Set by filterMiddleware
            const data = await ReportsModel.getHomeVisits(centerId, req.user);
            
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Home visits report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getHomeVisits:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving home visits report',
                error: error.message
            });
        }
    }

    // Get Relationship Report
    static async getRelationshipReport(req, res) {
        try {
            const centerId = req.center_id; // Set by filterMiddleware
            const data = await ReportsModel.getRelationshipReport(centerId, req.user);
            
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Relationship report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getRelationshipReport:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving relationship report',
                error: error.message
            });
        }
    }



    // Get Skills Matrix Report
    static async getSkillsMatrix(req, res) {
        try {
            const centerId = req.center_id; // Set by filterMiddleware
            const data = await ReportsModel.getSkillsMatrix(centerId, req.user);
            
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Skills matrix report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getSkillsMatrix:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving skills matrix report',
                error: error.message
            });
        }
    }

    // Get Imam Details Report
    static async getImamDetails(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getImamDetails(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Imam details report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getImamDetails:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving imam details report',
                error: error.message
            });
        }
    }

    // Get Hardship Relief Report
    static async getHardshipRelief(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getHardshipRelief(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Hardship relief report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getHardshipRelief:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving hardship relief report',
                error: error.message
            });
        }
    }

    // Get Community Engagement Report
    static async getCommunityEngagement(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getCommunityEngagement(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Community engagement report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getCommunityEngagement:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving community engagement report',
                error: error.message
            });
        }
    }

    // Get Borehole Report
    static async getBorehole(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getBorehole(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Borehole report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getBorehole:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving borehole report',
                error: error.message
            });
        }
    }

    // Get Continuous Professional Development Report
    static async getContinuousProfessionalDevelopment(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getContinuousProfessionalDevelopment(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Continuous professional development report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getContinuousProfessionalDevelopment:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving continuous professional development report',
                error: error.message
            });
        }
    }

    // Get Higher Education Request Report
    static async getHigherEducationRequest(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getHigherEducationRequest(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Higher education request report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getHigherEducationRequest:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving higher education request report',
                error: error.message
            });
        }
    }

    // Get Jumuah Audio Khutbah Report
    static async getJumuahAudioKhutbah(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getJumuahAudioKhutbah(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Jumuah audio khutbah report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getJumuahAudioKhutbah:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving jumuah audio khutbah report',
                error: error.message
            });
        }
    }

    // Get Jumuah Khutbah Topic Submission Report
    static async getJumuahKhutbahTopicSubmission(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getJumuahKhutbahTopicSubmission(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Jumuah khutbah topic submission report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getJumuahKhutbahTopicSubmission:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving jumuah khutbah topic submission report',
                error: error.message
            });
        }
    }

    // Get Medical Reimbursement Report
    static async getMedicalReimbursement(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getMedicalReimbursement(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Medical reimbursement report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getMedicalReimbursement:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving medical reimbursement report',
                error: error.message
            });
        }
    }

    // Get New Baby Bonus Report
    static async getNewBabyBonus(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getNewBabyBonus(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'New baby bonus report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getNewBabyBonus:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving new baby bonus report',
                error: error.message
            });
        }
    }

    // Get New Muslim Bonus Report
    static async getNewMuslimBonus(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getNewMuslimBonus(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'New muslim bonus report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getNewMuslimBonus:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving new muslim bonus report',
                error: error.message
            });
        }
    }

    // Get Nikah Bonus Report
    static async getNikahBonus(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getNikahBonus(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Nikah bonus report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getNikahBonus:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving nikah bonus report',
                error: error.message
            });
        }
    }

    // Get Pearls of Wisdom Report
    static async getPearlsOfWisdom(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getPearlsOfWisdom(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Pearls of wisdom report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getPearlsOfWisdom:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving pearls of wisdom report',
                error: error.message
            });
        }
    }

    // Get Tickets Report
    static async getTickets(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getTickets(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Tickets report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getTickets:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving tickets report',
                error: error.message
            });
        }
    }

    // Get Tree Requests Report
    static async getTreeRequests(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getTreeRequests(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'Tree requests report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getTreeRequests:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving tree requests report',
                error: error.message
            });
        }
    }

    // Get WAQF Loan Report
    static async getWaqfLoan(req, res) {
        try {
            const centerId = req.center_id;
            const data = await ReportsModel.getWaqfLoan(centerId, req.user);
            res.status(200).json({
                success: true,
                data: data,
                count: data.length,
                message: 'WAQF loan report retrieved successfully'
            });
        } catch (error) {
            console.error('Error in getWaqfLoan:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving waqf loan report',
                error: error.message
            });
        }
    }
}

module.exports = ReportsController;
