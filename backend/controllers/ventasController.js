const db = require('../config/db');

//GET /api/ventas
async function getAll(req, res) {
  try {
    const { fecha_inicio, fecha_fin, estado } = req.query;
    let sql = `
      SELECT v.*, CONCAT(u.nombres,' ',u.apellidos) AS cajero,
             CONCAT(c.nombres,' ',c.apellidos) AS cliente
      FROM ventas v
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      WHERE 1=1`;
    const params = [];
    if (fecha_inicio) { sql += ` AND DATE(v.fecha_hora) >= ?`; params.push(fecha_inicio); }
    if (fecha_fin)    { sql += ` AND DATE(v.fecha_hora) <= ?`; params.push(fecha_fin); }
    if (estado)       { sql += ` AND v.estado = ?`;            params.push(estado); }
    sql += ` ORDER BY v.fecha_hora DESC LIMIT 200`;

    const [rows] = await db.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//GET /api/ventas/:id
async function getById(req, res) {
  try {
    const [venta] = await db.query(
      `SELECT v.*, CONCAT(u.nombres,' ',u.apellidos) AS cajero,
              CONCAT(c.nombres,' ',c.apellidos) AS cliente, c.tipo_doc, c.num_doc
       FROM ventas v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       WHERE v.id_venta = ?`, [req.params.id]
    );
    if (!venta.length) return res.status(404).json({ ok: false, message: 'Venta no encontrada' });

    const [detalle] = await db.query(
      `SELECT dv.*, p.nombre AS producto, p.unidad_medida
       FROM detalle_ventas dv
       JOIN productos p ON dv.id_producto = p.id_producto
       WHERE dv.id_venta = ?`, [req.params.id]
    );
    res.json({ ok: true, data: { ...venta[0], detalle } });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//POST /api/ventas  — crea la venta completa con su detalle
async function create(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { tipo_comprobante, id_cliente, tipo_pago, monto_pagado,
            descuento = 0, observacion = '', items } = req.body;
    const id_usuario = req.user.id;

    if (!items || !items.length) throw new Error('La venta debe tener al menos un producto');

    //VALIDACIÓN DE DOCUMENTO SEGÚN TIPO DE COMPROBANTE
    //  TICKET  → DNI opcional (consumidor final sin documento)
    //  BOLETA  → DNI obligatorio siempre 8 dígitos
    //  FACTURA → RUC obligatorio siempre 11 dígitos, inicia con 10 o 20
    if (tipo_comprobante === 'Boleta' || tipo_comprobante === 'Factura') {
      const docRequerido = tipo_comprobante === 'Factura' ? 'RUC' : 'DNI';

      if (!id_cliente) {
        throw new Error(`Para emitir una ${tipo_comprobante} es obligatorio ingresar el ${docRequerido} del cliente.`);
      }

      const [[cliente]] = await conn.query(
        `SELECT num_doc, tipo_doc FROM clientes WHERE id_cliente = ?`, [id_cliente]
      );
      if (!cliente) throw new Error('Cliente no encontrado.');

      if (tipo_comprobante === 'Boleta') {
        if (cliente.tipo_doc !== 'DNI' || !/^\d{8}$/.test(cliente.num_doc)) {
          throw new Error('Para Boleta se requiere un DNI válido (8 dígitos). Verifique los datos del cliente.');
        }
      }

      if (tipo_comprobante === 'Factura') {
        if (cliente.tipo_doc !== 'RUC' || !/^(10|20)\d{9}$/.test(cliente.num_doc)) {
          throw new Error('Para Factura se requiere un RUC válido (11 dígitos, inicio 10 o 20). Verifique los datos del cliente.');
        }
      }
    }
    //Ticket no requiere validación de documento, puede ser consumidor final sin datos o con DNI.

    //Correlativo
    let serieKey = tipo_comprobante === 'Factura' ? 'correlativo_factura' : 'correlativo_boleta';
    let serie    = tipo_comprobante === 'Factura' ? 'F001' : 'B001';
    if (tipo_comprobante === 'Ticket') { serieKey = 'correlativo_ticket'; serie = 'T001'; }

    const [[cfg]] = await conn.query(`SELECT valor FROM configuracion WHERE clave=? FOR UPDATE`, [serieKey]);
    const correlativo = parseInt(cfg.valor) + 1;
    await conn.query(`UPDATE configuracion SET valor=? WHERE clave=?`, [correlativo, serieKey]);

    //Calcular totales
    let subtotal = 0;
    for (const item of items) {
      subtotal += (item.precio_unitario - (item.descuento || 0)) * item.cantidad;
    }
    const total  = Math.round((subtotal - descuento) * 100) / 100;
    const igv    = Math.round(subtotal * 0.18 * 100) / 100;
    const vuelto = Math.round((monto_pagado - total) * 100) / 100;

    //Insertar venta
    const [res1] = await conn.query(
      `INSERT INTO ventas (serie,correlativo,tipo_comprobante,subtotal,igv,descuento,total,
        tipo_pago,monto_pagado,vuelto,id_cliente,id_usuario,observacion,estado)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'Completada')`,
      [serie, correlativo, tipo_comprobante, subtotal, igv, descuento,
       total, tipo_pago, monto_pagado, vuelto, id_cliente || null, id_usuario, observacion]
    );
    const id_venta = res1.insertId;

    //Insertar detalle y mover stock
    for (const item of items) {
      const [[prod]] = await conn.query(
        `SELECT stock_actual, stock_minimo, nombre FROM productos WHERE id_producto=? FOR UPDATE`,
        [item.id_producto]
      );
      if (prod.stock_actual < item.cantidad)
        throw new Error(`Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock_actual}`);

      const sub = (item.precio_unitario - (item.descuento || 0)) * item.cantidad;
      await conn.query(
        `INSERT INTO detalle_ventas (id_venta,id_producto,cantidad,precio_unitario,descuento,subtotal)
         VALUES (?,?,?,?,?,?)`,
        [id_venta, item.id_producto, item.cantidad, item.precio_unitario, item.descuento || 0, sub]
      );

      const stockNuevo = prod.stock_actual - item.cantidad;
      await conn.query(`UPDATE productos SET stock_actual=? WHERE id_producto=?`,
        [stockNuevo, item.id_producto]);

      //Movimiento
      await conn.query(
        `INSERT INTO movimientos_inventario (id_producto,tipo,cantidad,stock_anterior,stock_nuevo,motivo,id_venta,id_usuario)
         VALUES (?,?,?,?,?,?,?,?)`,
        [item.id_producto,'Salida',item.cantidad,prod.stock_actual,stockNuevo,'Venta',id_venta,id_usuario]
      );

      //Alerta stock bajo
      if (stockNuevo <= prod.stock_minimo) {
        await conn.query(
          `INSERT IGNORE INTO alertas (tipo,id_producto,mensaje)
           VALUES ('Stock Bajo',?,?)`,
          [item.id_producto, `Stock bajo: ${prod.nombre} — disponible: ${stockNuevo} uds.`]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ ok: true, message: 'Venta registrada', id_venta, total, vuelto, correlativo, serie });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ ok: false, message: e.message });
  } finally { conn.release(); }
}

//PUT /api/ventas/:id/anular
async function anular(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[venta]] = await conn.query(`SELECT * FROM ventas WHERE id_venta=?`, [req.params.id]);
    if (!venta) throw new Error('Venta no encontrada');
    if (venta.estado === 'Anulada') throw new Error('La venta ya está anulada');

    const [detalle] = await conn.query(`SELECT * FROM detalle_ventas WHERE id_venta=?`, [req.params.id]);

    //Devolver stock
    for (const d of detalle) {
      const [[prod]] = await conn.query(`SELECT stock_actual FROM productos WHERE id_producto=?`, [d.id_producto]);
      const stockNuevo = prod.stock_actual + d.cantidad;
      await conn.query(`UPDATE productos SET stock_actual=? WHERE id_producto=?`, [stockNuevo, d.id_producto]);
      await conn.query(
        `INSERT INTO movimientos_inventario (id_producto,tipo,cantidad,stock_anterior,stock_nuevo,motivo,id_venta,id_usuario)
         VALUES (?,'Devolución',?,?,?,'Anulación de venta',?,?)`,
        [d.id_producto, d.cantidad, prod.stock_actual, stockNuevo, req.params.id, req.user.id]
      );
    }
    await conn.query(`UPDATE ventas SET estado='Anulada' WHERE id_venta=?`, [req.params.id]);
    await conn.commit();
    res.json({ ok: true, message: 'Venta anulada y stock restaurado' });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ ok: false, message: e.message });
  } finally { conn.release(); }
}

//GET /api/ventas/resumen/hoy
async function resumenHoy(req, res) {
  try {
    const [[r]] = await db.query(
      `SELECT COUNT(*) AS total_ventas, COALESCE(SUM(total),0) AS monto_total,
              COALESCE(SUM(descuento),0) AS total_descuentos
       FROM ventas WHERE DATE(fecha_hora)=CURDATE() AND estado='Completada'`
    );
    res.json({ ok: true, data: r });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

module.exports = { getAll, getById, create, anular, resumenHoy };
