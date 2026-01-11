const express = require('express');
const router = express.Router();
const boreholeRepairsMatrixController = require('../controllers/boreholeRepairsMatrixController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads/Borehole_Repairs_Matrix');
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
router.get('/:id/view-task', optionalAuthMiddleware, boreholeRepairsMatrixController.viewTask);
router.get('/:id/view-invoice', optionalAuthMiddleware, boreholeRepairsMatrixController.viewInvoice);
router.get('/:id/view-parts-image', optionalAuthMiddleware, boreholeRepairsMatrixController.viewPartsImage);

// ✅ All other endpoints - require authentication, RBAC, and tenant filtering
router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', boreholeRepairsMatrixController.getAll);
// Generic /:id route must be last to avoid matching specific routes
router.get('/:id', boreholeRepairsMatrixController.getById);
router.post('/', upload.fields([{ name: 'Task' }, { name: 'Invoice' }, { name: 'Parts_Image' }]), boreholeRepairsMatrixController.create);
router.put('/:id', upload.fields([{ name: 'Task' }, { name: 'Invoice' }, { name: 'Parts_Image' }]), boreholeRepairsMatrixController.update);
router.delete('/:id', boreholeRepairsMatrixController.delete);

module.exports = router;

