const express = require('express');
const router = express.Router();
const higherEducationRequestController = require('../controllers/higherEducationRequestController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads/Higher_Education_Request');
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

router.get('/', higherEducationRequestController.getAll);
router.get('/:id', higherEducationRequestController.getById);
router.post('/', upload.fields([{ name: 'Course_Brochure' }, { name: 'Quotation' }, { name: 'Motivation_Letter' }]), higherEducationRequestController.create);
router.put('/:id', upload.fields([{ name: 'Course_Brochure' }, { name: 'Quotation' }, { name: 'Motivation_Letter' }]), higherEducationRequestController.update);
router.delete('/:id', higherEducationRequestController.delete);

module.exports = router;

