// ==========================================
// FICHA DE MARCA, CATÁLOGO CON VARIANTES Y PEDIDOS DE PRUEBA - OMNIX
// ==========================================

export const INFO_MARCA = {
  nombre: 'OMNIX',
  eslogan: 'Tecnología del futuro en tus manos',
  colorPrimario: '#9366F1',
  colorSecundario: '#171525',
  publicoObjetivo: 'Entusiastas de la tecnología, gamers y profesionales digitales',
  categorias: ['Neural Net', 'Quantum Core', 'Cybernetics', 'Accesorios'],
  marcas: ['OMNIX Labs', 'Kinetix Core', 'AetherTech'],
};

export const MODALIDADES_ENVIO = ['Estándar', 'Exprés'];

export const TARIFAS_ENVIO_MUNICIPIO = {
  mosquera: {
    municipio: 'Mosquera',
    Estándar: { costo: 6000, plazo: '1 a 2 días' },
    Exprés: { costo: 10000, plazo: '1 a 2 días' },
  },
  funza: {
    municipio: 'Funza',
    Estándar: { costo: 8000, plazo: '1 a 2 días' },
    Exprés: { costo: 12000, plazo: '1 a 2 días' },
  },
  madrid: {
    municipio: 'Madrid',
    Estándar: { costo: 10000, plazo: '1 a 2 días' },
    Exprés: { costo: 14000, plazo: '1 a 2 días' },
  },
};

export const normalizarMunicipioEnvio = (municipioTexto) => {
  if (!municipioTexto || typeof municipioTexto !== 'string') return '';
  const limpio = municipioTexto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return limpio;
};

export const calcularEstimacionEnvio = (municipioTexto, modalidad) => {
  const claveMunicipio = normalizarMunicipioEnvio(municipioTexto);
  const tarifaMunicipio = TARIFAS_ENVIO_MUNICIPIO[claveMunicipio] || null;
  const modalidadValida = MODALIDADES_ENVIO.includes(modalidad) ? modalidad : null;

  if (!tarifaMunicipio || !modalidadValida) {
    return {
      valido: false,
      soportado: false,
      municipioNormalizado: tarifaMunicipio ? tarifaMunicipio.municipio : municipioTexto.trim(),
      modalidad: modalidadValida,
      costo: 0,
      plazo: '',
      motivo: !claveMunicipio
        ? 'Selecciona o ingresa un municipio de entrega.'
        : !tarifaMunicipio
          ? 'Municipio fuera de tarifa automática: requiere ajuste manual o no tiene envío disponible.'
          : 'Selecciona la modalidad de envío (Estándar o Exprés).',
    };
  }

  const detalleModalidad = tarifaMunicipio[modalidadValida];
  return {
    valido: true,
    soportado: true,
    municipioNormalizado: tarifaMunicipio.municipio,
    modalidad: modalidadValida,
    costo: detalleModalidad.costo,
    plazo: detalleModalidad.plazo,
    motivo: '',
  };
};

export const obtenerStockTotalProducto = (producto) => {
  if (!producto || !Array.isArray(producto.variantes)) return 0;
  return producto.variantes.reduce((acumulado, variante) => acumulado + (Number(variante.stock) || 0), 0);
};

export const obtenerPrecioVisibleProducto = (producto) => {
  if (!producto || !Array.isArray(producto.variantes) || producto.variantes.length === 0) {
    return Number(producto?.precioBase) || 0;
  }
  return Math.min(...producto.variantes.map(variante => Number(variante.precioFinal) || 0));
};

