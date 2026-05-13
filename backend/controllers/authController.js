const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ ok: false, message: 'Email y contraseña requeridos' });

  try {
    const [rows] = await db.query(
      `SELECT u.*, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.email = ? AND u.activo = 1`, [email]
    );
    if (!rows.length)
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: user.id_usuario, nombre: `${user.nombres} ${user.apellidos}`, rol: user.rol, id_rol: user.id_rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({
      ok: true,
      token,
      user: { id: user.id_usuario, nombres: user.nombres, apellidos: user.apellidos, email: user.email, rol: user.rol }
    });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
}

//GET /api/auth/me
async function me(req, res) {
  res.json({ ok: true, user: req.user });
}
//Gestion de usuarios solo para el Admin

//GET /api/usuarios
async function getUsuarios(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombres, u.apellidos, u.email,
              u.activo, u.updated_at AS ultimo_acceso,
              r.nombre AS rol
       FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
       ORDER BY u.nombres`
    );
    res.json({ ok: true, data: rows });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}
//POST /api/usuarios
async function createUsuario(req, res) {
  try {
    const { nombres, apellidos, email, password, id_rol } = req.body;
    if (!nombres || !email || !password || !id_rol)
      return res.status(400).json({ ok: false, message: 'Campos obligatorios: nombres, email, password, rol' });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      `INSERT INTO usuarios (nombres, apellidos, email, password, id_rol)
       VALUES (?,?,?,?,?)`,
      [nombres, apellidos || '', email, hash, id_rol]
    );
    res.status(201).json({ ok: true, message: 'Usuario creado', id: r.insertId });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//PUT /api/usuarios/:id
async function updateUsuario(req, res) {
  try {
    const { nombres, apellidos, email, id_rol, activo } = req.body;
    const [r] = await db.query(
      `UPDATE usuarios SET nombres=?, apellidos=?, email=?, id_rol=?, activo=?
       WHERE id_usuario=?`,
      [nombres, apellidos || '', email, id_rol, activo ?? 1, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    res.json({ ok: true, message: 'Usuario actualizado' });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//PUT /api/usuarios/:id/permisos
//El Admin puede dar o quitar permisos adicionales a un cajero
//Los permisos pueden ser cualquiera de los definidos en PERMISOS_CAJERO_DEFAULT o nuevos que se quieran agregar
async function actualizarPermisosCajero(req, res) {
  try {
    const { permisos } = req.body;
    if (!Array.isArray(permisos))
      return res.status(400).json({ ok: false, message: 'permisos debe ser un array' });

    //Verificar que el usuario destino es Cajero
    const [[usuario]] = await db.query(
      `SELECT u.id_usuario, r.nombre AS rol FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ?`, [req.params.id]
    );
    if (!usuario) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    if (usuario.rol !== 'Cajero')
      return res.status(400).json({ ok: false, message: 'Solo se pueden modificar permisos de Cajeros' });

    await db.query(
      `UPDATE usuarios SET permisos_extra = ? WHERE id_usuario = ?`,
      [JSON.stringify(permisos), req.params.id]
    );
    res.json({ ok: true, message: 'Permisos actualizados correctamente', permisos });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//PUT /api/usuarios/:id/activar-desactivar
async function toggleUsuario(req, res) {
  try {
    const [[u]] = await db.query(`SELECT activo FROM usuarios WHERE id_usuario=?`, [req.params.id]);
    if (!u) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    const nuevoEstado = u.activo ? 0 : 1;
    await db.query(`UPDATE usuarios SET activo=? WHERE id_usuario=?`, [nuevoEstado, req.params.id]);
    res.json({ ok: true, message: nuevoEstado ? 'Usuario activado' : 'Usuario desactivado', activo: nuevoEstado });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

module.exports = { login, me, getUsuarios, createUsuario, updateUsuario, actualizarPermisosCajero, toggleUsuario };
