const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
});

module.exports = router;