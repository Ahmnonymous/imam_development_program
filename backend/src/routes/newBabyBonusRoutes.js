const express = require('express');
const router = express.Router();
const newBabyBonusController = require('../controllers/newBabyBonusController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads/New_Baby_Bonus');
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

router.get('/', newBabyBonusController.getAll);
router.get('/:id', newBabyBonusController.getById);
router.get('/:id/download-baby-image', newBabyBonusController.downloadBabyImage);
router.get('/:id/download-birth-certificate', newBabyBonusController.downloadBirthCertificate);
router.post('/', upload.fields([{ name: 'Baby_Image' }, { name: 'Birth_Certificate' }]), newBabyBonusController.create);
router.put('/:id', upload.fields([{ name: 'Baby_Image' }, { name: 'Birth_Certificate' }]), newBabyBonusController.update);
router.delete('/:id', newBabyBonusController.delete);

module.exports = router;

