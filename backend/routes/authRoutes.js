const express = require('express');
const router = express.Router();
const { registrarNegocio, login } = require('../controllers/authController');

router.post('/registro', registrarNegocio);
router.post('/login', login);

module.exports = router;