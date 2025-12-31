const express = require('express');
const router = express.Router();
const boreholeConstructionTasksController = require('../controllers/boreholeConstructionTasksController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads/Borehole_Construction_Tasks');
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

router.get('/', boreholeConstructionTasksController.getAll);
router.get('/:id', boreholeConstructionTasksController.getById);
router.post('/', upload.fields([{ name: 'Invoice' }]), boreholeConstructionTasksController.create);
router.put('/:id', upload.fields([{ name: 'Invoice' }]), boreholeConstructionTasksController.update);
router.delete('/:id', boreholeConstructionTasksController.delete);

module.exports = router;

