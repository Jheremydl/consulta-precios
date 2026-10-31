const db = require('../services/db');
const bcrypt = require('bcryptjs');

// Registrar un nuevo negocio y su usuario administrador inicial
async function registrarNegocio(req, res) {
  const { nombreNegocio, slug, nombreUsuario, email, password } = req.body;

  try {
    // 1. Verificar si el slug o el email ya existen
    const negocioExistente = await db.query('SELECT * FROM negocios WHERE slug = $1', [slug]);
    if (negocioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'El identificador (slug) del negocio ya está en uso.' });
    }

    const usuarioExistente = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insertar el negocio
    const nuevoNegocio = await db.query(
      'INSERT INTO negocios (nombre, slug) VALUES ($1, $2) RETURNING *',
      [nombreNegocio, slug]
    );
    const negocioId = nuevoNegocio.rows[0].id;

    // 4. Insertar el usuario administrador vinculado al negocio
    const nuevoUsuario = await db.query(
      'INSERT INTO usuarios (negocio_id, nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, email, rol, negocio_id',
      [negocioId, nombreUsuario, email, passwordHash, 'admin']
    );

    res.status(201).json({
      message: 'Negocio y usuario registrados exitosamente',
      negocio: nuevoNegocio.rows[0],
      usuario: nuevoUsuario.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar negocio:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar el negocio.' });
  }
}

// Iniciar sesión para un usuario de un negocio
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const resultado = await db.query(
      `u.*, n.nombre as negocio_nombre, n.slug as negocio_slug 
       FROM usuarios u 
       JOIN negocios n ON u.negocio_id = n.id 
       WHERE u.email = $1`,
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const usuario = resultado.rows[0];

    // Validar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    res.json({
      message: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        negocio_id: usuario.negocio_id,
        negocio_nombre: usuario.negocio_nombre,
        negocio_slug: usuario.negocio_slug
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
}

module.exports = {
  registrarNegocio,
  login
};