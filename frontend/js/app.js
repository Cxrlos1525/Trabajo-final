let carrito       = [];
let posClienteId  = null;
let categoriasArr = [];
let proveedoresArr = [];
let productosArr  = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  const user = getUser();
  document.getElementById('sb-user-name').textContent = `${user.nombres} ${user.apellidos}`;
  document.getElementById('sb-user-rol').textContent  = user.rol;
  document.getElementById('top-user').textContent     = user.rol;
  cargarDashboard();
  cargarAlertasBadge();
  cargarSelectores();
  aplicarPermisosPorRol(user.rol);
  setInterval(cargarAlertasBadge, 60000);
});

//Control de accesos por rol de usuario
function aplicarPermisosPorRol(rol) {
  const esAdmin = rol === 'Administrador';

  //Menu y secciones de usuarios y permisos solo para Admin
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = esAdmin ? '' : 'none';
  });

  //Boton nuevo/editar producto solo para Admin
  document.querySelectorAll('[onclick="abrirModalProducto()"]').forEach(el => {
    el.style.display = esAdmin ? '' : 'none';
  });

  //Boton ingresar lote solo para Admin
  document.querySelectorAll('[onclick*="modal-lote"]').forEach(el => {
    el.style.display = esAdmin ? '' : 'none';
  });

  //Boton generar alertas solo para Admin
  document.querySelectorAll('[onclick="generarAlertas()"]').forEach(el => {
    el.style.display = esAdmin ? '' : 'none';
  });

  //Menu de reportes solo para Admin
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.getAttribute('onclick') === "goTo('reportes')") {
      el.style.display = esAdmin ? '' : 'none';
    }
  });
  document.querySelectorAll('.nav-sep').forEach(el => {
    if (el.textContent.trim() === 'Reportes' && !esAdmin) el.style.display = 'none';
  });
}

//Navegación entre secciones
const PAGE_TITLES = {
  dashboard: 'Dashboard', pos: 'Punto de Venta', productos: 'Productos',
  ventas: 'Historial de Ventas', clientes: 'Clientes',
  lotes: 'Lotes / Vencimientos', alertas: 'Alertas', reportes: 'Reportes', usuarios: 'Usuarios y Permisos'
};

function goTo(sec) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`sec-${sec}`).classList.add('active');
  document.getElementById('page-title').textContent = PAGE_TITLES[sec] || sec;

  //Marcar como activo el item del menú correspondiente a la sección actual
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') === `goTo('${sec}')`) n.classList.add('active');
  });

  const loaders = {
    dashboard: cargarDashboard,
    pos:       buscarProductosPOS,
    productos: cargarProductos,
    ventas:    cargarVentas,
    clientes:  cargarClientes,
    lotes:     cargarLotes,
    alertas:   () => cargarAlertas('Pendiente'),
    reportes:  () => {},
    usuarios:  cargarUsuarios
  };
  if (loaders[sec]) loaders[sec]();
}

//Selectores de categorías, proveedores y productos
async function cargarSelectores() {
  try {
    const [cats, provs, prods] = await Promise.all([
      api.get('/categorias'), api.get('/proveedores'), api.get('/productos')
    ]);
    categoriasArr  = cats.data;
    proveedoresArr = provs.data;
    productosArr   = prods.data;

    ['mprod-cat', 'prod-cat'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const base = id === 'prod-cat' ? '<option value="">Todas las categorías</option>' : '';
      sel.innerHTML = base + categoriasArr.map(c =>
        `<option value="${c.id_categoria}">${c.nombre}</option>`).join('');
    });
    ['mprod-prov', 'mlote-prov'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = proveedoresArr.map(p =>
        `<option value="${p.id_proveedor}">${p.razon_social}</option>`).join('');
    });
    const selProd = document.getElementById('mlote-prod');
    if (selProd) selProd.innerHTML = productosArr.map(p =>
      `<option value="${p.id_producto}">${p.nombre}</option>`).join('');
  } catch (e) { console.error('Error cargando selectores:', e); }
}

//Dashboard
async function cargarDashboard() {
  try {
    const { data } = await api.get('/dashboard');
    const r = data.resumen;
    document.getElementById('d-ventas').textContent  = fmt.num(r.ventas_hoy);
    document.getElementById('d-monto').textContent   = fmt.money(r.monto_hoy);
    document.getElementById('d-stock').textContent   = r.stock_bajo;
    document.getElementById('d-alertas').textContent = r.alertas_pendientes;

    renderTable('dash-stock-tb', data.stock_bajo, [
      r => r.nombre,
      r => `<span class="badge badge-danger">${r.stock_actual}</span>`,
      r => r.stock_minimo
    ]);
    renderTable('dash-top-tb', data.top_productos, [
      r => r.nombre,
      r => fmt.num(r.total_vendido),
      r => fmt.money(r.ingresos_totales)
    ]);
  } catch (e) { toast('Error cargando dashboard: ' + e.message, 'error'); }
}

