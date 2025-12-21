const express = require('express');
const router = express.Router();
const jumuahKhutbahTopicSubmissionController = require('../controllers/jumuahKhutbahTopicSubmissionController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', jumuahKhutbahTopicSubmissionController.getAll);
router.get('/:id', jumuahKhutbahTopicSubmissionController.getById);
router.post('/', jumuahKhutbahTopicSubmissionController.create);
router.put('/:id', jumuahKhutbahTopicSubmissionController.update);
router.delete('/:id', jumuahKhutbahTopicSubmissionController.delete);

module.exports = router;

