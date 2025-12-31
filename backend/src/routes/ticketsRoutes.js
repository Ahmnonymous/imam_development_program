const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads/Tickets');
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

router.get('/', ticketsController.getAll);
router.get('/:id', ticketsController.getById);
router.post('/', upload.fields([{ name: 'Media' }]), ticketsController.create);
router.put('/:id', upload.fields([{ name: 'Media' }]), ticketsController.update);
router.delete('/:id', ticketsController.delete);

module.exports = router;