//Alertas badge 
async function cargarAlertasBadge() {
  try {
    const { data } = await api.get('/alertas?estado=Pendiente');
    const n = data.length;
    const el = document.getElementById('top-alert-count');
    const nb = document.getElementById('nav-alert-badge');
    if (n > 0) {
      el.textContent = n; el.classList.remove('hidden');
      nb.textContent = n; nb.classList.remove('hidden');
    } else {
      el.classList.add('hidden'); nb.classList.add('hidden');
    }
  } catch (e) {}
}

//Productos
async function cargarProductos() {
  try {
    const search = document.getElementById('prod-search')?.value || '';
    const cat    = document.getElementById('prod-cat')?.value    || '';
    let url = `/productos?activo=1`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (cat)    url += `&categoria=${cat}`;
    const { data } = await api.get(url);

    renderTable('prod-tb', data, [
      r => `<span style="font-family:monospace;font-size:12px">${r.codigo_barras || '—'}</span>`,
      r => `<strong>${r.nombre}</strong><br><small style="color:var(--gray-3)">${r.presentacion || ''} ${r.concentracion || ''}</small>`,
      r => r.categoria,
      r => fmt.money(r.precio_venta),
      r => `<span class="badge ${r.stock_actual <= r.stock_minimo ? 'badge-danger' : 'badge-success'}">${r.stock_actual}</span>`,
      r => r.stock_minimo,
      r => r.activo
        ? '<span class="badge badge-success">Activo</span>'
        : '<span class="badge badge-gray">Inactivo</span>',
      r => {
        const u = getUser();
        if (u && u.rol === 'Administrador') {
          return `
            <button class="btn btn-sm btn-outline btn-icon" title="Editar" onclick="editarProducto(${r.id_producto})">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-icon" title="Desactivar" onclick="desactivarProducto(${r.id_producto},'${r.nombre.replace(/'/g,"\\'")}')">
              <i class="fa-solid fa-trash"></i>
            </button>`;
        }
        return '<span style="font-size:11px;color:var(--gray-3)">Solo lectura</span>';
      }
    ]);
  } catch (e) { toast('Error cargando productos: ' + e.message, 'error'); }
}

