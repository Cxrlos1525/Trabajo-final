//Control de acceso por roles: Administrador puede todo,
//Cajero solo puede acceder a ventas, clientes y consultas básicas.

const jwt = require('jsonwebtoken');

//Permisos base del cajero solo lo minimo para operar en caja y gestionar clientes.
//El Admin puede otorgar permisos adicionales desde el panel.
const PERMISOS_CAJERO_DEFAULT = [
  'ventas:crear',
  'ventas:ver',
  'ventas:anular',
  'clientes:ver',
  'clientes:crear',
  'productos:ver',
  'dashboard:ver',
  'alertas:ver',
];

//Acciones BLOQUEADAS para el Cajero
const SOLO_ADMIN = [
  'productos:crear',
  'productos:editar',
  'productos:eliminar',
  'lotes:crear',
  'proveedores:gestionar',
  'reportes:exportar',
  'usuarios:gestionar',
  'configuracion:editar',
  'alertas:generar',
];

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ ok: false, message: 'Token requerido' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, message: 'Token inválido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: 'Token expirado o inválido' });
  }
}

//Solo el Administrador puede pasar
function soloAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ ok: false, message: 'No autenticado' });
  if (req.user.rol !== 'Administrador') {
    return res.status(403).json({
      ok: false,
      message: 'Acción restringida: solo el Administrador puede realizar esta operación',
    });
  }
  next();
}

//Verifica que el usuario tenga uno de los roles indicados
function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, message: 'No autenticado' });
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        message: `Sin permiso. Roles requeridos: ${roles.join(', ')}`,
      });
    }
    next();
  };
}

//Verifica un permiso granular (Admin siempre pasa)
function verificarPermiso(permiso) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, message: 'No autenticado' });
    if (req.user.rol === 'Administrador') return next();
    const permisosUsuario = req.user.permisos || PERMISOS_CAJERO_DEFAULT;
    if (!permisosUsuario.includes(permiso)) {
      return res.status(403).json({
        ok: false,
        message: `No tienes permiso para: ${permiso}. Solicita autorización al Administrador.`,
      });
    }
    next();
  };
}

module.exports = { authMiddleware, roleMiddleware, soloAdmin, verificarPermiso, PERMISOS_CAJERO_DEFAULT, SOLO_ADMIN };
