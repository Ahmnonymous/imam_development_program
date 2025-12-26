const express = require('express');
const router = express.Router();
const imamProfilesController = require('../controllers/imamProfilesController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware()); // All staff can access imam profiles
router.use(filterMiddleware);

router.get('/', imamProfilesController.getAll);
router.get('/my-profile', imamProfilesController.getByUsername);
router.get('/:id', imamProfilesController.getById);
router.post('/', imamProfilesController.create);
router.put('/:id', imamProfilesController.update);
router.delete('/:id', imamProfilesController.delete);

module.exports = router;

