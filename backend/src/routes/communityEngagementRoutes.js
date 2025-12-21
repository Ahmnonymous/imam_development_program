const express = require('express');
const router = express.Router();
const communityEngagementController = require('../controllers/communityEngagementController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads/Community_Engagement');
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

router.get('/', communityEngagementController.getAll);
router.get('/:id', communityEngagementController.getById);
router.get('/:id/download-image', communityEngagementController.downloadImage);
router.post('/', upload.fields([{ name: 'Engagement_Image' }]), communityEngagementController.create);
router.put('/:id', upload.fields([{ name: 'Engagement_Image' }]), communityEngagementController.update);
router.delete('/:id', communityEngagementController.delete);

module.exports = router;

