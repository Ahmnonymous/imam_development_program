const express = require('express');
const router = express.Router();
const nikahBonusController = require('../controllers/nikahBonusController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads/Nikah_Bonus');
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
router.get('/:id/view-certificate', optionalAuthMiddleware, nikahBonusController.viewCertificate);
router.get('/:id/view-nikah-image', optionalAuthMiddleware, nikahBonusController.viewNikahImage);

// ✅ All other endpoints - require authentication, RBAC, and tenant filtering
router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', nikahBonusController.getAll);
router.get('/:id', nikahBonusController.getById);
router.get('/:id/download-certificate', nikahBonusController.downloadCertificate);
router.get('/:id/download-image', nikahBonusController.downloadImage);
router.post('/', upload.fields([{ name: 'Certificate' }, { name: 'Nikah_Image' }]), nikahBonusController.create);
router.put('/:id', upload.fields([{ name: 'Certificate' }, { name: 'Nikah_Image' }]), nikahBonusController.update);
router.delete('/:id', nikahBonusController.delete);

module.exports = router;

