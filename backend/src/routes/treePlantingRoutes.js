const express = require('express');
const router = express.Router();
const treePlantingController = require('../controllers/treePlantingController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads/Tree_Planting');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

router.get('/:id/view-planting-image', optionalAuthMiddleware, treePlantingController.viewPlantingImage);

router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', treePlantingController.getAll);
router.get('/:id', treePlantingController.getById);
router.get('/:id/download-image', treePlantingController.downloadImage);
router.post('/', upload.fields([{ name: 'Planting_Image' }]), treePlantingController.create);
router.put('/:id', upload.fields([{ name: 'Planting_Image' }]), treePlantingController.update);
router.delete('/:id', treePlantingController.delete);

module.exports = router;

