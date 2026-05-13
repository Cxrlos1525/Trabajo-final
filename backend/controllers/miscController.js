const db = require('../config/db');

//Dashboard
async function getDashboard(req, res) {
  try {
    const [[ventasHoy]]    = await db.query(`SELECT COUNT(*) AS total, COALESCE(SUM(total),0) AS monto FROM ventas WHERE DATE(fecha_hora)=CURDATE() AND estado='Completada'`);
    const [[stockBajo]]    = await db.query(`SELECT COUNT(*) AS total FROM v_stock_bajo`);
    const [[porVencer]]    = await db.query(`SELECT COUNT(*) AS total FROM v_lotes_por_vencer WHERE dias_para_vencer <= 30`);
    const [[alertasPend]]  = await db.query(`SELECT COUNT(*) AS total FROM alertas WHERE estado='Pendiente'`);
    const [ventasSemana]   = await db.query(`SELECT DATE(fecha_hora) AS fecha, COALESCE(SUM(total),0) AS monto, COUNT(*) AS cantidad FROM ventas WHERE fecha_hora >= DATE_SUB(CURDATE(),INTERVAL 7 DAY) AND estado='Completada' GROUP BY DATE(fecha_hora) ORDER BY fecha`);
    const [topProductos]   = await db.query(`SELECT * FROM v_productos_mas_vendidos LIMIT 5`);
    const [stockBajoList]  = await db.query(`SELECT * FROM v_stock_bajo LIMIT 8`);

    res.json({ ok: true, data: {
      resumen: { ventas_hoy: ventasHoy.total, monto_hoy: ventasHoy.monto, stock_bajo: stockBajo.total, por_vencer: porVencer.total, alertas_pendientes: alertasPend.total },
      ventas_semana: ventasSemana,
      top_productos: topProductos,
      stock_bajo: stockBajoList
    }});
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}
// Alertas
async function getAlertas(req, res) {
  try {
    const { estado = 'Pendiente' } = req.query;
    const [rows] = await db.query(
      `SELECT a.*, p.nombre AS producto, p.stock_actual, l.numero_lote, l.fecha_vencimiento
       FROM alertas a
       JOIN productos p ON a.id_producto = p.id_producto
       LEFT JOIN lotes l ON a.id_lote = l.id_lote
       WHERE a.estado = ?
       ORDER BY a.fecha_generacion DESC`, [estado]
    );
    res.json({ ok: true, data: rows });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

async function atenderAlerta(req, res) {
  try {
    await db.query(
      `UPDATE alertas SET estado='Atendida', id_usuario_atiende=?, fecha_atencion=NOW() WHERE id_alerta=?`,
      [req.user.id, req.params.id]
    );
    res.json({ ok: true, message: 'Alerta marcada como atendida' });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

async function generarAlertas(req, res) {
  try {
    await db.query(`CALL sp_generar_alertas_vencimiento()`);
    res.json({ ok: true, message: 'Alertas generadas correctamente' });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}
//Clientes
async function getClientes(req, res) {
  try {
    const { search } = req.query;
    let sql = `SELECT * FROM clientes WHERE id_cliente > 1`;
    const params = [];
    if (search) { sql += ` AND (nombres LIKE ? OR apellidos LIKE ? OR num_doc LIKE ?)`; params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
    sql += ` ORDER BY nombres ASC LIMIT 100`;
    const [rows] = await db.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

async function createCliente(req, res) {
  try {
    const { tipo_doc, num_doc, nombres, apellidos, telefono, email, direccion, fecha_nac } = req.body;

    //Validar formato según tipo de documento
    if (tipo_doc === 'DNI' && !/^\d{8}$/.test(num_doc)) {
      return res.status(400).json({ ok: false, message: 'El DNI debe tener exactamente 8 dígitos numéricos.' });
    }
    if (tipo_doc === 'RUC' && !/^(10|20)\d{9}$/.test(num_doc)) {
      return res.status(400).json({ ok: false, message: 'El RUC debe tener 11 dígitos y comenzar con 10 o 20.' });
    }

    const [r] = await db.query(
      `INSERT INTO clientes (tipo_doc,num_doc,nombres,apellidos,telefono,email,direccion,fecha_nac)
       VALUES (?,?,?,?,?,?,?,?)`,
      [tipo_doc||'DNI', num_doc, nombres, apellidos, telefono||null, email||null, direccion||null, fecha_nac||null]
    );
    res.status(201).json({ ok: true, message: 'Cliente registrado', id: r.insertId });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

async function buscarClienteDoc(req, res) {
  const doc = req.params.doc;
  try {
    //Primero Buscar en BD local primero
    const [rows] = await db.query(`SELECT * FROM clientes WHERE num_doc=? LIMIT 1`, [doc]);
    if (rows.length) return res.json({ ok: true, data: rows[0], fuente: 'local' });

    //Segundo Consultar API externa segun tipo de documento
    const esDNI = doc.length === 8 && /^\d+$/.test(doc);
    const esRUC = doc.length === 11 && /^\d+$/.test(doc);
    if (!esDNI && !esRUC) {
      return res.status(404).json({ ok: false, message: 'Documento no encontrado' });
    }

    let datosPersona = null;

    if (esDNI) {
      try {
        const response = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${doc}`, {
          headers: { Referer: "https://apis.net.pe" }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.nombres || data.nombreCompleto) {
            datosPersona = {
              tipo_doc:  "DNI",
              num_doc:   doc,
              nombres:   data.nombres || "",
              apellidos: data.apellidoPaterno
                ? (data.apellidoPaterno + " " + (data.apellidoMaterno || "")).trim()
                : (data.nombreCompleto || ""),
            };
          }
        }
      } catch (_) {}
    }

    if (esRUC) {
      try {
        const response = await fetch(`https://api.apis.net.pe/v2/sunat/ruc?numero=${doc}`, {
          headers: { Referer: "https://apis.net.pe" }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.razonSocial) {
            datosPersona = {
              tipo_doc:  "RUC",
              num_doc:   doc,
              nombres:   data.razonSocial,
              apellidos: "",
              direccion: data.direccion || "",
            };
          }
        }
      } catch (_) {}
    }

    if (datosPersona) return res.json({ ok: true, data: datosPersona, fuente: "api_externa" });

    return res.status(404).json({ ok: false, message: "No se encontro informacion para este documento" });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

//Categorias
async function getCategorias(req, res) {
  try {
    const [rows] = await db.query(`SELECT * FROM categorias ORDER BY nombre`);
    res.json({ ok: true, data: rows });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}
//Proveedores
async function getProveedores(req, res) {
  try {
    const [rows] = await db.query(`SELECT * FROM proveedores WHERE activo=1 ORDER BY razon_social`);
    res.json({ ok: true, data: rows });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}
//Lotes por vencer
async function getLotesPorVencer(req, res) {
  try {
    const [rows] = await db.query(`SELECT * FROM v_lotes_por_vencer`);
    res.json({ ok: true, data: rows });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

async function createLote(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { id_producto, numero_lote, fecha_fabricacion, fecha_vencimiento, cantidad, precio_compra, id_proveedor } = req.body;

    const [r] = await conn.query(
      `INSERT INTO lotes (id_producto,numero_lote,fecha_fabricacion,fecha_vencimiento,cantidad_inicial,cantidad_actual,precio_compra,id_proveedor,id_usuario)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id_producto, numero_lote, fecha_fabricacion||null, fecha_vencimiento, cantidad, cantidad, precio_compra, id_proveedor, req.user.id]
    );
    //Actualizar stock del producto e insertar movimiento de inventario
    const [[prod]] = await conn.query(`SELECT stock_actual FROM productos WHERE id_producto=?`, [id_producto]);
    const stockNuevo = prod.stock_actual + parseInt(cantidad);
    await conn.query(`UPDATE productos SET stock_actual=? WHERE id_producto=?`, [stockNuevo, id_producto]);
    await conn.query(
      `INSERT INTO movimientos_inventario (id_producto,id_lote,tipo,cantidad,stock_anterior,stock_nuevo,motivo,id_usuario)
       VALUES (?,'${r.insertId}','Entrada',?,?,?,'Ingreso de lote',?)`,
      [id_producto, cantidad, prod.stock_actual, stockNuevo, req.user.id]
    );
    await conn.commit();
    res.status(201).json({ ok: true, message: 'Lote ingresado y stock actualizado', id: r.insertId });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ ok: false, message: e.message });
  } finally { conn.release(); }
}

//Reportes
async function getReporteVentas(req, res) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const inicio = fecha_inicio || new Date(new Date().setDate(1)).toISOString().split('T')[0];
    const fin    = fecha_fin    || new Date().toISOString().split('T')[0];
    const [rows] = await db.query(
      `SELECT * FROM v_ventas_diarias WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC`, [inicio, fin]
    );
    const [[total]] = await db.query(
      `SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS cantidad FROM ventas WHERE DATE(fecha_hora) BETWEEN ? AND ? AND estado='Completada'`, [inicio, fin]
    );
    res.json({ ok: true, data: { detalle: rows, total_periodo: total.total, cantidad_periodo: total.cantidad } });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

async function getReporteInventario(req, res) {
  try {
    const [productos] = await db.query(`SELECT p.*, c.nombre AS categoria FROM productos p JOIN categorias c ON p.id_categoria=c.id_categoria WHERE p.activo=1 ORDER BY p.nombre`);
    const [stockBajo] = await db.query(`SELECT * FROM v_stock_bajo`);
    const [porVencer] = await db.query(`SELECT * FROM v_lotes_por_vencer`);
    res.json({ ok: true, data: { productos, stock_bajo: stockBajo, por_vencer: porVencer } });
  } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
}

module.exports = {
  getDashboard, getAlertas, atenderAlerta, generarAlertas,
  getClientes, createCliente, buscarClienteDoc,
  getCategorias, getProveedores,
  getLotesPorVencer, createLote,
  getReporteVentas, getReporteInventario
};
