require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const routes  = require('./routes/index');

const app  = express();
const PORT = process.env.PORT || 3000;

//Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

//API routes
app.use('/api', routes);

//Ruta raíz → login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

//Error 404
app.use((req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada' }));

app.listen(PORT, () => {
  console.log(`\n Servidor SaludPlus corriendo en http://localhost:${PORT}`);
  console.log(`API disponible en   http://localhost:${PORT}/api`);
  console.log(`Frontend en         http://localhost:${PORT}\n`);
});
