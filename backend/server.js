const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // <--- Añadir esto

const app = express();

app.use(cors());
app.use(express.json());

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes); // <--- Añadir esto

app.get('/', (req, res) => {
  res.send('API de Consulta de Precios Multi-tenant funcionando 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});