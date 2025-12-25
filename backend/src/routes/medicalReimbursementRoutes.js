const express = require('express');
const router = express.Router();
const medicalReimbursementController = require('../controllers/medicalReimbursementController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads/Medical_Reimbursement');
const fs = require('fs');
// Ensure uploads directory exists
const uploadsBaseDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsBaseDir)) {
  fs.mkdirSync(uploadsBaseDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

// ✅ View file endpoints - optional auth (allow viewing without token)
// These must be defined BEFORE the generic /:id route to ensure proper matching
router.get('/:id/view-receipt', optionalAuthMiddleware, medicalReimbursementController.viewReceipt);
router.get('/:id/view-supporting-docs', optionalAuthMiddleware, medicalReimbursementController.viewSupportingDocs);

// ✅ All other endpoints - require authentication, RBAC, and tenant filtering
router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', medicalReimbursementController.getAll);
// Download routes must come before the generic /:id route
router.get('/:id/download-receipt', medicalReimbursementController.downloadReceipt);
router.get('/:id/download-supporting-docs', medicalReimbursementController.downloadSupportingDocs);
// Generic /:id route must be last to avoid matching specific routes
router.get('/:id', medicalReimbursementController.getById);
router.post('/', upload.fields([{ name: 'Receipt' }, { name: 'Supporting_Docs' }]), medicalReimbursementController.create);
router.put('/:id', upload.fields([{ name: 'Receipt' }, { name: 'Supporting_Docs' }]), medicalReimbursementController.update);
router.delete('/:id', medicalReimbursementController.delete);

module.exports = router;

