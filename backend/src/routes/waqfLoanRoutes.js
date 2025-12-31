const express = require('express');
const router = express.Router();
const waqfLoanController = require('../controllers/waqfLoanController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', waqfLoanController.getAll);
router.get('/:id', waqfLoanController.getById);
router.post('/', waqfLoanController.create);
router.put('/:id', waqfLoanController.update);
router.delete('/:id', waqfLoanController.delete);

module.exports = router;

