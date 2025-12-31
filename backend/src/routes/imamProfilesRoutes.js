const express = require('express');
const router = express.Router();
const imamProfilesController = require('../controllers/imamProfilesController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads/Imam_Profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

router.use(authMiddleware);
router.use(roleMiddleware()); // All staff can access imam profiles
router.use(filterMiddleware);

router.get('/', imamProfilesController.getAll);
router.get('/my-profile', imamProfilesController.getByUsername);
router.get('/:id', imamProfilesController.getById);
router.post('/', upload.fields([{ name: 'Masjid_Image' }]), imamProfilesController.create);
router.put('/:id', upload.fields([{ name: 'Masjid_Image' }]), imamProfilesController.update);
router.delete('/:id', imamProfilesController.delete);

module.exports = router;

