const express = require('express');
const router = express.Router();
const { obtenerProductos, buscarPorCodigo, guardarProducto } = require('../controllers/productController');

router.get('/:negocioId', obtenerProductos);
router.get('/:negocioId/codigo/:codigo', buscarPorCodigo);
router.post('/', guardarProducto);

module.exports = router;