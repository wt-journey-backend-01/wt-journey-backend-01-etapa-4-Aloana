const express = require('express')
const router = express.Router();
const casosController = require('../controllers/casosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);
router.get('/', casosController.getAllCasos);
router.get('/:id', casosController.getCasoById);
router.post('/', casosController.createCaso);
router.put('/:id', casosController.updateCaso);
router.patch('/:id', casosController.partialUpdateCaso);
router.delete('/:id', casosController.removeCaso);

module.exports = router;