function abrirModalProducto() {
  document.getElementById('mprod-id').value = '';
  document.getElementById('mprod-title').textContent = 'Nuevo Producto';
  ['mprod-nombre','mprod-generico','mprod-principio','mprod-codigo','mprod-concentracion',
   'mprod-pcompra','mprod-pventa','mprod-stock','mprod-smin','mprod-smax'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('mprod-receta').checked = false;
  openModal('modal-producto');
}

async function editarProducto(id) {
  try {
    const { data: p } = await api.get(`/productos/${id}`);
    document.getElementById('mprod-id').value           = p.id_producto;
    document.getElementById('mprod-nombre').value       = p.nombre;
    document.getElementById('mprod-generico').value     = p.nombre_generico  || '';
    document.getElementById('mprod-principio').value    = p.principio_activo || '';
    document.getElementById('mprod-codigo').value       = p.codigo_barras    || '';
    document.getElementById('mprod-presentacion').value = p.presentacion     || '';
    document.getElementById('mprod-concentracion').value= p.concentracion    || '';
    document.getElementById('mprod-pcompra').value      = p.precio_compra;
    document.getElementById('mprod-pventa').value       = p.precio_venta;
    document.getElementById('mprod-stock').value        = p.stock_actual;
    document.getElementById('mprod-smin').value         = p.stock_minimo;
    document.getElementById('mprod-smax').value         = p.stock_maximo;
    document.getElementById('mprod-cat').value          = p.id_categoria;
    document.getElementById('mprod-prov').value         = p.id_proveedor;
    document.getElementById('mprod-receta').checked     = !!p.requiere_receta;
    document.getElementById('mprod-title').textContent  = 'Editar Producto';
    openModal('modal-producto');
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function guardarProducto() {
  const id   = document.getElementById('mprod-id').value;
  const body = {
    nombre:           document.getElementById('mprod-nombre').value.trim(),
    nombre_generico:  document.getElementById('mprod-generico').value.trim(),
    principio_activo: document.getElementById('mprod-principio').value.trim(),
    codigo_barras:    document.getElementById('mprod-codigo').value.trim(),
    presentacion:     document.getElementById('mprod-presentacion').value,
    concentracion:    document.getElementById('mprod-concentracion').value.trim(),
    precio_compra:    parseFloat(document.getElementById('mprod-pcompra').value),
    precio_venta:     parseFloat(document.getElementById('mprod-pventa').value),
    stock_actual:     parseInt(document.getElementById('mprod-stock').value)  || 0,
    stock_minimo:     parseInt(document.getElementById('mprod-smin').value)   || 10,
    stock_maximo:     parseInt(document.getElementById('mprod-smax').value)   || 200,
    id_categoria:     document.getElementById('mprod-cat').value,
    id_proveedor:     document.getElementById('mprod-prov').value,
    requiere_receta:  document.getElementById('mprod-receta').checked ? 1 : 0,
    activo: 1
  };
  if (!body.nombre || !body.precio_venta || !body.id_categoria) {
    toast('Complete los campos obligatorios', 'warning'); return;
  }
  try {
    if (id) await api.put(`/productos/${id}`, body);
    else    await api.post('/productos', body);
    toast('Producto guardado correctamente');
    closeModal('modal-producto');
    cargarProductos();
    cargarSelectores();
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function desactivarProducto(id, nombre) {
  if (!confirmAction(`¿Desactivar el producto "${nombre}"?`)) return;
  try {
    await api.delete(`/productos/${id}`);
    toast('Producto desactivado');
    cargarProductos();
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

//Punto de venta
let posTimer = null;
async function buscarProductosPOS() {
  clearTimeout(posTimer);
  posTimer = setTimeout(async () => {
    const search = document.getElementById('pos-search')?.value.trim();
    if (!search) { document.getElementById('pos-productos-tb').innerHTML = ''; return; }
    try {
      const { data } = await api.get(`/productos?search=${encodeURIComponent(search)}&activo=1`);
      renderTable('pos-productos-tb', data, [
        r => `${r.nombre}<br><small style="color:var(--gray-3)">${r.presentacion||''} ${r.concentracion||''}</small>`,
        r => fmt.money(r.precio_venta),
        r => `<span class="badge ${r.stock_actual > 0 ? 'badge-success':'badge-danger'}">${r.stock_actual}</span>`,
        r => r.stock_actual > 0
          ? `<button class="btn btn-primary btn-sm" onclick="agregarAlCarrito(${r.id_producto},'${r.nombre.replace(/'/g,"\\'")}',${r.precio_venta},${r.stock_actual})">
               <i class="fa-solid fa-plus"></i> Agregar
             </button>`
          : `<span style="color:var(--danger);font-size:12px">Sin stock</span>`
      ]);
    } catch (e) { toast('Error: ' + e.message, 'error'); }
  }, 350);
}

function agregarAlCarrito(id, nombre, precio, stock) {
  const exist = carrito.find(i => i.id === id);
  if (exist) {
    if (exist.cantidad >= stock) { toast('Stock máximo alcanzado', 'warning'); return; }
    exist.cantidad++;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1, stock });
  }
  renderCarrito();
}

function renderCarrito() {
  const cont = document.getElementById('carrito-items');
  const summ = document.getElementById('cart-summary');
  if (!carrito.length) {
    cont.innerHTML = '<p style="text-align:center;padding:24px;color:var(--gray-3);font-size:13px">Sin productos agregados</p>';
    summ.style.display = 'none';
    return;
  }
  summ.style.display = 'block';
  cont.innerHTML = carrito.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="name">${item.nombre}</div>
        <div class="price-unit">${fmt.money(item.precio)} c/u</div>
      </div>
      <input class="cart-qty" type="number" min="1" max="${item.stock}" value="${item.cantidad}"
        onchange="cambiarCantidad(${i}, this.value)">
      <div class="cart-total">${fmt.money(item.precio * item.cantidad)}</div>
      <button class="btn btn-sm btn-danger btn-icon" onclick="quitarDelCarrito(${i})" title="Quitar">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `).join('');
  calcTotales();
}

function cambiarCantidad(idx, val) {
  const q = parseInt(val);
  if (q < 1 || q > carrito[idx].stock) { toast('Cantidad inválida', 'warning'); renderCarrito(); return; }
  carrito[idx].cantidad = q;
  calcTotales();
}

function quitarDelCarrito(idx) { carrito.splice(idx, 1); renderCarrito(); }

function limpiarCarrito() {
  carrito = []; posClienteId = null;
  document.getElementById('pos-dni').value = '';
  document.getElementById('pos-cliente-name').textContent = '';
  renderCarrito();
}

function calcTotales() {
  const sub   = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const desc  = parseFloat(document.getElementById('cs-desc').value) || 0;
  const total = Math.max(0, sub - desc);
  document.getElementById('cs-sub').textContent   = fmt.money(sub);
  document.getElementById('cs-total').textContent = fmt.money(total);
  calcVuelto();
}

function calcVuelto() {
  const totalTxt = document.getElementById('cs-total').textContent.replace('S/ ','');
  const total    = parseFloat(totalTxt) || 0;
  const recib    = parseFloat(document.getElementById('pos-recibido').value) || 0;
  const el       = document.getElementById('pos-vuelto');
  if (recib > 0) {
    const vuelto = recib - total;
    el.textContent = `Vuelto: ${fmt.money(Math.max(0, vuelto))}`;
    el.style.color = vuelto < 0 ? 'var(--danger)' : 'var(--success)';
  } else {
    el.textContent = '';
  }
}

//Actualiza label y validación del campo documento según comprobante
function actualizarCampoDoc() {
  const comp    = document.getElementById('pos-comp').value;
  const label   = document.getElementById('pos-doc-label');
  const req     = document.getElementById('pos-doc-req');
  const opc     = document.getElementById('pos-doc-opcional');
  const input   = document.getElementById('pos-dni');
  const cliente = document.getElementById('pos-cliente-name');

  //Reinicia estado del cliente, al cambiar el tipo de comprobante
  posClienteId = null;
  cliente.textContent = '';
  input.value = '';

  if (comp === 'Ticket') {
    label.childNodes[0].nodeValue = 'DNI / Documento ';
    input.placeholder = '00000000';
    input.maxLength   = 11;
    req.style.display = 'none';
    opc.style.display = '';
  } else if (comp === 'Boleta') {
    label.childNodes[0].nodeValue = 'DNI del cliente ';
    input.placeholder = '00000000';
    input.maxLength   = 8;
    req.style.display = '';
    opc.style.display = 'none';
  } else if (comp === 'Factura') {
    label.childNodes[0].nodeValue = 'RUC del cliente ';
    input.placeholder = '20xxxxxxxxx';
    input.maxLength   = 11;
    req.style.display = '';
    opc.style.display = 'none';
  }
}

async function buscarClientePOS() {
  const doc     = document.getElementById('pos-dni').value.trim();
  const el      = document.getElementById('pos-cliente-name');
  const formReg = document.getElementById('pos-form-registro');

  if (!doc) return;

  el.textContent = 'Buscando...';
  el.style.color = 'var(--gray-3)';
  if (formReg) formReg.style.display = 'none';
  posClienteId = null;

  //Busca segundo el tipo de documento según el formato ingresado (DNI o RUC)
  try {
    const resp = await fetch(`http://localhost:3000/api/clientes/doc/${doc}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('ns_token')}` }
    });
    const json = await resp.json();
    if (json.ok && json.data && json.data.id_cliente) {
      posClienteId = json.data.id_cliente;
      const nombre = [json.data.nombres, json.data.apellidos].filter(x => x && x !== '-').join(' ').trim();
      el.textContent = nombre;
      el.style.color = 'var(--success)';
      return;
    }
  } catch (_) {}

  //No encontrado, crear nuevo usuario para que aparezca su nombre al registrar la venta
  el.textContent = 'Cliente no encontrado — ingrese los datos manualmente:';
  el.style.color = 'var(--warning)';
  if (formReg) formReg.style.display = 'block';
}

async function registrarClienteRapido() {
  const doc      = document.getElementById('pos-dni').value.trim();
  const nombres  = document.getElementById('pos-reg-nombres').value.trim();
  const apellidos= document.getElementById('pos-reg-apellidos').value.trim();
  const el       = document.getElementById('pos-cliente-name');
  const formReg  = document.getElementById('pos-form-registro');

  if (!nombres) { toast('Ingrese al menos el nombre', 'warning'); return; }

  try {
    const resp = await fetch('http://localhost:3000/api/clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ns_token')}`
      },
      body: JSON.stringify({
        tipo_doc:  doc.length === 8 ? 'DNI' : 'RUC',
        num_doc:   doc,
        nombres:   nombres,
        apellidos: apellidos || '-'
      })
    });
    const json = await resp.json();
    if (json.id) {
      posClienteId = json.id;
      el.textContent = (nombres + ' ' + apellidos).trim();
      el.style.color = 'var(--success)';
      formReg.style.display = 'none';
      document.getElementById('pos-reg-nombres').value   = '';
      document.getElementById('pos-reg-apellidos').value = '';
      toast('Cliente registrado');
    }
  } catch (e) {
    toast('Error al registrar: ' + e.message, 'error');
  }
}

async function procesarVenta() {
  if (!carrito.length) { toast('Agrega productos al carrito', 'warning'); return; }

  const comp     = document.getElementById('pos-comp').value;
  const docVal   = document.getElementById('pos-dni').value.trim();

  //Validar campo documento según tipo de comprobante
  if (comp === 'Boleta') {
    if (!docVal || !/^\d{8}$/.test(docVal)) {
      toast('Para Boleta debes ingresar el DNI del cliente (8 dígitos)', 'warning');
      document.getElementById('pos-dni').focus();
      return;
    }
    if (!posClienteId) {
      toast('Primero busca al cliente con el botón de búsqueda', 'warning');
      return;
    }
  }
  if (comp === 'Factura') {
    if (!docVal || !/^(10|20)\d{9}$/.test(docVal)) {
      toast('Para Factura debes ingresar el RUC del cliente (11 dígitos, inicia con 10 o 20)', 'warning');
      document.getElementById('pos-dni').focus();
      return;
    }
    if (!posClienteId) {
      toast('Primero busca al cliente con el botón de búsqueda', 'warning');
      return;
    }
  }

  const totalTxt = document.getElementById('cs-total').textContent.replace('S/ ','');
  const total    = parseFloat(totalTxt) || 0;
  const recibido = parseFloat(document.getElementById('pos-recibido').value) || 0;
  const pago     = document.getElementById('pos-pago').value;

  if (pago === 'Efectivo' && recibido < total) {
    toast('El monto recibido es menor al total', 'warning'); return;
  }

  const body = {
    tipo_comprobante: document.getElementById('pos-comp').value,
    id_cliente:   posClienteId || null,
    tipo_pago:    pago,
    monto_pagado: recibido || total,
    descuento:    parseFloat(document.getElementById('cs-desc').value) || 0,
    items: carrito.map(i => ({
      id_producto:    i.id,
      cantidad:       i.cantidad,
      precio_unitario: i.precio,
      descuento:      0
    }))
  };

  try {
    const res = await api.post('/ventas', body);
    toast(`Venta registrada — ${res.serie}-${String(res.correlativo).padStart(8,'0')} | Total: ${fmt.money(res.total)} | Vuelto: ${fmt.money(res.vuelto)}`);
    limpiarCarrito();
    document.getElementById('pos-recibido').value = '';
    document.getElementById('cs-desc').value = '0';
    cargarAlertasBadge();
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

//Ventas e historial de ventas
async function cargarVentas() {
  try {
    let url = '/ventas?';
    const desde  = document.getElementById('v-desde')?.value;
    const hasta  = document.getElementById('v-hasta')?.value;
    const estado = document.getElementById('v-estado')?.value;
    if (desde)  url += `fecha_inicio=${desde}&`;
    if (hasta)  url += `fecha_fin=${hasta}&`;
    if (estado) url += `estado=${estado}&`;

    const { data } = await api.get(url);
    renderTable('ventas-tb', data, [
      r => `<span style="font-family:monospace;font-size:12px">${r.serie}-${String(r.correlativo).padStart(8,'0')}</span>`,
      r => fmt.dt(r.fecha_hora),
      r => r.cliente,
      r => r.cajero,
      r => `<strong>${fmt.money(r.total)}</strong>`,
      r => r.tipo_pago,
      r => `<span class="badge ${r.estado==='Completada'?'badge-success':r.estado==='Anulada'?'badge-danger':'badge-warning'}">${r.estado}</span>`,
      r => `
        <button class="btn btn-sm btn-outline btn-icon" title="Ver detalle" onclick="verDetalleVenta(${r.id_venta})">
          <i class="fa-solid fa-eye"></i>
        </button>
        ${r.estado === 'Completada'
          ? `<button class="btn btn-sm btn-danger btn-icon" title="Anular" onclick="anularVenta(${r.id_venta})">
               <i class="fa-solid fa-ban"></i>
             </button>`
          : ''}
      `
    ]);
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function verDetalleVenta(id) {
  try {
    const { data: v } = await api.get(`/ventas/${id}`);
    document.getElementById('modal-venta-body').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;background:var(--gray-1);padding:14px;border-radius:6px">
        <div><div style="font-size:11px;color:var(--gray-3);font-weight:600;text-transform:uppercase">Comprobante</div><div style="font-weight:700;font-family:monospace">${v.serie}-${String(v.correlativo).padStart(8,'0')}</div></div>
        <div><div style="font-size:11px;color:var(--gray-3);font-weight:600;text-transform:uppercase">Fecha</div><div>${fmt.dt(v.fecha_hora)}</div></div>
        <div><div style="font-size:11px;color:var(--gray-3);font-weight:600;text-transform:uppercase">Cliente</div><div>${v.cliente}</div></div>
        <div><div style="font-size:11px;color:var(--gray-3);font-weight:600;text-transform:uppercase">Cajero</div><div>${v.cajero}</div></div>
        <div><div style="font-size:11px;color:var(--gray-3);font-weight:600;text-transform:uppercase">Tipo pago</div><div>${v.tipo_pago}</div></div>
        <div><div style="font-size:11px;color:var(--gray-3);font-weight:600;text-transform:uppercase">Estado</div><div>${v.estado}</div></div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:var(--primary);color:#fff">
          <th style="padding:9px 12px;text-align:left;font-size:12px">Producto</th>
          <th style="padding:9px 12px;text-align:center;font-size:12px">Cant.</th>
          <th style="padding:9px 12px;text-align:right;font-size:12px">P. Unit.</th>
          <th style="padding:9px 12px;text-align:right;font-size:12px">Subtotal</th>
        </tr></thead>
        <tbody>
          ${v.detalle.map(d => `<tr>
            <td style="padding:9px 12px;border-bottom:1px solid var(--gray-2)">${d.producto}</td>
            <td style="padding:9px 12px;border-bottom:1px solid var(--gray-2);text-align:center">${d.cantidad} ${d.unidad_medida}</td>
            <td style="padding:9px 12px;border-bottom:1px solid var(--gray-2);text-align:right">${fmt.money(d.precio_unitario)}</td>
            <td style="padding:9px 12px;border-bottom:1px solid var(--gray-2);text-align:right;font-weight:700">${fmt.money(d.subtotal)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top:16px;text-align:right;padding:14px;background:var(--gray-1);border-radius:6px">
        <div style="font-size:13px;color:var(--gray-3);margin-bottom:4px">Subtotal: ${fmt.money(v.subtotal)}</div>
        <div style="font-size:13px;color:var(--gray-3);margin-bottom:8px">Descuento: ${fmt.money(v.descuento)}</div>
        <div style="font-size:20px;font-weight:700;color:var(--primary)">Total: ${fmt.money(v.total)}</div>
        <div style="font-size:12px;color:var(--gray-3);margin-top:4px">Pagado: ${fmt.money(v.monto_pagado)} &nbsp;|&nbsp; Vuelto: ${fmt.money(v.vuelto)}</div>
      </div>
    `;
    openModal('modal-venta-det');
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function anularVenta(id) {
  if (!confirmAction('¿Anular esta venta? Se restaurará el stock de los productos.')) return;
  try {
    await api.put(`/ventas/${id}/anular`);
    toast('Venta anulada y stock restaurado');
    cargarVentas();
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

//Clientes 
async function cargarClientes() {
  try {
    const search = document.getElementById('cli-search')?.value || '';
    const { data } = await api.get(`/clientes?search=${encodeURIComponent(search)}`);
    renderTable('cli-tb', data, [
      r => r.tipo_doc,
      r => r.num_doc,
      r => r.nombres,
      r => r.apellidos,
      r => r.telefono || '—',
      r => r.email    || '—'
    ]);
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function guardarCliente() {
  const body = {
    tipo_doc:  document.getElementById('mcli-tipo').value,
    num_doc:   document.getElementById('mcli-doc').value.trim(),
    nombres:   document.getElementById('mcli-nombres').value.trim(),
    apellidos: document.getElementById('mcli-apellidos').value.trim(),
    telefono:  document.getElementById('mcli-tel').value.trim(),
    email:     document.getElementById('mcli-email').value.trim(),
    direccion: document.getElementById('mcli-dir').value.trim()
  };
  if (!body.num_doc || !body.nombres || !body.apellidos) {
    toast('Complete los campos obligatorios', 'warning'); return;
  }
  try {
    await api.post('/clientes', body);
    toast('Cliente registrado');
    closeModal('modal-cliente');
    cargarClientes();
    ['mcli-doc','mcli-nombres','mcli-apellidos','mcli-tel','mcli-email','mcli-dir']
      .forEach(id => document.getElementById(id).value = '');
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

//Lotes por vencer
async function cargarLotes() {
  try {
    const { data } = await api.get('/lotes/por-vencer');
    renderTable('lotes-tb', data, [
      r => r.producto,
      r => r.numero_lote,
      r => fmt.date(r.fecha_vencimiento),
      r => {
        const d   = r.dias_para_vencer;
        const cls = d <= 30 ? 'badge-danger' : d <= 60 ? 'badge-warning' : 'badge-info';
        return `<span class="badge ${cls}">${d} días</span>`;
      },
      r => r.cantidad_actual,
      r => r.proveedor,
      r => {
        const d = r.dias_para_vencer;
        if (d <= 0)  return '<span class="badge badge-danger">Vencido</span>';
        if (d <= 30) return '<span class="badge badge-danger">Crítico</span>';
        if (d <= 60) return '<span class="badge badge-warning">Próximo</span>';
        return '<span class="badge badge-info">Vigente</span>';
      }
    ]);
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function guardarLote() {
  const body = {
    id_producto:       document.getElementById('mlote-prod').value,
    numero_lote:       document.getElementById('mlote-num').value.trim(),
    cantidad:          parseInt(document.getElementById('mlote-cant').value),
    fecha_fabricacion: document.getElementById('mlote-fab').value  || null,
    fecha_vencimiento: document.getElementById('mlote-venc').value,
    precio_compra:     parseFloat(document.getElementById('mlote-precio').value),
    id_proveedor:      document.getElementById('mlote-prov').value
  };
  if (!body.numero_lote || !body.cantidad || !body.fecha_vencimiento || !body.precio_compra) {
    toast('Complete todos los campos obligatorios', 'warning'); return;
  }
  try {
    await api.post('/lotes', body);
    toast('Lote ingresado y stock actualizado');
    closeModal('modal-lote');
    cargarLotes();
    ['mlote-num','mlote-cant','mlote-fab','mlote-venc','mlote-precio']
      .forEach(id => document.getElementById(id).value = '');
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

//Alertas de stock y vencimiento
const TIPO_BADGE = {
  'Stock Bajo':          'badge-warning',
  'Vencimiento Próximo': 'badge-warning',
  'Producto Vencido':    'badge-danger',
  'Stock Agotado':       'badge-danger'
};

async function cargarAlertas(estado = 'Pendiente') {
  try {
    const { data } = await api.get(`/alertas?estado=${estado}`);
    renderTable('alertas-tb', data, [
      r => `<span class="badge ${TIPO_BADGE[r.tipo] || 'badge-info'}">${r.tipo}</span>`,
      r => r.producto,
      r => `<span style="font-size:12px">${r.mensaje}</span>`,
      r => fmt.dt(r.fecha_generacion),
      r => estado === 'Pendiente'
        ? `<button class="btn btn-sm btn-success" onclick="atenderAlerta(${r.id_alerta})">
             <i class="fa-solid fa-check"></i> Atender
           </button>`
        : `<span class="badge badge-success">Atendida</span>`
    ]);
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function atenderAlerta(id) {
  try {
    await api.put(`/alertas/${id}/atender`);
    toast('Alerta marcada como atendida');
    cargarAlertas('Pendiente');
    cargarAlertasBadge();
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function generarAlertas() {
  try {
    await api.post('/alertas/generar');
    toast('Alertas generadas correctamente');
    cargarAlertas('Pendiente');
    cargarAlertasBadge();
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

//Reportes de ventas
async function cargarReporteVentas() {
  try {
    const desde = document.getElementById('rep-desde').value;
    const hasta = document.getElementById('rep-hasta').value;
    let url = '/reportes/ventas?';
    if (desde) url += `fecha_inicio=${desde}&`;
    if (hasta) url += `fecha_fin=${hasta}`;

    const { data } = await api.get(url);
    document.getElementById('rep-cards').style.display    = 'grid';
    document.getElementById('rep-total').textContent      = fmt.money(data.total_periodo);
    document.getElementById('rep-cantidad').textContent   = data.cantidad_periodo;

    renderTable('rep-tb', data.detalle, [
      r => fmt.date(r.fecha),
      r => r.cantidad,
      r => `<strong>${fmt.money(r.monto)}</strong>`,
      r => r.cajero
    ]);
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}


//Usuarios y permisos, esto solo es del administrador

const PERMISOS_DISPONIBLES = [
  { key: 'ventas:anular',       label: 'Anular ventas' },
  { key: 'lotes:crear',         label: 'Ingresar lotes de inventario' },
  { key: 'reportes:exportar',   label: 'Ver reportes de ventas' },
  { key: 'alertas:generar',     label: 'Generar alertas manualmente' },
];

async function cargarUsuarios() {
  try {
    const { data } = await api.get('/usuarios');
    renderTable('usuarios-tb', data, [
      r => `<strong>${r.nombres} ${r.apellidos}</strong>`,
      r => r.email,
      r => `<span class="badge ${r.rol === 'Administrador' ? 'badge-success' : 'badge-info'}">${r.rol === 'Cajero' ? 'Farmacéutico' : r.rol}</span>`,
      r => r.ultimo_acceso ? fmt.dt(r.ultimo_acceso) : '<span style="color:var(--gray-3)">Nunca</span>',
      r => r.activo
        ? '<span class="badge badge-success">Activo</span>'
        : '<span class="badge badge-danger">Inactivo</span>',
      r => {
        if (r.rol !== 'Cajero') return '<span style="color:var(--gray-3);font-size:11px">N/A</span>';
        let perms = [];
        try { perms = JSON.parse(r.permisos_extra || '[]'); } catch(_) {}
        if (!perms.length) return '<span style="color:var(--gray-3);font-size:11px">Solo base</span>';
        return perms.map(p => {
          const found = PERMISOS_DISPONIBLES.find(x => x.key === p);
          return `<span class="badge badge-info" style="margin:1px;font-size:10px">${found ? found.label : p}</span>`;
        }).join('');
      },
      r => `
        <button class="btn btn-sm btn-outline btn-icon" title="Editar" onclick="editarUsuario(${r.id_usuario})">
          <i class="fa-solid fa-pen"></i>
        </button>
        ${r.rol === 'Cajero' ? `
        <button class="btn btn-sm btn-warning btn-icon" title="Gestionar permisos" onclick="abrirPermisos(${r.id_usuario})">
          <i class="fa-solid fa-key"></i>
        </button>` : ''}
        <button class="btn btn-sm ${r.activo ? 'btn-danger' : 'btn-success'} btn-icon"
          title="${r.activo ? 'Desactivar' : 'Activar'}"
          onclick="toggleUsuario(${r.id_usuario}, ${r.activo})">
          <i class="fa-solid fa-${r.activo ? 'ban' : 'check'}"></i>
        </button>
      `
    ]);
  } catch (e) { toast('Error cargando usuarios: ' + e.message, 'error'); }
}

async function abrirModalProducto() {
  document.getElementById('mprod-id').value = '';
  document.getElementById('mprod-title').textContent = 'Nuevo Producto';
  ['mprod-nombre','mprod-generico','mprod-principio','mprod-codigo','mprod-concentracion',
   'mprod-pcompra','mprod-pventa','mprod-stock','mprod-smin','mprod-smax'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('mprod-receta').checked = false;
  await cargarSelectores();
  openModal('modal-producto');
}

async function editarUsuario(id) {
  try {
    const { data: usuarios } = await api.get('/usuarios');
    const u = usuarios.find(x => x.id_usuario === id);
    if (!u) return;
    document.getElementById('musu-id').value        = u.id_usuario;
    document.getElementById('musu-title').textContent = 'Editar Usuario';
    document.getElementById('musu-nombres').value   = u.nombres;
    document.getElementById('musu-apellidos').value = u.apellidos;
    document.getElementById('musu-email').value     = u.email;
    document.getElementById('musu-rol').value       = u.rol === 'Administrador' ? '1' : '2';
    document.getElementById('musu-pass-group').style.display = 'none';
    openModal('modal-usuario');
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function guardarUsuario() {
  const id = document.getElementById('musu-id').value;
  const body = {
    nombres:   document.getElementById('musu-nombres').value.trim(),
    apellidos: document.getElementById('musu-apellidos').value.trim(),
    email:     document.getElementById('musu-email').value.trim(),
    id_rol: parseInt(document.getElementById('musu-rol').value),
    activo:    1,
  };
  if (!id) body.password = document.getElementById('musu-pass').value;

  if (!body.nombres || !body.email) {
    toast('Nombre y email son obligatorios', 'warning'); return;
  }
  if (!id && (!body.password || body.password.length < 6)) {
    toast('La contraseña debe tener al menos 6 caracteres', 'warning'); return;
  }
  try {
    if (id) await api.put(`/usuarios/${id}`, body);
    else    await api.post('/usuarios', body);
    toast('Usuario guardado correctamente');
    closeModal('modal-usuario');
    cargarUsuarios();
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}
async function abrirPermisos(id) {
  try {
    const { data: usuarios } = await api.get('/usuarios');
    const u = usuarios.find(x => x.id_usuario === id);
    if (!u) return;

    document.getElementById('mperm-id').value = id;
    let permActuales = [];
    try { permActuales = JSON.parse(u.permisos_extra || '[]'); } catch(_) {}

    document.getElementById('mperm-lista').innerHTML = PERMISOS_DISPONIBLES.map(p => `
      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px;border-radius:6px;border:1px solid var(--gray-2)">
        <input type="checkbox" value="${p.key}" ${permActuales.includes(p.key) ? 'checked' : ''}
          style="width:auto;margin:0">
        <span style="font-size:13px">${p.label}</span>
      </label>
    `).join('');

    openModal('modal-permisos');
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function guardarPermisos() {
  const id = document.getElementById('mperm-id').value;
  const checks = document.querySelectorAll('#mperm-lista input[type=checkbox]:checked');
  const permisos = Array.from(checks).map(c => c.value);
  try {
    await api.put(`/usuarios/${id}/permisos`, { permisos });
    toast('Permisos actualizados');
    closeModal('modal-permisos');
    cargarUsuarios();
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function toggleUsuario(id, activo) {
  const accion = activo ? 'desactivar' : 'activar';
  if (!confirmAction(`¿Deseas ${accion} este usuario?`)) return;
  try {
    await api.put(`/usuarios/${id}/activar-desactivar`);
    toast(`Usuario ${activo ? 'desactivado' : 'activado'}`);
    cargarUsuarios();
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}