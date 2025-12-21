const express = require('express');
const router = express.Router();
const newMuslimBonusController = require('../controllers/newMuslimBonusController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', newMuslimBonusController.getAll);
router.get('/:id', newMuslimBonusController.getById);
router.post('/', newMuslimBonusController.create);
router.put('/:id', newMuslimBonusController.update);
router.delete('/:id', newMuslimBonusController.delete);

module.exports = router;

