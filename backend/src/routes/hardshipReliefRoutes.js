const express = require('express');
const router = express.Router();
const hardshipReliefController = require('../controllers/hardshipReliefController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', hardshipReliefController.getAll);
router.get('/:id', hardshipReliefController.getById);
router.post('/', hardshipReliefController.create);
router.put('/:id', hardshipReliefController.update);
router.delete('/:id', hardshipReliefController.delete);

module.exports = router;

