const express = require('express');
const router = express.Router();
const boreholeController = require('../controllers/boreholeController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads/Borehole');

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
router.get('/:id/view-current-water-source-image', optionalAuthMiddleware, boreholeController.viewCurrentWaterSourceImage);
router.get('/:id/view-masjid-area-image', optionalAuthMiddleware, boreholeController.viewMasjidAreaImage);

// ✅ All other endpoints - require authentication, RBAC, and tenant filtering
router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', boreholeController.getAll);
router.get('/:id', boreholeController.getById);
router.get('/:id/download-current-water-source-image', boreholeController.viewCurrentWaterSourceImage);
router.get('/:id/download-masjid-area-image', boreholeController.viewMasjidAreaImage);
router.post('/', upload.fields([{ name: 'Current_Water_Source_Image' }, { name: 'Masjid_Area_Image' }]), boreholeController.create);
router.put('/:id', upload.fields([{ name: 'Current_Water_Source_Image' }, { name: 'Masjid_Area_Image' }]), boreholeController.update);
router.delete('/:id', boreholeController.delete);

module.exports = router;

