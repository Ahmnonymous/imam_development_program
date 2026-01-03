const express = require('express');
const router = express.Router();
const imamRelationshipsController = require('../controllers/imamRelationshipsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const filterMiddleware = require('../middlewares/filterMiddleware');

// ✅ All endpoints - require authentication, RBAC, and tenant filtering
router.use(authMiddleware);
router.use(roleMiddleware());
router.use(filterMiddleware);

router.get('/', imamRelationshipsController.getAll);
router.get('/:id', imamRelationshipsController.getById);
router.post('/', imamRelationshipsController.create);
router.put('/:id', imamRelationshipsController.update);
router.delete('/:id', imamRelationshipsController.delete);

module.exports = router;