export const PRODUCTOS_INICIALES = [
  {
    id: 1,
    nombre: 'Neural Interface V1',
    categoria: 'Neural Net',
    marca: 'OMNIX Labs',
    precioBase: 299990,
    descripcion: 'Interfaz neuronal de alta velocidad con sincronización directa sin latencia.',
    imagen: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v1-s', etiqueta: 'Talla S / Edición Estándar', precioFinal: 299990, stock: 4 },
      { id: 'v1-m', etiqueta: 'Talla M / Edición Pro', precioFinal: 329990, stock: 4 },
      { id: 'v1-l', etiqueta: 'Talla L / Edición Agotada', precioFinal: 349990, stock: 0 },
    ],
  },
  {
    id: 2,
    nombre: 'Quantum Core X',
    categoria: 'Quantum Core',
    marca: 'Kinetix Core',
    precioBase: 599990,
    descripcion: 'Núcleo de procesamiento cuántico portátil para computación en el borde.',
    imagen: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v2-blk', etiqueta: 'Color Negro Obsidiana', precioFinal: 599990, stock: 3 },
      { id: 'v2-vio', etiqueta: 'Color Violeta Neón', precioFinal: 629990, stock: 2 },
    ],
  },
  {
    id: 3,
    nombre: 'Cyber Visor Pro',
    categoria: 'Cybernetics',
    marca: 'AetherTech',
    precioBase: 349990,
    descripcion: 'Gafas de realidad aumentada con display holográfico de alta definición.',
    imagen: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v3-std', etiqueta: 'Talla Estándar / Visor 120Hz', precioFinal: 349990, stock: 5 },
      { id: 'v3-xl', etiqueta: 'Talla XL / Visor 240Hz', precioFinal: 389990, stock: 3 },
    ],
  },
  {
    id: 4,
    nombre: 'Omni Band Wireless',
    categoria: 'Accesorios',
    marca: 'OMNIX Labs',
    precioBase: 129990,
    descripcion: 'Banda biométrica avanzada con monitoreo continuo de actividad sináptica.',
    imagen: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v4-unica', etiqueta: 'Presentación Única', precioFinal: 129990, stock: 15 },
    ],
  },
  {
    id: 5,
    nombre: 'Neural Synth Link',
    categoria: 'Neural Net',
    marca: 'AetherTech',
    precioBase: 420000,
    descripcion: 'Conector sináptico externo para cascos de inmersión total.',
    imagen: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v5-unica', etiqueta: 'Presentación Única', precioFinal: 420000, stock: 6 },
    ],
  },
  {
    id: 6,
    nombre: 'Quantum Chip 9G',
    categoria: 'Quantum Core',
    marca: 'Kinetix Core',
    precioBase: 780000,
    descripcion: 'Procesador cuántico de pulso electromagnético optimizado.',
    imagen: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v6-unica', etiqueta: 'Presentación Única', precioFinal: 780000, stock: 3 },
    ],
  },
  {
    id: 7,
    nombre: 'Cyber Glove Haptic',
    categoria: 'Cybernetics',
    marca: 'AetherTech',
    precioBase: 210000,
    descripcion: 'Guante háptico con retroalimentación de presión subatómica.',
    imagen: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v7-unica', etiqueta: 'Presentación Única', precioFinal: 210000, stock: 12 },
    ],
  },
  {
    id: 8,
    nombre: 'Omni Power Cell',
    categoria: 'Accesorios',
    marca: 'OMNIX Labs',
    precioBase: 95000,
    descripcion: 'Batería de plasma portátil de carga ultrarrápida por inducción.',
    imagen: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v8-unica', etiqueta: 'Presentación Única', precioFinal: 95000, stock: 20 },
    ],
  },
  {
    id: 9,
    nombre: 'Neural Optic Lens',
    categoria: 'Neural Net',
    marca: 'OMNIX Labs',
    precioBase: 310000,
    descripcion: 'Lente de contacto inteligente con interfaz de visualización directa.',
    imagen: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v9-unica', etiqueta: 'Presentación Única', precioFinal: 310000, stock: 7 },
    ],
  },
  {
    id: 10,
    nombre: 'Quantum Drive 5TB',
    categoria: 'Quantum Core',
    marca: 'Kinetix Core',
    precioBase: 450000,
    descripcion: 'Unidad de estado sólido cuántica con cifrado de fotones entrelazados.',
    imagen: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v10-unica', etiqueta: 'Presentación Única', precioFinal: 450000, stock: 9 },
    ],
  },
  {
    id: 11,
    nombre: 'Cyber Cloak Mask',
    categoria: 'Cybernetics',
    marca: 'AetherTech',
    precioBase: 520000,
    descripcion: 'Máscara de camuflaje térmico y supresión de ondas electromagnéticas.',
    imagen: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v11-unica', etiqueta: 'Presentación Única', precioFinal: 520000, stock: 4 },
    ],
  },
  {
    id: 12,
    nombre: 'Omni Neural Cable',
    categoria: 'Accesorios',
    marca: 'OMNIX Labs',
    precioBase: 45000,
    descripcion: 'Cable de transferencia de datos sinápticos con conectores de titanio.',
    imagen: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=80',
    variantes: [
      { id: 'v12-unica', etiqueta: 'Presentación Única', precioFinal: 45000, stock: 25 },
    ],
  },
];

export const PEDIDOS_INICIALES = [
  {
    codigo: 'OMNX-100201',
    fecha: '2026-11-20 10:15',
    estado: 'Confirmado',
    stockRestaurado: false,
    articulos: [
      {
        idProducto: 4,
        idVariante: 'v4-unica',
        etiquetaVariante: 'Presentación Única',
        nombre: 'Omni Band Wireless',
        precioUnitario: 129990,
        cantidad: 1,
      },
    ],
    subtotal: 129990,
    descuento: 0,
    costoEnvio: 6000,
    tiempoEstimadoEnvio: '1 a 2 días',
    modalidadEnvio: 'Estándar',
    total: 135990,
    direccion: {
      alias: 'Casa Mosquera',
      municipio: 'Mosquera',
      descripcion: 'Cra 5 # 12-30 (Dato ficticio de prueba)',
    },
    historialEstados: [
      { estado: 'Confirmado', fecha: '2026-11-20 10:15' },
    ],
  },
  {
    codigo: 'OMNX-100202',
    fecha: '2026-11-21 15:40',
    estado: 'Preparando',
    stockRestaurado: false,
    articulos: [
      {
        idProducto: 8,
        idVariante: 'v8-unica',
        etiquetaVariante: 'Presentación Única',
        nombre: 'Omni Power Cell',
        precioUnitario: 95000,
        cantidad: 1,
      },
    ],
    subtotal: 95000,
    descuento: 0,
    costoEnvio: 8000,
    tiempoEstimadoEnvio: '1 a 2 días',
    modalidadEnvio: 'Estándar',
    total: 103000,
    direccion: {
      alias: 'Oficina Funza',
      municipio: 'Funza',
      descripcion: 'Cl 10 # 4-18 (Dato ficticio de prueba)',
    },
    historialEstados: [
      { estado: 'Confirmado', fecha: '2026-11-21 15:40' },
      { estado: 'Preparando', fecha: '2026-11-21 16:05' },
    ],
  },
];  