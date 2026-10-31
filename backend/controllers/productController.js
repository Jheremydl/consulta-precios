const db = require('../services/db');

// Obtener todos los productos de un negocio específico
async function obtenerProductos(req, res) {
  const { negocioId } = req.params;

  try {
    const resultado = await db.query(
      'SELECT * FROM productos WHERE negocio_id = $1 ORDER BY creado_en DESC',
      [negocioId]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno al obtener los productos.' });
  }
}

// Buscar un producto por código de barras dentro de un negocio (¡ideal para el escáner!)
async function buscarPorCodigo(req, res) {
  const { negocioId, codigo } = req.params;

  try {
    const resultado = await db.query(
      'SELECT * FROM productos WHERE negocio_id = $1 AND codigo_barras = $2',
      [negocioId, codigo]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en este negocio.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al buscar producto por código:', error);
    res.status(500).json({ error: 'Error interno al buscar el producto.' });
  }
}

// Registrar o actualizar un producto para el negocio
async function guardarProducto(req, res) {
  const { negocio_id, codigo_barras, nombre, precio, stock } = req.body;

  try {
    // Verificamos si el código de barras ya existe para este negocio
    const productoExistente = await db.query(
      'SELECT * FROM productos WHERE negocio_id = $1 AND codigo_barras = $2',
      [negocio_id, codigo_barras]
    );

    let resultado;
    if (productoExistente.rows.length > 0) {
      // Si ya existe, lo actualizamos
      resultado = await db.query(
        `UPDATE productos 
         SET nombre = $1, precio = $2, stock = $3 
         WHERE negocio_id = $4 AND codigo_barras = $5 
         RETURNING *`,
        [nombre, precio, stock || 0, negocio_id, codigo_barras]
      );
      return res.json({ message: 'Producto actualizado exitosamente', producto: resultado.rows[0] });
    } else {
      // Si no existe, lo creamos nuevo
      resultado = await db.query(
        `INSERT INTO productos (negocio_id, codigo_barras, nombre, precio, stock) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [negocio_id, codigo_barras, nombre, precio, stock || 0]
      );
      return res.status(201).json({ message: 'Producto creado exitosamente', producto: resultado.rows[0] });
    }
  } catch (error) {
    console.error('Error al guardar producto:', error);
    res.status(500).json({ error: 'Error interno al guardar el producto.' });
  }
}

module.exports = {
  obtenerProductos,
  buscarPorCodigo,
  guardarProducto
};