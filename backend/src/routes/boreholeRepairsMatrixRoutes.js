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

router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', boreholeRepairsMatrixController.getAll);
router.get('/:id', boreholeRepairsMatrixController.getById);
router.post('/', upload.fields([{ name: 'Task' }, { name: 'Invoice' }, { name: 'Parts_Image' }]), boreholeRepairsMatrixController.create);
router.put('/:id', upload.fields([{ name: 'Task' }, { name: 'Invoice' }, { name: 'Parts_Image' }]), boreholeRepairsMatrixController.update);
router.delete('/:id', boreholeRepairsMatrixController.delete);

module.exports = router;

