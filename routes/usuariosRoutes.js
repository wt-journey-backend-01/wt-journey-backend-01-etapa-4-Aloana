const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/me', usuariosController.getMe);

router.delete('/:id', usuariosController.deleteUser);

module.exports = router;