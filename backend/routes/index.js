// routes/index.js
// Define TODAS las rutas del sistema con permisos aplicados:
//   - authMiddleware: requiere token válido
//   - soloAdmin:      solo el Administrador puede acceder
//   - roleMiddleware('Administrador','Cajero'): ambos roles pueden

const express = require('express');
const router  = express.Router();

const { authMiddleware, soloAdmin, roleMiddleware, verificarPermiso } = require('../middleware/auth');

const authCtrl     = require('../controllers/authController');
const ventasCtrl   = require('../controllers/ventasController');
const productosCtrl = require('../controllers/productosController');
const miscCtrl     = require('../controllers/miscController');

// ============================================================
//  AUTH  (sin token)
// ============================================================
router.post('/auth/login', authCtrl.login);
router.get ('/auth/me',    authMiddleware, authCtrl.me);

// ============================================================
//  DASHBOARD
//  Ambos roles pueden ver el dashboard
// ============================================================
router.get('/dashboard', authMiddleware, roleMiddleware('Administrador','Cajero'), miscCtrl.getDashboard);

// ============================================================
//  VENTAS
//  Cajero y Admin crean y ven ventas.
//  Solo Admin puede ver reportes completos de otros cajeros.
// ============================================================
router.get ('/ventas',                authMiddleware, roleMiddleware('Administrador','Cajero'), ventasCtrl.getAll);
router.get ('/ventas/resumen/hoy',    authMiddleware, roleMiddleware('Administrador','Cajero'), ventasCtrl.resumenHoy);
router.get ('/ventas/:id',            authMiddleware, roleMiddleware('Administrador','Cajero'), ventasCtrl.getById);
router.post('/ventas',                authMiddleware, roleMiddleware('Administrador','Cajero'), ventasCtrl.create);
router.put ('/ventas/:id/anular',     authMiddleware, roleMiddleware('Administrador','Cajero'), ventasCtrl.anular);

// ============================================================
//  PRODUCTOS
//  Cajero solo CONSULTA. Admin puede crear, editar y eliminar.
// ============================================================
router.get('/productos',              authMiddleware, roleMiddleware('Administrador','Cajero'), productosCtrl.getAll);
router.get('/productos/bajo-stock',   authMiddleware, roleMiddleware('Administrador','Cajero'), productosCtrl.stockBajo);
router.get('/productos/vencimientos', authMiddleware, roleMiddleware('Administrador','Cajero'), productosCtrl.stockBajo);
router.get('/productos/:id',          authMiddleware, roleMiddleware('Administrador','Cajero'), productosCtrl.getById);

// Solo Admin puede modificar productos
router.post  ('/productos',        authMiddleware, soloAdmin, productosCtrl.create);
router.put   ('/productos/:id',    authMiddleware, soloAdmin, productosCtrl.update);
router.delete('/productos/:id',    authMiddleware, soloAdmin, productosCtrl.remove);

// ============================================================
//  CLIENTES
//  Ambos roles pueden buscar y registrar clientes.
// ============================================================
router.get ('/clientes',              authMiddleware, roleMiddleware('Administrador','Cajero'), miscCtrl.getClientes);
router.post('/clientes',              authMiddleware, roleMiddleware('Administrador','Cajero'), miscCtrl.createCliente);
router.get ('/clientes/doc/:doc',     authMiddleware, roleMiddleware('Administrador','Cajero'), miscCtrl.buscarClienteDoc);

// ============================================================
//  LOTES / INVENTARIO
//  Cajero puede ver. Solo Admin puede crear/editar lotes.
// ============================================================
router.get ('/lotes/por-vencer',  authMiddleware, roleMiddleware('Administrador','Cajero'), miscCtrl.getLotesPorVencer);
router.post('/lotes',             authMiddleware, soloAdmin, miscCtrl.createLote);

// ============================================================
//  ALERTAS
//  Ambos ven alertas. Solo Admin puede generarlas manualmente.
// ============================================================
router.get ('/alertas',             authMiddleware, roleMiddleware('Administrador','Cajero'), miscCtrl.getAlertas);
router.put ('/alertas/:id/atender', authMiddleware, roleMiddleware('Administrador','Cajero'), miscCtrl.atenderAlerta);
router.post('/alertas/generar',     authMiddleware, soloAdmin, miscCtrl.generarAlertas);

// ============================================================
//  CATEGORÍAS Y PROVEEDORES (catálogos)
//  Ambos los leen. Solo Admin los administra.
// ============================================================
router.get('/categorias',  authMiddleware, roleMiddleware('Administrador','Cajero'), miscCtrl.getCategorias);
router.get('/proveedores', authMiddleware, roleMiddleware('Administrador','Cajero'), miscCtrl.getProveedores);

// ============================================================
//  REPORTES  — solo Administrador
// ============================================================
router.get('/reportes/ventas',      authMiddleware, soloAdmin, miscCtrl.getReporteVentas);
router.get('/reportes/inventario',  authMiddleware, soloAdmin, miscCtrl.getReporteInventario);

// ============================================================
//  USUARIOS  — solo Administrador
//  El admin puede listar usuarios y cambiar permisos de cajeros.
// ============================================================
router.get ('/usuarios',                        authMiddleware, soloAdmin, authCtrl.getUsuarios);
router.post('/usuarios',                        authMiddleware, soloAdmin, authCtrl.createUsuario);
router.put ('/usuarios/:id',                    authMiddleware, soloAdmin, authCtrl.updateUsuario);
router.put ('/usuarios/:id/permisos',           authMiddleware, soloAdmin, authCtrl.actualizarPermisosCajero);
router.put ('/usuarios/:id/activar-desactivar', authMiddleware, soloAdmin, authCtrl.toggleUsuario);

module.exports = router;
