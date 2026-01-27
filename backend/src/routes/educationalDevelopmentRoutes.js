const express = require('express');
const router = express.Router();
const educationalDevelopmentController = require('../controllers/educationalDevelopmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads/Educational_Development');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

router.get('/:id/view-certificate', optionalAuthMiddleware, educationalDevelopmentController.viewCertificate);
router.get('/:id/view-brochure', optionalAuthMiddleware, educationalDevelopmentController.viewBrochure);
router.get('/:id/view-invoice', optionalAuthMiddleware, educationalDevelopmentController.viewInvoice);

router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', educationalDevelopmentController.getAll);
router.get('/:id', educationalDevelopmentController.getById);
router.get('/:id/download-certificate', educationalDevelopmentController.downloadCertificate);
router.post('/', upload.fields([{ name: 'Brochure' }, { name: 'Invoice' }]), educationalDevelopmentController.create);
router.put('/:id', upload.fields([{ name: 'Brochure' }, { name: 'Invoice' }]), educationalDevelopmentController.update);
router.delete('/:id', educationalDevelopmentController.delete);

module.exports = router;

