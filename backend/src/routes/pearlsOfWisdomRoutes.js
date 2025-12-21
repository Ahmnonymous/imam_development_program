const express = require('express');
const router = express.Router();
const pearlsOfWisdomController = require('../controllers/pearlsOfWisdomController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', pearlsOfWisdomController.getAll);
router.get('/:id', pearlsOfWisdomController.getById);
router.post('/', pearlsOfWisdomController.create);
router.put('/:id', pearlsOfWisdomController.update);
router.delete('/:id', pearlsOfWisdomController.delete);

module.exports = router;

