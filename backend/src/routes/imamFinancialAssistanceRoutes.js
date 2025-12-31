const express = require('express');
const router = express.Router();
const imamFinancialAssistanceController = require('../controllers/imamFinancialAssistanceController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', imamFinancialAssistanceController.getAll);
router.get('/:id', imamFinancialAssistanceController.getById);
router.post('/', imamFinancialAssistanceController.create);
router.put('/:id', imamFinancialAssistanceController.update);
router.delete('/:id', imamFinancialAssistanceController.delete);

module.exports = router;

