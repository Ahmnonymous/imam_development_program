const express = require('express');
const router = express.Router();
const medicalReimbursementController = require('../controllers/medicalReimbursementController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads/Medical_Reimbursement');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', medicalReimbursementController.getAll);
router.get('/:id', medicalReimbursementController.getById);
router.get('/:id/download-receipt', medicalReimbursementController.downloadReceipt);
router.get('/:id/download-supporting-docs', medicalReimbursementController.downloadSupportingDocs);
router.post('/', upload.fields([{ name: 'Receipt' }, { name: 'Supporting_Docs' }]), medicalReimbursementController.create);
router.put('/:id', upload.fields([{ name: 'Receipt' }, { name: 'Supporting_Docs' }]), medicalReimbursementController.update);
router.delete('/:id', medicalReimbursementController.delete);

module.exports = router;

