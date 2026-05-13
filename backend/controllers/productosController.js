const db = require('../config/db');

//GET /api/productos
async function getAll(req, res) {
  try {
    const { search, categoria, activo = 1 } = req.query;
    let sql = `
      SELECT p.*, c.nombre AS categoria, pr.razon_social AS proveedor
      FROM productos p
      JOIN categorias  c  ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor  = pr.id_proveedor
      WHERE p.activo = ?`;
    const params = [activo];

    if (search) {
      sql += ` AND (p.nombre LIKE ? OR p.principio_activo LIKE ? OR p.codigo_barras LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (categoria) { sql += ` AND p.id_categoria = ?`; params.push(categoria); }
    sql += ` ORDER BY p.nombre ASC`;

    const [rows] = await db.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//GET /api/productos/:id
async function getById(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.nombre AS categoria, pr.razon_social AS proveedor
       FROM productos p
       JOIN categorias  c  ON p.id_categoria = c.id_categoria
       JOIN proveedores pr ON p.id_proveedor  = pr.id_proveedor
       WHERE p.id_producto = ?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Producto no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//POST /api/productos
async function create(req, res) {
  try {
    const { codigo_barras, nombre, nombre_generico, principio_activo, presentacion,
            concentracion, unidad_medida, precio_compra, precio_venta,
            stock_actual, stock_minimo, stock_maximo, id_categoria, id_proveedor, requiere_receta } = req.body;

    const [result] = await db.query(
      `INSERT INTO productos (codigo_barras,nombre,nombre_generico,principio_activo,
        presentacion,concentracion,unidad_medida,precio_compra,precio_venta,
        stock_actual,stock_minimo,stock_maximo,id_categoria,id_proveedor,requiere_receta)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [codigo_barras||null, nombre, nombre_generico||null, principio_activo||null,
       presentacion||null, concentracion||null, unidad_medida||'Unidad',
       precio_compra, precio_venta, stock_actual||0, stock_minimo||10,
       stock_maximo||200, id_categoria, id_proveedor, requiere_receta||0]
    );
    res.status(201).json({ ok: true, message: 'Producto creado', id: result.insertId });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//PUT /api/productos/:id
async function update(req, res) {
  try {
    const { nombre, nombre_generico, principio_activo, presentacion, concentracion,
        unidad_medida, precio_compra, precio_venta, stock_actual, stock_minimo, stock_maximo,
        id_categoria, id_proveedor, requiere_receta, activo } = req.body;

await db.query(
  `UPDATE productos SET nombre=?,nombre_generico=?,principio_activo=?,presentacion=?,
    concentracion=?,unidad_medida=?,precio_compra=?,precio_venta=?,stock_actual=?,
    stock_minimo=?,stock_maximo=?,id_categoria=?,id_proveedor=?,requiere_receta=?,activo=?
   WHERE id_producto=?`,
  [nombre, nombre_generico||null, principio_activo||null, presentacion||null,
   concentracion||null, unidad_medida||'Unidad', precio_compra, precio_venta,
   stock_actual || 0, stock_minimo, stock_maximo, id_categoria, id_proveedor,
   requiere_receta||0, activo !== undefined ? activo : 1, req.params.id]
);
    res.json({ ok: true, message: 'Producto actualizado' });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//DELETE /api/productos/:id (desactivar)
async function remove(req, res) {
  try {
    await db.query(`UPDATE productos SET activo=0 WHERE id_producto=?`, [req.params.id]);
    res.json({ ok: true, message: 'Producto desactivado' });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//GET /api/productos/stock/bajo
async function stockBajo(req, res) {
  try {
    const [rows] = await db.query(`SELECT * FROM v_stock_bajo ORDER BY unidades_faltantes DESC`);
    res.json({ ok: true, data: rows });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

module.exports = { getAll, getById, create, update, remove, stockBajo };
