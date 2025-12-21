const express = require('express');
const router = express.Router();
const jumuahAudioKhutbahController = require('../controllers/jumuahAudioKhutbahController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads/Jumuah_Audio_Khutbah');
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

router.get('/', jumuahAudioKhutbahController.getAll);
router.get('/:id', jumuahAudioKhutbahController.getById);
router.get('/:id/download-audio', jumuahAudioKhutbahController.downloadAudio);
router.post('/', upload.fields([{ name: 'Audio' }]), jumuahAudioKhutbahController.create);
router.put('/:id', upload.fields([{ name: 'Audio' }]), jumuahAudioKhutbahController.update);
router.delete('/:id', jumuahAudioKhutbahController.delete);

module.exports = router;

