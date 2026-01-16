const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplateController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// View image endpoint - no auth required (for email display)
router.get('/:id/view-image', emailTemplateController.viewImage);

// All other routes require authentication
router.use(authMiddleware);

// Get by type - allow all authenticated users (for email sending)
router.get('/type/:templateType', emailTemplateController.getByType);

// Only App Admin (role 1) can manage email templates
router.use(roleMiddleware({ allowedRoles: [1] }));

router.get('/', emailTemplateController.getAll);
router.get('/:id', emailTemplateController.getById);
router.post('/', emailTemplateController.upload, emailTemplateController.create);
router.put('/:id', emailTemplateController.upload, emailTemplateController.update);
router.delete('/:id', emailTemplateController.delete);

module.exports = router;

