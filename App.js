import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image, TextInput, SafeAreaView, StatusBar, Platform } from 'react-native';
import {
  INFO_MARCA,
  PRODUCTOS_INICIALES,
  PEDIDOS_INICIALES,
  obtenerStockTotalProducto,
  obtenerPrecioVisibleProducto
} from './data/products';

const UMBRAL_STOCK_BAJO = 3;

const PREGUNTAS_INICIALES = [
  {
    id: 'q-101',
    idProducto: 1,
    pregunta: '¿Qué diferencia hay entre la Edición Estándar y la Edición Pro?',
    respuestaSimulada: '[Respuesta automática de demostración] La Edición Pro incluye calibración sináptica ampliada y mayor ancho de banda de sincronización.',
    estado: 'Respondido',
    fecha: '2026-11-20 09:30'
  },
  {
    id: 'q-102',
    idProducto: 2,
    pregunta: '¿Incluye cable de alimentación cuántica en la caja?',
    respuestaSimulada: '',
    estado: 'Pendiente',
    fecha: '2026-11-22 14:15'
  }
];

const PASOS_FLUJO_PEDIDO = ['Confirmado', 'En preparación', 'Enviado', 'Entregado'];

export default function App() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [pantallaActual, setPantallaActual] = useState('home');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [idVarianteSeleccionada, setIdVarianteSeleccionada] = useState(null);
  const [codigoPedidoSeleccionado, setCodigoPedidoSeleccionado] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [historial, setHistorial] = useState(PEDIDOS_INICIALES);

  const [perfilComprador, setPerfilComprador] = useState(null);
  const [nombrePerfil, setNombrePerfil] = useState('');
  const [telefonoPerfil, setTelefonoPerfil] = useState('');
  const [ciudadPerfil, setCiudadPerfil] = useState('');
  const [direccionPerfil, setDireccionPerfil] = useState('');
  const [categoriaFavoritaPerfil, setCategoriaFavoritaPerfil] = useState('Neural Net');

  const [idsComparacion, setIdsComparacion] = useState([]);

  const [preguntas, setPreguntas] = useState(PREGUNTAS_INICIALES);
  const [entradaPregunta, setEntradaPregunta] = useState('');

  const [consultaBusqueda, setConsultaBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('all');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('all');
  const [entradaPrecioMinimo, setEntradaPrecioMinimo] = useState('');
  const [entradaPrecioMaximo, setEntradaPrecioMaximo] = useState('');
  const [precioMinimoAplicado, setPrecioMinimoAplicado] = useState(null);
  const [precioMaximoAplicado, setPrecioMaximoAplicado] = useState(null);
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [errorFiltro, setErrorFiltro] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('default');

  const [cantidadDetalle, setCantidadDetalle] = useState(1);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [descuentoActivo, setDescuentoActivo] = useState(false);

  const [entradaResena, setEntradaResena] = useState('');

  const [idProductoEdicion, setIdProductoEdicion] = useState(null);
  const [nombreFormulario, setNombreFormulario] = useState('');
  const [categoriaFormulario, setCategoriaFormulario] = useState('Neural Net');
  const [precioFormulario, setPrecioFormulario] = useState('');
  const [stockFormulario, setStockFormulario] = useState('');
  const [descripcionFormulario, setDescripcionFormulario] = useState('');
  const [imagenFormulario, setImagenFormulario] = useState('');

  const [nombreComprador, setNombreComprador] = useState('');
  const [telefonoComprador, setTelefonoComprador] = useState('');
  const [ciudadComprador, setCiudadComprador] = useState('');
  const [direccionComprador, setDireccionComprador] = useState('');
  const [ultimoCodigoPedido, setUltimoCodigoPedido] = useState('');

  const totalArticulosCarrito = carrito.reduce((acumulado, articulo) => acumulado + articulo.cantidad, 0);

  const navegarA = (pantalla) => {
    setPantallaActual(pantalla);
  };

  const obtenerInfoInsigniaStock = (cantidadStock) => {
    if (cantidadStock <= 0) {
      return { etiqueta: 'Agotado', tipo: 'out' };
    }
    if (cantidadStock <= UMBRAL_STOCK_BAJO) {
      return { etiqueta: `⚠️ Stock bajo (quedan ${cantidadStock})`, tipo: 'low' };
    }
    return { etiqueta: `Stock disponible (${cantidadStock})`, tipo: 'ok' };
  };

  const gestionarGuardarPerfil = () => {
    if (!nombrePerfil.trim() || !telefonoPerfil.trim() || !ciudadPerfil.trim() || !direccionPerfil.trim()) {
      alert('Validación (HU29 - CA02): Completa nombre, teléfono, municipio y dirección para guardar tu perfil.');
      return;
    }

    const perfilGuardado = {
      nombre: nombrePerfil.trim(),
      telefono: telefonoPerfil.trim(),
      ciudad: ciudadPerfil.trim(),
      direccion: direccionPerfil.trim(),
      categoriaFavorita: categoriaFavoritaPerfil
    };

    setPerfilComprador(perfilGuardado);
    alert('¡Perfil de comprador y preferencias guardados con éxito!');
  };

  const gestionarAutocompletarDesdePerfil = () => {
    if (!perfilComprador) {
      alert('Aún no tienes un perfil guardado (CA04). Ve a "Perfil" para registrar tus datos de entrega y categoría favorita.');
      return;
    }
    setNombreComprador(perfilComprador.nombre);
    setTelefonoComprador(perfilComprador.telefono);
    setCiudadComprador(perfilComprador.ciudad);
    setDireccionComprador(perfilComprador.direccion);
    alert('Datos de entrega autocompletados desde tu perfil guardado.');
  };

  const gestionarAplicarCategoriaFavorita = () => {
    if (!perfilComprador || !perfilComprador.categoriaFavorita) {
      alert('No tienes una categoría favorita guardada todavía.');
      return;
    }
    setCategoriaSeleccionada(perfilComprador.categoriaFavorita);
    navegarA('catalog');
  };

  const abrirDetalleProducto = (producto) => {
    const productoActual = productos.find(item => item.id === producto.id) || producto;
    setProductoSeleccionado(productoActual);
    const variantes = Array.isArray(productoActual.variantes) ? productoActual.variantes : [];
    setIdVarianteSeleccionada(variantes.length === 1 ? variantes[0].id : null);
    setCantidadDetalle(1);
    setEntradaResena('');
    setEntradaPregunta('');
    navegarA('detail');
  };

  const abrirDetallePedido = (codigoPedido) => {
    setCodigoPedidoSeleccionado(codigoPedido);
    navegarA('orderDetail');
  };

  const gestionarAvanzarEstadoPedido = (codigoPedido) => {
    const pedidoObjetivo = historial.find(pedido => pedido.codigo === codigoPedido);
    if (!pedidoObjetivo) return;

    if (pedidoObjetivo.estado === 'Entregado' || pedidoObjetivo.estado === 'Cancelado') {
      alert(`No es posible avanzar el estado porque el pedido ya está "${pedidoObjetivo.estado}".`);
      return;
    }

    const indiceActual = PASOS_FLUJO_PEDIDO.indexOf(pedidoObjetivo.estado);
    if (indiceActual === -1 || indiceActual >= PASOS_FLUJO_PEDIDO.length - 1) return;

    const siguienteEstado = PASOS_FLUJO_PEDIDO[indiceActual + 1];
    const fechaActual = new Date().toLocaleString();

    setHistorial(anterior =>
      anterior.map(pedido =>
        pedido.codigo === codigoPedido
          ? {
              ...pedido,
              estado: siguienteEstado,
              historialEstados: [
                ...(Array.isArray(pedido.historialEstados) ? pedido.historialEstados : []),
                { estado: siguienteEstado, fecha: fechaActual }
              ]
            }
          : pedido
      )
    );
  };

  const gestionarCancelarPedido = (codigoPedido) => {
    const pedidoObjetivo = historial.find(pedido => pedido.codigo === codigoPedido);
    if (!pedidoObjetivo) return;

    if (pedidoObjetivo.estado !== 'Confirmado' && pedidoObjetivo.estado !== 'En preparación') {
      alert(`No es posible cancelar este pedido en estado "${pedidoObjetivo.estado}" (CA03/CA04).`);
      return;
    }

    if (pedidoObjetivo.stockRestaurado) {
      alert('Este pedido ya fue cancelado y su stock ya fue reintegrado previamente.');
      return;
    }

    const fechaActual = new Date().toLocaleString();

    setProductos(productosAnteriores =>
      productosAnteriores.map(producto => {
        const articulosPedidoProducto = pedidoObjetivo.articulos.filter(articulo => articulo.idProducto === producto.id);
        if (articulosPedidoProducto.length === 0 || !Array.isArray(producto.variantes)) return producto;

        const variantesActualizadas = producto.variantes.map(variante => {
          const articuloCoincidente = articulosPedidoProducto.find(articulo => articulo.idVariante === variante.id);
          if (!articuloCoincidente) return variante;
          return { ...variante, stock: variante.stock + articuloCoincidente.cantidad };
        });

        return { ...producto, variantes: variantesActualizadas };
      })
    );

    setHistorial(historialAnterior =>
      historialAnterior.map(pedido =>
        pedido.codigo === codigoPedido
          ? {
              ...pedido,
              estado: 'Cancelado',
              stockRestaurado: true,
              historialEstados: [
                ...(Array.isArray(pedido.historialEstados) ? pedido.historialEstados : []),
                { estado: 'Cancelado', fecha: fechaActual }
              ]
            }
          : pedido
      )
    );

    alert(`Pedido ${codigoPedido} cancelado con éxito. Las unidades fueron reintegradas al inventario.`);
  };

  const gestionarRecompra = (pedido) => {
    if (!pedido || !Array.isArray(pedido.articulos) || pedido.articulos.length === 0) return;

    let cantidadAgregada = 0;
    const avisos = [];
    let siguienteCarrito = [...carrito];

    pedido.articulos.forEach(articulo => {
      const producto = productos.find(item => item.id === articulo.idProducto);
      if (!producto) {
        avisos.push(`• ${articulo.nombre}: ya no existe en el catálogo.`);
        return;
      }

      const variantes = Array.isArray(producto.variantes) ? producto.variantes : [];
      const variante = variantes.find(item => item.id === articulo.idVariante) || (variantes.length === 1 ? variantes[0] : null);

      if (!variante || variante.stock <= 0) {
        avisos.push(`• ${articulo.nombre} (${articulo.etiquetaVariante || 'Única'}): agotado (0 unidades disponibles).`);
        return;
      }

      const claveCarrito = `${producto.id}__${variante.id}`;
      const articuloExistente = siguienteCarrito.find(itemCarrito => itemCarrito.claveCarrito === claveCarrito);
      const yaEnCarrito = articuloExistente ? articuloExistente.cantidad : 0;
      const disponibleParaAgregar = Math.max(0, variante.stock - yaEnCarrito);

      if (disponibleParaAgregar <= 0) {
        avisos.push(`• ${articulo.nombre} (${variante.etiqueta}): ya tienes el máximo stock (${variante.stock}) en el carrito.`);
        return;
      }

      const cantidadParaAgregar = Math.min(articulo.cantidad, disponibleParaAgregar);
      if (cantidadParaAgregar < articulo.cantidad) {
        avisos.push(`• ${articulo.nombre} (${variante.etiqueta}): agregado parcialmente (${cantidadParaAgregar} de ${articulo.cantidad} solicitadas por stock disponible).`);
      }

      if (articuloExistente) {
        siguienteCarrito = siguienteCarrito.map(itemCarrito =>
          itemCarrito.claveCarrito === claveCarrito
            ? { ...itemCarrito, cantidad: itemCarrito.cantidad + cantidadParaAgregar, precio: variante.precioFinal }
            : itemCarrito
        );
      } else {
        siguienteCarrito.push({
          claveCarrito,
          id: producto.id,
          idProducto: producto.id,
          idVariante: variante.id,
          etiquetaVariante: variante.etiqueta,
          nombre: producto.nombre,
          imagen: producto.imagen,
          precio: variante.precioFinal,
          cantidad: cantidadParaAgregar
        });
      }

      cantidadAgregada += cantidadParaAgregar;
    });

    setCarrito(siguienteCarrito);

    if (cantidadAgregada === 0) {
      alert(`No se pudieron agregar artículos al carrito:\n${avisos.join('\n')}`);
      return;
    }

    if (avisos.length > 0) {
      alert(`Recompra parcial realizada:\n${avisos.join('\n')}`);
    } else {
      alert('¡Todos los artículos del pedido anterior se agregaron al carrito!');
    }

    navegarA('cart');
  };

  const alternarFavorito = (producto) => {
    setFavoritos(anterior => {
      const existe = anterior.find(item => item.id === producto.id);
      if (existe) {
        return anterior.filter(item => item.id !== producto.id);
      } else {
        return [...anterior, producto];
      }
    });
  };

  const alternarComparacion = (producto) => {
    setIdsComparacion(anterior => {
      if (anterior.includes(producto.id)) {
        return anterior.filter(id => id !== producto.id);
      }
      if (anterior.length >= 3) {
        alert('Límite alcanzado (HU22 - CA03): Solo puedes comparar hasta 3 productos simultáneamente.');
        return anterior;
      }
      return [...anterior, producto.id];
    });
  };

  const gestionarAplicarRangoPrecio = () => {
    const textoMin = entradaPrecioMinimo.trim();
    const textoMax = entradaPrecioMaximo.trim();
    const valorMin = textoMin === '' ? null : Number(textoMin);
    const valorMax = textoMax === '' ? null : Number(textoMax);

    if ((valorMin !== null && isNaN(valorMin)) || (valorMax !== null && isNaN(valorMax))) {
      const mensaje = 'Error: Ingresa valores numéricos válidos para el rango de precios.';
      setErrorFiltro(mensaje);
      alert(mensaje);
      return;
    }

    if ((valorMin !== null && valorMin < 0) || (valorMax !== null && valorMax < 0)) {
      const mensaje = 'Error: Los precios del filtro no pueden ser negativos.';
      setErrorFiltro(mensaje);
      alert(mensaje);
      return;
    }

    if (valorMin !== null && valorMax !== null && valorMin > valorMax) {
      const mensaje = 'Rango inválido (CA02): El precio mínimo no puede ser mayor que el precio máximo.';
      setErrorFiltro(mensaje);
      alert(mensaje);
      return;
    }

    setErrorFiltro('');
    setPrecioMinimoAplicado(valorMin);
    setPrecioMaximoAplicado(valorMax);
  };

  const gestionarRestablecerFiltros = () => {
    setConsultaBusqueda('');
    setCategoriaSeleccionada('all');
    setMarcaSeleccionada('all');
    setEntradaPrecioMinimo('');
    setEntradaPrecioMaximo('');
    setPrecioMinimoAplicado(null);
    setPrecioMaximoAplicado(null);
    setSoloDisponibles(false);
    setErrorFiltro('');
    setOrdenarPor('default');
  };

  const gestionarAgregarPregunta = (idProducto) => {
    const textoLimpio = entradaPregunta.trim();
    if (textoLimpio.length < 10) {
      alert('Validación (HU24): La pregunta debe tener al menos 10 caracteres.');
      return;
    }

    const nuevaPregunta = {
      id: 'q-' + Date.now(),
      idProducto,
      pregunta: textoLimpio,
      respuestaSimulada: '',
      estado: 'Pendiente',
      fecha: new Date().toLocaleString()
    };

    setPreguntas(anterior => [nuevaPregunta, ...anterior]);
    setEntradaPregunta('');
    alert('Pregunta enviada con estado Pendiente.');
  };

  const gestionarSimularRespuestaPregunta = (idPregunta, nombreProducto) => {
    setPreguntas(anterior =>
      anterior.map(item =>
        item.id === idPregunta
          ? {
              ...item,
              estado: 'Respondido',
              respuestaSimulada: `[Respuesta simulada de demostración] Gracias por consultar sobre ${nombreProducto}. Este artículo cuenta con garantía académica OMNIX y compatibilidad verificada según las especificaciones técnicas publicadas.`
            }
          : item
      )
    );
  };

  const gestionarAgregarResena = (idProducto) => {
    const calificacionNum = parseInt(entradaResena, 10);
    if (isNaN(calificacionNum) || calificacionNum < 1 || calificacionNum > 5) {
      alert('Error (CA02): La valoración debe ser un número entero entre 1 y 5.');
      return;
    }

    setProductos(productosAnteriores => {
      return productosAnteriores.map(producto => {
        if (producto.id === idProducto) {
          const resenasActuales = Array.isArray(producto.resenas) ? producto.resenas : [];
          const resenasActualizadas = [...resenasActuales, calificacionNum];
          const productoActualizado = { ...producto, resenas: resenasActualizadas };
          if (productoSeleccionado && productoSeleccionado.id === idProducto) {
            setProductoSeleccionado(productoActualizado);
          }
          return productoActualizado;
        }
        return producto;
      });
    });

    setEntradaResena('');
    alert('¡Valoración registrada con éxito (CA01)!');
  };

  const iniciarCreacionProducto = () => {
    setIdProductoEdicion(null);
    setNombreFormulario('');
    setCategoriaFormulario('Neural Net');
    setPrecioFormulario('');
    setStockFormulario('');
    setDescripcionFormulario('');
    setImagenFormulario('https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80');
    navegarA('admin');
  };

  const iniciarEdicionProducto = (producto) => {
    setIdProductoEdicion(producto.id);
    setNombreFormulario(producto.nombre);
    setCategoriaFormulario(producto.categoria);
    setPrecioFormulario(obtenerPrecioVisibleProducto(producto).toString());
    setStockFormulario(obtenerStockTotalProducto(producto).toString());
    setDescripcionFormulario(producto.descripcion);
    setImagenFormulario(producto.imagen);
    navegarA('admin');
  };

  const gestionarGuardarProducto = () => {
    const precioNum = parseFloat(precioFormulario);
    const stockNum = parseInt(stockFormulario, 10);

    if (isNaN(precioNum) || precioNum <= 0) {
      alert('Error (CA03): El precio del producto debe ser un número positivo mayor a 0.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Error (CA03): El stock del producto no puede ser un número negativo.');
      return;
    }
    if (!nombreFormulario.trim() || !descripcionFormulario.trim() || !imagenFormulario.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (idProductoEdicion === null) {
      const nuevoProducto = {
        id: Date.now(),
        nombre: nombreFormulario.trim(),
        categoria: categoriaFormulario,
        marca: INFO_MARCA.marcas ? INFO_MARCA.marcas[0] : 'OMNIX Labs',
        precioBase: precioNum,
        descripcion: descripcionFormulario.trim(),
        imagen: imagenFormulario.trim(),
        variantes: [
          { id: `v-${Date.now()}`, etiqueta: 'Presentación Única', precioFinal: precioNum, stock: stockNum }
        ],
        resenas: []
      };
      setProductos(anterior => [nuevoProducto, ...anterior]);
      alert('¡Producto creado y agregado al catálogo con éxito (CA01)!');
    } else {
      setProductos(anterior => anterior.map(producto => {
        if (producto.id === idProductoEdicion) {
          const variantesBase = Array.isArray(producto.variantes) && producto.variantes.length > 0
            ? producto.variantes
            : [{ id: `v-${producto.id}`, etiqueta: 'Presentación Única', precioFinal: precioNum, stock: stockNum }];
          const variantesActualizadas = variantesBase.map((variante, indice) =>
            indice === 0 ? { ...variante, precioFinal: precioNum, stock: stockNum } : variante
          );
          return {
            ...producto,
            nombre: nombreFormulario.trim(),
            categoria: categoriaFormulario,
            precioBase: precioNum,
            descripcion: descripcionFormulario.trim(),
            imagen: imagenFormulario.trim(),
            variantes: variantesActualizadas
          };
        }
        return producto;
      }));
      alert('¡Información del producto actualizada correctamente (CA02)!');
    }

    navegarA('catalog');
  };

  const agregarAlCarrito = (producto, cantidad = 1, idVariante = null, desdeDetalle = false) => {
    const productoActualEnCatalogo = productos.find(item => item.id === producto.id);
    if (!productoActualEnCatalogo) return;

    const variantes = Array.isArray(productoActualEnCatalogo.variantes) ? productoActualEnCatalogo.variantes : [];

    if (!idVariante && variantes.length > 1 && !desdeDetalle) {
      alert('Este producto tiene varias opciones. Elige una variante en el detalle antes de agregarlo al carrito.');
      abrirDetalleProducto(productoActualEnCatalogo);
      return;
    }

    if (!idVariante && variantes.length > 1 && desdeDetalle) {
      alert('Por favor selecciona una variante (talla, color o presentación) antes de agregar al carrito.');
      return;
    }

    const varianteElegida = variantes.find(item => item.id === idVariante) || (variantes.length === 1 ? variantes[0] : null);
    if (!varianteElegida) {
      alert('Por favor selecciona una variante válida.');
      return;
    }

    if (varianteElegida.stock <= 0) {
      alert(`La variante "${varianteElegida.etiqueta}" está agotada y no puede comprarse.`);
      return;
    }

    const claveCarrito = `${productoActualEnCatalogo.id}__${varianteElegida.id}`;
    const existenteEnCarrito = carrito.find(item => item.claveCarrito === claveCarrito);
    const cantidadActualEnCarrito = existenteEnCarrito ? existenteEnCarrito.cantidad : 0;

    if (cantidadActualEnCarrito + cantidad > varianteElegida.stock) {
      alert(`Stock insuficiente para "${varianteElegida.etiqueta}". Máximo permitido: ${varianteElegida.stock} unidades (ya tienes ${cantidadActualEnCarrito} en el carrito).`);
      return;
    }

    setCarrito(carritoAnterior => {
      if (existenteEnCarrito) {
        return carritoAnterior.map(item =>
          item.claveCarrito === claveCarrito ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      } else {
        return [
          ...carritoAnterior,
          {
            claveCarrito,
            id: productoActualEnCatalogo.id,
            idProducto: productoActualEnCatalogo.id,
            idVariante: varianteElegida.id,
            etiquetaVariante: varianteElegida.etiqueta,
            nombre: productoActualEnCatalogo.nombre,
            imagen: productoActualEnCatalogo.imagen,
            precio: varianteElegida.precioFinal,
            cantidad
          }
        ];
      }
    });

    if (desdeDetalle) {
      navegarA('cart');
    } else {
      alert(`Agregado: ${productoActualEnCatalogo.nombre} (${varianteElegida.etiqueta})`);
    }
  };

  const aplicarCupon = () => {
    if (codigoCupon.trim().toUpperCase() === 'BIENVENIDO10') {
      setDescuentoActivo(true);
      alert('¡Cupón BIENVENIDO10 aplicado con éxito (10% de descuento)!');
    } else {
      alert('Código de cupón inválido o desconocido.');
      setDescuentoActivo(false);
    }
  };

  const confirmarCompra = () => {
    if (!nombreComprador.trim() || !telefonoComprador.trim() || !ciudadComprador.trim() || !direccionComprador.trim()) {
      alert('Por favor completa todos los datos obligatorios del comprador.');
      return;
    }

    for (let articulo of carrito) {
      const producto = productos.find(item => item.id === articulo.idProducto);
      const variante = producto && Array.isArray(producto.variantes)
        ? producto.variantes.find(item => item.id === articulo.idVariante)
        : null;
      if (!variante || articulo.cantidad > variante.stock) {
        alert(`La opción "${articulo.nombre} (${articulo.etiquetaVariante})" ya no cuenta con stock suficiente.`);
        return;
      }
    }

    const subtotal = carrito.reduce((acumulado, articulo) => acumulado + (articulo.precio * articulo.cantidad), 0);
    const descuento = descuentoActivo ? subtotal * 0.10 : 0;
    const subtotalConDescuento = subtotal - descuento;
    const envio = subtotalConDescuento >= 150000 ? 0 : 8000;
    const totalFinal = subtotalConDescuento + envio;

    const codigoPedido = 'OMNX-' + Math.floor(100000 + Math.random() * 900000);
    setUltimoCodigoPedido(codigoPedido);

    setProductos(productosAnteriores => {
      return productosAnteriores.map(producto => {
        const articulosParaProducto = carrito.filter(item => item.idProducto === producto.id);
        if (articulosParaProducto.length === 0 || !Array.isArray(producto.variantes)) return producto;

        const variantesActualizadas = producto.variantes.map(variante => {
          const articuloCarritoCoincidente = articulosParaProducto.find(itemCarrito => itemCarrito.idVariante === variante.id);
          if (!articuloCarritoCoincidente) return variante;
          return { ...variante, stock: Math.max(0, variante.stock - articuloCarritoCoincidente.cantidad) };
        });

        return { ...producto, variantes: variantesActualizadas };
      });
    });

    const fechaActual = new Date().toLocaleString();
    const nuevoPedido = {
      codigo: codigoPedido,
      fecha: fechaActual,
      estado: 'Confirmado',
      stockRestaurado: false,
      articulos: carrito.map(articulo => ({
        idProducto: articulo.idProducto,
        idVariante: articulo.idVariante,
        etiquetaVariante: articulo.etiquetaVariante,
        nombre: articulo.nombre,
        precioUnitario: articulo.precio,
        cantidad: articulo.cantidad
      })),
      subtotal,
      descuento,
      costoEnvio: envio,
      total: totalFinal,
      comprador: {
        nombre: nombreComprador,
        telefono: telefonoComprador,
        ciudad: ciudadComprador,
        direccion: direccionComprador
      },
      historialEstados: [{ estado: 'Confirmado', fecha: fechaActual }]
    };

    setHistorial(anterior => [nuevoPedido, ...anterior]);
    setCarrito([]);
    setDescuentoActivo(false);
    setCodigoCupon('');
    navegarA('success');
  };

  const productosFiltrados = productos.filter(producto => {
    const consulta = consultaBusqueda.toLowerCase();
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(consulta) ||
      producto.categoria.toLowerCase().includes(consulta) ||
      (producto.marca && producto.marca.toLowerCase().includes(consulta));

    const coincideCategoria = categoriaSeleccionada === 'all' || producto.categoria === categoriaSeleccionada;
    const coincideMarca = marcaSeleccionada === 'all' || producto.marca === marcaSeleccionada;

    const precioVisible = obtenerPrecioVisibleProducto(producto);
    const coincideMinimo = precioMinimoAplicado === null || precioVisible >= precioMinimoAplicado;
    const coincideMaximo = precioMaximoAplicado === null || precioVisible <= precioMaximoAplicado;

    const stockTotal = obtenerStockTotalProducto(producto);
    const coincideDisponibilidad = !soloDisponibles || stockTotal > 0;

    return coincideBusqueda && coincideCategoria && coincideMarca && coincideMinimo && coincideMaximo && coincideDisponibilidad;
  }).sort((primero, segundo) => {
    if (ordenarPor === 'asc') return obtenerPrecioVisibleProducto(primero) - obtenerPrecioVisibleProducto(segundo);
    if (ordenarPor === 'desc') return obtenerPrecioVisibleProducto(segundo) - obtenerPrecioVisibleProducto(primero);
    return 0;
  });

  const marcasDisponibles = Array.from(new Set(productos.map(producto => producto.marca).filter(Boolean)));

  const productosComparados = idsComparacion
    .map(id => productos.find(producto => producto.id === id))
    .filter(Boolean);

  const obtenerColorEstadoPedido = (estado) => {
    if (estado === 'Cancelado') return '#ff5c5c';
    if (estado === 'Entregado') return '#4ade80';
    if (estado === 'Enviado') return '#38bdf8';
    if (estado === 'En preparación') return '#facc15';
    return '#9366F1';
  };

  const conteoEstadosHistorial = historial.reduce((acumulado, pedido) => {
    const estado = pedido.estado || 'Confirmado';
    acumulado[estado] = (acumulado[estado] || 0) + 1;
    return acumulado;
  }, {});

  const totalPedidosActivos = historial
    .filter(pedido => (pedido.estado || 'Confirmado') !== 'Cancelado')
    .reduce((acumulado, pedido) => acumulado + (pedido.total || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171525" />

      <View style={styles.header}>
        <Pressable onPress={() => navegarA('home')} style={styles.logoContainer}>
          <Image
            source={require('./assets/Imagenes/OMNIX_logo.jpg')}
            style={styles.logoImg}
          />
          <Text style={styles.headerOwnerText}>OMNIX - Tecnologia a tu alcancé</Text>
        </Pressable>
        <View style={styles.headerIcons}>
          <Pressable style={styles.cartIconBtn} onPress={() => navegarA('profile')}>
            <Text style={styles.cartIconText}>👤</Text>
            {perfilComprador && (
              <View style={[styles.cartBadge, { backgroundColor: '#4ade80' }]}>
                <Text style={[styles.cartBadgeText, { color: '#0b0a12' }]}>✓</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.cartIconBtn} onPress={() => navegarA('compare')}>
            <Text style={styles.cartIconText}>⚖️</Text>
            {idsComparacion.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{idsComparacion.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.cartIconBtn} onPress={() => navegarA('favorites')}>
            <Text style={styles.cartIconText}>❤️</Text>
            {favoritos.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{favoritos.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.cartIconBtn} onPress={() => navegarA('cart')}>
            <Text style={styles.cartIconText}>🛒</Text>
            {totalArticulosCarrito > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalArticulosCarrito}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.contentContainer}>

        {pantallaActual === 'home' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar tecnología OMNIX..."
                placeholderTextColor="#A3A0B8"
                value={consultaBusqueda}
                onChangeText={setConsultaBusqueda}
              />
            </View>

            {perfilComprador && perfilComprador.categoriaFavorita && (
              <Pressable style={styles.favCategoryBanner} onPress={gestionarAplicarCategoriaFavorita}>
                <Text style={styles.favCategoryBannerText}>
                  ⭐ Tu categoría favorita: {perfilComprador.categoriaFavorita} (Ver en catálogo)
                </Text>
              </Pressable>
            )}

            {idsComparacion.length > 0 && (
              <Pressable style={styles.compareBannerBtn} onPress={() => navegarA('compare')}>
                <Text style={styles.compareBannerText}>
                  ⚖️ Abrir Comparador ({idsComparacion.length}/3 seleccionados)
                </Text>
              </Pressable>
            )}

            <Pressable style={styles.sellerPanelBtn} onPress={iniciarCreacionProducto}>
              <Text style={styles.sellerPanelBtnText}>⚙️ Panel de Vendedor (Crear / Editar)</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Categorías</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              <Pressable
                style={[styles.categoryChip, categoriaSeleccionada === 'all' && styles.categoryChipActive]}
                onPress={() => setCategoriaSeleccionada('all')}
              >
                <Text style={[styles.categoryChipText, categoriaSeleccionada === 'all' && styles.categoryChipTextActive]}>Todos</Text>
              </Pressable>
              {INFO_MARCA.categorias.map((categoria, indice) => (
                <Pressable
                  key={indice}
                  style={[styles.categoryChip, categoriaSeleccionada === categoria && styles.categoryChipActive]}
                  onPress={() => setCategoriaSeleccionada(categoria)}
                >
                  <Text style={[styles.categoryChipText, categoriaSeleccionada === categoria && styles.categoryChipTextActive]}>{categoria}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Destacados</Text>
              <Pressable onPress={() => navegarA('catalog')}>
                <Text style={styles.seeAllText}>Ver todo</Text>
              </Pressable>
            </View>

            <View style={styles.productsGrid}>
              {productosFiltrados.slice(0, 4).map(producto => {
                const listaResenas = Array.isArray(producto.resenas) ? producto.resenas : [];
                const promedio = listaResenas.length > 0
                  ? (listaResenas.reduce((a, b) => a + b, 0) / listaResenas.length).toFixed(1)
                  : '0.0';
                const tieneMultiplesVariantes = Array.isArray(producto.variantes) && producto.variantes.length > 1;
                const estaComparado = idsComparacion.includes(producto.id);
                const stockTotal = obtenerStockTotalProducto(producto);
                const insigniaStock = obtenerInfoInsigniaStock(stockTotal);
                return (
                  <Pressable key={producto.id} style={styles.productCard} onPress={() => abrirDetalleProducto(producto)}>
                    <Image source={{ uri: producto.imagen }} style={styles.productImg} />
                    <Pressable style={styles.favBtnCard} onPress={(evento) => { evento.stopPropagation(); alternarFavorito(producto); }}>
                      <Text>{favoritos.some(item => item.id === producto.id) ? '❤️' : '🤍'}</Text>
                    </Pressable>
                    <View style={styles.productInfo}>
                      <Text style={styles.brandTagText}>{producto.marca || 'OMNIX Labs'}</Text>
                      <Text style={styles.productName} numberOfLines={2}>{producto.nombre}</Text>
                      <Text style={styles.ratingCardText}>⭐ {promedio} ({listaResenas.length})</Text>
                      {insigniaStock.tipo === 'low' && (
                        <Text style={styles.lowStockAlertText}>{insigniaStock.etiqueta}</Text>
                      )}
                      {insigniaStock.tipo === 'out' && (
                        <Text style={styles.outStockAlertText}>{insigniaStock.etiqueta}</Text>
                      )}
                      {tieneMultiplesVariantes && (
                        <Text style={styles.variantBadgeText}>{producto.variantes.length} variantes</Text>
                      )}
                      <View style={styles.productFooter}>
                        <Text style={styles.productPrice}>${obtenerPrecioVisibleProducto(producto).toLocaleString()}</Text>
                        <Pressable
                          style={styles.addMiniBtn}
                          onPress={(evento) => { evento.stopPropagation(); agregarAlCarrito(producto, 1, null, false); }}
                        >
                          <Text style={styles.addMiniBtnText}>+</Text>
                        </Pressable>
                      </View>
                      <Pressable
                        style={[styles.compareMiniBtn, estaComparado && styles.compareMiniBtnActive]}
                        onPress={(evento) => { evento.stopPropagation(); alternarComparacion(producto); }}
                      >
                        <Text style={[styles.compareMiniBtnText, estaComparado && { color: '#ffffff' }]}>
                          {estaComparado ? '✓ En comparador' : '⚖️ Comparar'}
                        </Text>
                      </Pressable>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}

        {pantallaActual === 'catalog' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre, categoría o marca..."
                placeholderTextColor="#A3A0B8"
                value={consultaBusqueda}
                onChangeText={setConsultaBusqueda}
              />
            </View>

            <Pressable style={styles.compareBannerBtn} onPress={() => navegarA('compare')}>
              <Text style={styles.compareBannerText}>
                ⚖️ Comparador de Productos ({idsComparacion.length}/3 seleccionados)
              </Text>
            </Pressable>

            <View style={styles.sortContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.specsTitle}>🎛️ Filtros Combinados</Text>
                <Pressable style={styles.resetFilterBtn} onPress={gestionarRestablecerFiltros}>
                  <Text style={styles.resetFilterBtnText}>Restablecer</Text>
                </Pressable>
              </View>

              <Text style={styles.sortLabel}>Categoría:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <Pressable
                  style={[styles.categoryChip, categoriaSeleccionada === 'all' && styles.categoryChipActive]}
                  onPress={() => setCategoriaSeleccionada('all')}
                >
                  <Text style={[styles.categoryChipText, categoriaSeleccionada === 'all' && styles.categoryChipTextActive]}>Todas</Text>
                </Pressable>
                {INFO_MARCA.categorias.map((categoria, indice) => (
                  <Pressable
                    key={indice}
                    style={[styles.categoryChip, categoriaSeleccionada === categoria && styles.categoryChipActive]}
                    onPress={() => setCategoriaSeleccionada(categoria)}
                  >
                    <Text style={[styles.categoryChipText, categoriaSeleccionada === categoria && styles.categoryChipTextActive]}>{categoria}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.sortLabel}>Marca:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <Pressable
                  style={[styles.categoryChip, marcaSeleccionada === 'all' && styles.categoryChipActive]}
                  onPress={() => setMarcaSeleccionada('all')}
                >
                  <Text style={[styles.categoryChipText, marcaSeleccionada === 'all' && styles.categoryChipTextActive]}>Todas</Text>
                </Pressable>
                {marcasDisponibles.map((marca, indice) => (
                  <Pressable
                    key={indice}
                    style={[styles.categoryChip, marcaSeleccionada === marca && styles.categoryChipActive]}
                    onPress={() => setMarcaSeleccionada(marca)}
                  >
                    <Text style={[styles.categoryChipText, marcaSeleccionada === marca && styles.categoryChipTextActive]}>{marca}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.sortLabel}>Rango de precio (COP):</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  placeholder="Mínimo"
                  placeholderTextColor="#A3A0B8"
                  keyboardType="numeric"
                  value={entradaPrecioMinimo}
                  onChangeText={setEntradaPrecioMinimo}
                />
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  placeholder="Máximo"
                  placeholderTextColor="#A3A0B8"
                  keyboardType="numeric"
                  value={entradaPrecioMaximo}
                  onChangeText={setEntradaPrecioMaximo}
                />
                <Pressable style={styles.couponBtn} onPress={gestionarAplicarRangoPrecio}>
                  <Text style={styles.couponBtnText}>Aplicar</Text>
                </Pressable>
              </View>
              {errorFiltro !== '' && (
                <Text style={{ color: '#ff5c5c', fontSize: 12, marginBottom: 8 }}>{errorFiltro}</Text>
              )}

              <Pressable
                style={[styles.availabilityToggleBtn, soloDisponibles && styles.availabilityToggleBtnActive]}
                onPress={() => setSoloDisponibles(anterior => !anterior)}
              >
                <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                  {soloDisponibles ? '✓ Mostrando solo productos con stock disponible' : '☐ Filtrar solo con stock disponible'}
                </Text>
              </Pressable>

              <Text style={[styles.sortLabel, { marginTop: 10 }]}>Ordenar por precio:</Text>
              <View style={styles.sortBtnsRow}>
                <Pressable
                  style={[styles.sortBtn, ordenarPor === 'asc' && styles.sortBtnActive]}
                  onPress={() => setOrdenarPor('asc')}
                >
                  <Text style={[styles.sortBtnText, ordenarPor === 'asc' && styles.sortBtnTextActive]}>Menor a mayor</Text>
                </Pressable>
                <Pressable
                  style={[styles.sortBtn, ordenarPor === 'desc' && styles.sortBtnActive]}
                  onPress={() => setOrdenarPor('desc')}
                >
                  <Text style={[styles.sortBtnText, ordenarPor === 'desc' && styles.sortBtnTextActive]}>Mayor a menor</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Catálogo ({productosFiltrados.length})</Text>
              <Pressable style={styles.adminMiniBtn} onPress={iniciarCreacionProducto}>
                <Text style={styles.adminMiniBtnText}>+ Nuevo</Text>
              </Pressable>
            </View>

            {productosFiltrados.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Ningún producto coincide con los filtros combinados actuales. Prueba ajustando el rango o pulsa Restablecer.
                </Text>
                <Pressable style={[styles.primaryBtn, { paddingHorizontal: 20, marginTop: 8 }]} onPress={gestionarRestablecerFiltros}>
                  <Text style={styles.primaryBtnText}>Restablecer Filtros</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {productosFiltrados.map(producto => {
                  const listaResenas = Array.isArray(producto.resenas) ? producto.resenas : [];
                  const promedio = listaResenas.length > 0
                    ? (listaResenas.reduce((a, b) => a + b, 0) / listaResenas.length).toFixed(1)
                    : '0.0';
                  const stockTotal = obtenerStockTotalProducto(producto);
                  const insigniaStock = obtenerInfoInsigniaStock(stockTotal);
                  const tieneMultiplesVariantes = Array.isArray(producto.variantes) && producto.variantes.length > 1;
                  const estaComparado = idsComparacion.includes(producto.id);
                  return (
                    <Pressable key={producto.id} style={styles.productCard} onPress={() => abrirDetalleProducto(producto)}>
                      <Image source={{ uri: producto.imagen }} style={styles.productImg} />
                      <Pressable style={styles.favBtnCard} onPress={(evento) => { evento.stopPropagation(); alternarFavorito(producto); }}>
                        <Text>{favoritos.some(item => item.id === producto.id) ? '❤️' : '🤍'}</Text>
                      </Pressable>
                      <View style={styles.productInfo}>
                        <Text style={styles.brandTagText}>{producto.marca || 'OMNIX Labs'}</Text>
                        <Text style={styles.productName} numberOfLines={2}>{producto.nombre}</Text>
                        <Text style={styles.ratingCardText}>⭐ {promedio} ({listaResenas.length})</Text>
                        <Text
                          style={[
                            styles.stockInfoText,
                            insigniaStock.tipo === 'low' && styles.lowStockAlertText,
                            insigniaStock.tipo === 'out' && styles.outStockAlertText
                          ]}
                        >
                          {insigniaStock.etiqueta} {tieneMultiplesVariantes ? `(${producto.variantes.length} opc.)` : ''}
                        </Text>
                        <View style={styles.productFooter}>
                          <Text style={styles.productPrice}>${obtenerPrecioVisibleProducto(producto).toLocaleString()}</Text>
                          <Pressable
                            style={styles.addMiniBtn}
                            onPress={(evento) => { evento.stopPropagation(); agregarAlCarrito(producto, 1, null, false); }}
                          >
                            <Text style={styles.addMiniBtnText}>+</Text>
                          </Pressable>
                        </View>
                        <Pressable
                          style={[styles.compareMiniBtn, estaComparado && styles.compareMiniBtnActive]}
                          onPress={(evento) => { evento.stopPropagation(); alternarComparacion(producto); }}
                        >
                          <Text style={[styles.compareMiniBtnText, estaComparado && { color: '#ffffff' }]}>
                            {estaComparado ? '✓ En comparador' : '⚖️ Comparar'}
                          </Text>
                        </Pressable>
                        <Pressable style={styles.editProductBtn} onPress={(evento) => { evento.stopPropagation(); iniciarEdicionProducto(producto); }}>
                          <Text style={styles.editProductBtnText}>✏️ Editar Producto</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

        {pantallaActual === 'compare' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Pressable style={styles.backBtn} onPress={() => navegarA('catalog')}>
              <Text style={styles.backBtnText}>← Volver al Catálogo</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>⚖️ Comparador de Productos ({productosComparados.length}/3)</Text>
            <Text style={{ color: '#A3A0B8', fontSize: 12, marginBottom: 16 }}>
              Selecciona entre 2 y 3 productos desde el catálogo o detalle para comparar sus especificaciones lado a lado.
            </Text>

            {productosComparados.length < 2 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {productosComparados.length === 0
                    ? 'Aún no has seleccionado productos para comparar.'
                    : `Tienes 1 producto seleccionado (${productosComparados[0].nombre}). Selecciona al menos 1 producto más (máximo 3).`}
                </Text>
                <Pressable style={[styles.primaryBtn, { paddingHorizontal: 20, marginTop: 12 }]} onPress={() => navegarA('catalog')}>
                  <Text style={styles.primaryBtnText}>Elegir Productos en Catálogo</Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.compareColumnsRow}>
                  {productosComparados.map(producto => {
                    const stockTotal = obtenerStockTotalProducto(producto);
                    const insignia = obtenerInfoInsigniaStock(stockTotal);
                    return (
                      <View key={producto.id} style={styles.compareColCard}>
                        <Image source={{ uri: producto.imagen }} style={styles.compareColImg} />
                        <Text style={styles.compareColTitle} numberOfLines={2}>{producto.nombre}</Text>

                        <View style={styles.compareRowBox}>
                          <Text style={styles.compareFieldLabel}>Marca</Text>
                          <Text style={styles.compareFieldValue}>{producto.marca || 'OMNIX Labs'}</Text>
                        </View>

                        <View style={styles.compareRowBox}>
                          <Text style={styles.compareFieldLabel}>Categoría</Text>
                          <Text style={styles.compareFieldValue}>{producto.categoria}</Text>
                        </View>

                        <View style={styles.compareRowBox}>
                          <Text style={styles.compareFieldLabel}>Precio</Text>
                          <Text style={[styles.compareFieldValue, { color: '#9366F1', fontWeight: 'bold' }]}>
                            ${obtenerPrecioVisibleProducto(producto).toLocaleString()}
                          </Text>
                        </View>

                        <View style={styles.compareRowBox}>
                          <Text style={styles.compareFieldLabel}>Disponibilidad</Text>
                          <Text
                            style={[
                              styles.compareFieldValue,
                              { color: insignia.tipo === 'out' ? '#ff5c5c' : insignia.tipo === 'low' ? '#facc15' : '#4ade80' }
                            ]}
                          >
                            {insignia.etiqueta}
                          </Text>
                        </View>

                        <Pressable
                          style={[styles.editProductBtn, { marginTop: 10 }]}
                          onPress={() => abrirDetalleProducto(producto)}
                        >
                          <Text style={styles.editProductBtnText}>Ver Detalle</Text>
                        </Pressable>

                        <Pressable
                          style={styles.removeCompareBtn}
                          onPress={() => alternarComparacion(producto)}
                        >
                          <Text style={styles.removeCompareBtnText}>Quitar</Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </ScrollView>
        )}

        {pantallaActual === 'detail' && productoSeleccionado && (() => {
          const seleccionadoActual = productos.find(item => item.id === productoSeleccionado.id) || productoSeleccionado;
          const variantes = Array.isArray(seleccionadoActual.variantes) ? seleccionadoActual.variantes : [];
          const varianteActiva = variantes.find(item => item.id === idVarianteSeleccionada) || null;
          const stockTotal = obtenerStockTotalProducto(seleccionadoActual);
          const precioMostrado = varianteActiva ? varianteActiva.precioFinal : obtenerPrecioVisibleProducto(seleccionadoActual);
          const stockMostrado = varianteActiva ? varianteActiva.stock : stockTotal;
          const insigniaStockMostrado = obtenerInfoInsigniaStock(stockMostrado);
          const estaComparado = idsComparacion.includes(seleccionadoActual.id);

          const listaResenas = Array.isArray(seleccionadoActual.resenas) ? seleccionadoActual.resenas : [];
          const promedio = listaResenas.length > 0
            ? (listaResenas.reduce((a, b) => a + b, 0) / listaResenas.length).toFixed(1)
            : 'Sin valoraciones';

          const preguntasProducto = preguntas.filter(item => item.idProducto === seleccionadoActual.id);

          const productosRelacionados = productos
            .filter(item => item.categoria === seleccionadoActual.categoria && item.id !== seleccionadoActual.id && obtenerStockTotalProducto(item) > 0)
            .slice(0, 4);

          return (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Pressable style={styles.backBtn} onPress={() => navegarA('catalog')}>
                <Text style={styles.backBtnText}>← Regresar</Text>
              </Pressable>

              <Image source={{ uri: seleccionadoActual.imagen }} style={styles.detailHeroImg} />

              <View style={styles.detailTitleRow}>
                <Text style={styles.detailTitle}>{seleccionadoActual.nombre}</Text>
                <Pressable onPress={() => alternarFavorito(seleccionadoActual)}>
                  <Text style={{ fontSize: 24 }}>{favoritos.some(item => item.id === seleccionadoActual.id) ? '❤️' : '🤍'}</Text>
                </Pressable>
              </View>

              <Text style={styles.detailPrice}>
                ${precioMostrado.toLocaleString()} {varianteActiva ? `(${varianteActiva.etiqueta})` : ''}
              </Text>

              {insigniaStockMostrado.tipo === 'low' && (
                <View style={styles.lowStockBannerBox}>
                  <Text style={styles.lowStockAlertText}>{insigniaStockMostrado.etiqueta}</Text>
                </View>
              )}
              {insigniaStockMostrado.tipo === 'out' && (
                <View style={styles.outOfStockBox}>
                  <Text style={styles.outOfStockText}>AGOTADO — SIN UNIDADES DISPONIBLES</Text>
                </View>
              )}

              <Pressable
                style={[styles.compareBannerBtn, estaComparado && { backgroundColor: '#9366F1' }]}
                onPress={() => alternarComparacion(seleccionadoActual)}
              >
                <Text style={styles.compareBannerText}>
                  {estaComparado ? '✓ Seleccionado en Comparador (Quitar)' : '⚖️ Añadir al Comparador'}
                </Text>
              </Pressable>

              <View style={styles.ratingOverviewBox}>
                <Text style={styles.ratingOverviewText}>
                  ⭐ Promedio: {promedio} / 5.0 ({listaResenas.length} valoraciones)
                </Text>
              </View>

              <Text style={styles.detailDesc}>{seleccionadoActual.descripcion}</Text>

              <View style={styles.specsBox}>
                <Text style={styles.specsTitle}>
                  {variantes.length > 1 ? 'Selecciona una variante (Obligatorio) *' : 'Presentación Disponible'}
                </Text>
                <View style={styles.variantsList}>
                  {variantes.map(variante => {
                    const estaSeleccionada = idVarianteSeleccionada === variante.id;
                    const insigniaVariante = obtenerInfoInsigniaStock(variante.stock);
                    const estaAgotada = variante.stock <= 0;
                    return (
                      <Pressable
                        key={variante.id}
                        style={[
                          styles.variantOptionBtn,
                          estaSeleccionada && styles.variantOptionBtnActive,
                          estaAgotada && styles.variantOptionBtnDisabled
                        ]}
                        onPress={() => {
                          setIdVarianteSeleccionada(variante.id);
                          setCantidadDetalle(1);
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.variantOptionTitle, estaSeleccionada && { color: '#ffffff' }]}>
                            {variante.etiqueta}
                          </Text>
                          <Text style={styles.variantOptionMeta}>
                            ${variante.precioFinal.toLocaleString()} • {insigniaVariante.etiqueta}
                          </Text>
                        </View>
                        <Text style={{ color: estaSeleccionada ? '#ffffff' : '#9366F1', fontWeight: 'bold' }}>
                          {estaSeleccionada ? '✓' : 'Elegir'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.specsBox}>
                <Text style={styles.specsTitle}>Especificaciones Técnicas</Text>
                <View style={styles.specsRow}>
                  <Text style={styles.specsLabel}>Marca</Text>
                  <Text style={styles.specsValue}>{seleccionadoActual.marca || 'OMNIX Labs'}</Text>
                </View>
                <View style={styles.specsRow}>
                  <Text style={styles.specsLabel}>Categoría</Text>
                  <Text style={styles.specsValue}>{seleccionadoActual.categoria}</Text>
                </View>
                <View style={styles.specsRow}>
                  <Text style={styles.specsLabel}>Estado de Inventario</Text>
                  <Text style={styles.specsValue}>{insigniaStockMostrado.etiqueta}</Text>
                </View>
              </View>

              {stockTotal === 0 ? (
                <View style={styles.outOfStockBox}>
                  <Text style={styles.outOfStockText}>PRODUCTO AGOTADO</Text>
                </View>
              ) : varianteActiva && varianteActiva.stock <= 0 ? (
                <View style={styles.outOfStockBox}>
                  <Text style={styles.outOfStockText}>VARIANTE AGOTADA — ELIGE OTRA OPCIÓN</Text>
                </View>
              ) : (
                <>
                  <View style={styles.quantityContainer}>
                    <Text style={styles.qtyLabel}>Cantidad:</Text>
                    <View style={styles.qtyControls}>
                      <Pressable style={styles.qtyBtn} onPress={() => setCantidadDetalle(Math.max(1, cantidadDetalle - 1))}>
                        <Text style={styles.qtyBtnText}>-</Text>
                      </Pressable>
                      <Text style={styles.qtyValue}>{cantidadDetalle}</Text>
                      <Pressable
                        style={styles.qtyBtn}
                        onPress={() => {
                          const maximoPermitido = varianteActiva ? varianteActiva.stock : stockTotal;
                          if (cantidadDetalle + 1 > maximoPermitido) {
                            alert(`Stock máximo permitido para esta opción: ${maximoPermitido} unidades.`);
                            return;
                          }
                          setCantidadDetalle(cantidadDetalle + 1);
                        }}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </Pressable>
                    </View>
                  </View>

                  <Pressable
                    style={styles.primaryBtn}
                    onPress={() => agregarAlCarrito(seleccionadoActual, cantidadDetalle, idVarianteSeleccionada, true)}
                  >
                    <Text style={styles.primaryBtnText}>Agregar al Carrito</Text>
                  </Pressable>
                </>
              )}

              <View style={[styles.reviewBox, { marginTop: 22 }]}>
                <Text style={styles.specsTitle}>❓ Preguntas sobre este producto ({preguntasProducto.length})</Text>
                <TextInput
                  style={[styles.formInput, { marginTop: 6, marginBottom: 8 }]}
                  placeholder="Escribe tu duda (mínimo 10 caracteres)..."
                  placeholderTextColor="#A3A0B8"
                  value={entradaPregunta}
                  onChangeText={setEntradaPregunta}
                />
                <Pressable style={styles.reviewBtn} onPress={() => gestionarAgregarPregunta(seleccionadoActual.id)}>
                  <Text style={styles.reviewBtnText}>Enviar pregunta</Text>
                </Pressable>

                {preguntasProducto.length === 0 ? (
                  <Text style={[styles.emptyText, { marginTop: 12, textAlign: 'left' }]}>
                    Aún no hay preguntas para este artículo. ¡Sé el primero en consultar!
                  </Text>
                ) : (
                  <View style={{ marginTop: 12, gap: 10 }}>
                    {preguntasProducto.map(itemPregunta => (
                      <View key={itemPregunta.id} style={styles.questionCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ color: '#A3A0B8', fontSize: 11 }}>{itemPregunta.fecha}</Text>
                          <Text style={{ color: itemPregunta.estado === 'Respondido' ? '#4ade80' : '#facc15', fontSize: 11, fontWeight: 'bold' }}>
                            {itemPregunta.estado}
                          </Text>
                        </View>
                        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                          P: {itemPregunta.pregunta}
                        </Text>
                        {itemPregunta.estado === 'Respondido' ? (
                          <Text style={{ color: '#c4b5fd', fontSize: 12, lineHeight: 18 }}>
                            {itemPregunta.respuestaSimulada}
                          </Text>
                        ) : (
                          <Pressable
                            style={styles.simActionBtn}
                            onPress={() => gestionarSimularRespuestaPregunta(itemPregunta.id, seleccionadoActual.nombre)}
                          >
                            <Text style={styles.simActionBtnText}>Simular respuesta (Demostración)</Text>
                          </Pressable>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.specsBox}>
                <Text style={styles.specsTitle}>✨ Productos relacionados ({seleccionadoActual.categoria})</Text>
                {productosRelacionados.length === 0 ? (
                  <Text style={[styles.emptyText, { textAlign: 'left' }]}>
                    No hay otros artículos disponibles en esta categoría en este momento.
                  </Text>
                ) : (
                  <View style={styles.productsGrid}>
                    {productosRelacionados.map(relacionado => {
                      const cantidadVariantesDisponibles = Array.isArray(relacionado.variantes)
                        ? relacionado.variantes.filter(variante => variante.stock > 0).length
                        : 0;
                      return (
                        <Pressable
                          key={relacionado.id}
                          style={[styles.productCard, { marginBottom: 4 }]}
                          onPress={() => abrirDetalleProducto(relacionado)}
                        >
                          <Image source={{ uri: relacionado.imagen }} style={styles.productImg} />
                          <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>{relacionado.nombre}</Text>
                            <Text style={styles.stockInfoText}>
                              {cantidadVariantesDisponibles > 1
                                ? `${cantidadVariantesDisponibles} opciones disp.`
                                : `${obtenerStockTotalProducto(relacionado)} disp.`}
                            </Text>
                            <Text style={styles.productPrice}>${obtenerPrecioVisibleProducto(relacionado).toLocaleString()}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              <View style={styles.reviewBox}>
                <Text style={styles.specsTitle}>Califica este producto (1 al 5)</Text>
                <View style={styles.reviewInputRow}>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Ej. 5"
                    placeholderTextColor="#A3A0B8"
                    keyboardType="numeric"
                    maxLength={1}
                    value={entradaResena}
                    onChangeText={setEntradaResena}
                  />
                  <Pressable style={styles.reviewBtn} onPress={() => gestionarAgregarResena(seleccionadoActual.id)}>
                    <Text style={styles.reviewBtnText}>Enviar Calificación</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable style={[styles.editProductBtn, { marginBottom: 16, padding: 12 }]} onPress={() => iniciarEdicionProducto(seleccionadoActual)}>
                <Text style={[styles.editProductBtnText, { textAlign: 'center', fontSize: 14 }]}>✏️ Editar este producto en Panel Vendedor</Text>
              </Pressable>
            </ScrollView>
          );
        })()}

        {pantallaActual === 'profile' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Pressable style={styles.backBtn} onPress={() => navegarA('home')}>
              <Text style={styles.backBtnText}>← Regresar al Inicio</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>👤 Perfil de Comprador y Preferencias</Text>
            <Text style={{ color: '#A3A0B8', fontSize: 12, marginBottom: 14 }}>
              Guarda tus datos frecuentes de entrega y tu categoría favorita para agilizar compras y exploración en OMNIX.
            </Text>

            {perfilComprador ? (
              <View style={styles.specsBox}>
                <Text style={styles.specsTitle}>✓ Perfil Guardado Actualmente</Text>
                <Text style={styles.specsValue}>Nombre: {perfilComprador.nombre}</Text>
                <Text style={styles.specsValue}>Teléfono: {perfilComprador.telefono}</Text>
                <Text style={styles.specsValue}>Municipio: {perfilComprador.ciudad}</Text>
                <Text style={styles.specsValue}>Dirección: {perfilComprador.direccion}</Text>
                <Text style={[styles.specsValue, { color: '#9366F1', marginTop: 4 }]}>
                  Categoría Favorita: {perfilComprador.categoriaFavorita}
                </Text>
                <Pressable style={[styles.couponBtn, { marginTop: 10, paddingVertical: 9 }]} onPress={gestionarAplicarCategoriaFavorita}>
                  <Text style={styles.couponBtnText}>Ir a mi categoría favorita en Catálogo</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.specsBox}>
                <Text style={{ color: '#A3A0B8', fontSize: 12 }}>
                  Aún no tienes un perfil guardado. Completa los campos abajo y pulsa "Guardar Perfil".
                </Text>
              </View>
            )}

            <View style={styles.formBox}>
              <Text style={styles.specsLabel}>Nombre completo *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. Omar Mayorga"
                placeholderTextColor="#A3A0B8"
                value={nombrePerfil}
                onChangeText={setNombrePerfil}
              />

              <Text style={styles.specsLabel}>Teléfono de contacto *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. 3001234567"
                placeholderTextColor="#A3A0B8"
                keyboardType="phone-pad"
                value={telefonoPerfil}
                onChangeText={setTelefonoPerfil}
              />

              <Text style={styles.specsLabel}>Municipio *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. Mosquera, Funza, Madrid"
                placeholderTextColor="#A3A0B8"
                value={ciudadPerfil}
                onChangeText={setCiudadPerfil}
              />

              <Text style={styles.specsLabel}>Dirección exacta *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. Calle 15 # 4-20"
                placeholderTextColor="#A3A0B8"
                value={direccionPerfil}
                onChangeText={setDireccionPerfil}
              />

              <Text style={styles.specsLabel}>Categoría Favorita *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 }}>
                {INFO_MARCA.categorias.map((categoria, indice) => (
                  <Pressable
                    key={indice}
                    style={[styles.categoryChip, categoriaFavoritaPerfil === categoria && styles.categoryChipActive]}
                    onPress={() => setCategoriaFavoritaPerfil(categoria)}
                  >
                    <Text style={[styles.categoryChipText, categoriaFavoritaPerfil === categoria && styles.categoryChipTextActive]}>
                      {categoria}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={[styles.primaryBtn, { marginTop: 10 }]} onPress={gestionarGuardarPerfil}>
                <Text style={styles.primaryBtnText}>Guardar Perfil y Preferencias</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {pantallaActual === 'admin' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Pressable style={styles.backBtn} onPress={() => navegarA('home')}>
              <Text style={styles.backBtnText}>← Regresar al Inicio</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>
              {idProductoEdicion === null ? '➕ Registrar Nuevo Producto' : '✏️ Editar Producto Existente'}
            </Text>
            <Text style={{ color: '#A3A0B8', fontSize: 12, marginBottom: 16 }}>
              {idProductoEdicion === null ? 'Complete el formulario para agregar un producto único al catálogo.' : `Modificando ID: ${idProductoEdicion} sin duplicar referencia.`}
            </Text>

            <View style={styles.formBox}>
              <Text style={styles.specsLabel}>Nombre del Producto *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. Cyber Neural Pad"
                placeholderTextColor="#A3A0B8"
                value={nombreFormulario}
                onChangeText={setNombreFormulario}
              />

              <Text style={styles.specsLabel}>Categoría *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 }}>
                {INFO_MARCA.categorias.map((categoria, indice) => (
                  <Pressable
                    key={indice}
                    style={[styles.categoryChip, categoriaFormulario === categoria && styles.categoryChipActive]}
                    onPress={() => setCategoriaFormulario(categoria)}
                  >
                    <Text style={[styles.categoryChipText, categoriaFormulario === categoria && styles.categoryChipTextActive]}>{categoria}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.specsLabel}>Precio en COP (Debe ser &gt; 0) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. 199990"
                placeholderTextColor="#A3A0B8"
                keyboardType="numeric"
                value={precioFormulario}
                onChangeText={setPrecioFormulario}
              />

              <Text style={styles.specsLabel}>Stock Disponible (&gt;= 0) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. 10"
                placeholderTextColor="#A3A0B8"
                keyboardType="numeric"
                value={stockFormulario}
                onChangeText={setStockFormulario}
              />

              <Text style={styles.specsLabel}>Descripción *</Text>
              <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Detalles del producto tecnológico..."
                placeholderTextColor="#A3A0B8"
                multiline
                value={descripcionFormulario}
                onChangeText={setDescripcionFormulario}
              />

              <Text style={styles.specsLabel}>URL de Imagen (Unsplash u otro) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor="#A3A0B8"
                value={imagenFormulario}
                onChangeText={setImagenFormulario}
              />

              <Pressable style={[styles.primaryBtn, { marginTop: 10 }]} onPress={gestionarGuardarProducto}>
                <Text style={styles.primaryBtnText}>
                  {idProductoEdicion === null ? 'Guardar Nuevo Producto' : 'Actualizar Producto'}
                </Text>
              </Pressable>

              <Pressable style={[styles.backBtn, { marginTop: 8, alignSelf: 'center' }]} onPress={() => navegarA('catalog')}>
                <Text style={styles.backBtnText}>Cancelar</Text>
              </Pressable>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Catálogo Actual para Edición Rápida</Text>
            {productos.map(producto => (
              <View key={producto.id} style={styles.adminRowCard}>
                <Image source={{ uri: producto.imagen }} style={styles.adminRowImg} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>{producto.nombre}</Text>
                  <Text style={{ color: '#9366F1', fontSize: 12 }}>${obtenerPrecioVisibleProducto(producto).toLocaleString()} | Stock: {obtenerStockTotalProducto(producto)}</Text>
                </View>
                <Pressable style={styles.adminEditMiniBtn} onPress={() => iniciarEdicionProducto(producto)}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Editar</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {pantallaActual === 'favorites' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Tus Favoritos OMNIX</Text>
            {favoritos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tienes productos guardados en favoritos.</Text>
                <Pressable style={[styles.primaryBtn, { marginTop: 16 }]} onPress={() => navegarA('catalog')}>
                  <Text style={styles.primaryBtnText}>Explorar Catálogo</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {favoritos.map(producto => (
                  <Pressable key={producto.id} style={styles.productCard} onPress={() => abrirDetalleProducto(producto)}>
                    <Image source={{ uri: producto.imagen }} style={styles.productImg} />
                    <Pressable style={styles.favBtnCard} onPress={(evento) => { evento.stopPropagation(); alternarFavorito(producto); }}>
                      <Text>{favoritos.some(item => item.id === producto.id) ? '❤️' : '🤍'}</Text>
                    </Pressable>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>{producto.nombre}</Text>
                      <View style={styles.productFooter}>
                        <Text style={styles.productPrice}>${obtenerPrecioVisibleProducto(producto).toLocaleString()}</Text>
                        <Pressable
                          style={styles.addMiniBtn}
                          onPress={(evento) => { evento.stopPropagation(); agregarAlCarrito(producto, 1, null, false); }}
                        >
                          <Text style={styles.addMiniBtnText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {pantallaActual === 'cart' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Tu Carrito OMNIX</Text>

            {carrito.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tu carrito OMNIX está vacío (0 artículos en resumen).</Text>
                <Pressable style={[styles.primaryBtn, { marginTop: 16 }]} onPress={() => navegarA('catalog')}>
                  <Text style={styles.primaryBtnText}>Explorar Catálogo</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <View style={styles.statusSummaryBanner}>
                  <Text style={styles.specsTitle}>📊 Resumen de Estado del Carrito</Text>
                  <Text style={{ color: '#ffffff', fontSize: 12 }}>
                    Referencias distintas: {carrito.length} • Total de unidades: {totalArticulosCarrito}
                  </Text>
                  <Text style={{ color: '#A3A0B8', fontSize: 11, marginTop: 2 }}>
                    {carrito.reduce((acumulado, articulo) => acumulado + articulo.precio * articulo.cantidad, 0) >= 150000
                      ? '✓ Envío gratis desbloqueado (pedido >= $150.000)'
                      : 'Envío estándar $8.000 (Gratis desde $150.000)'}
                  </Text>
                </View>

                {carrito.map(articulo => (
                  <View key={articulo.claveCarrito} style={styles.cartItem}>
                    <Image source={{ uri: articulo.imagen }} style={styles.cartItemImg} />
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemTitle}>{articulo.nombre}</Text>
                      <Text style={styles.cartVariantLabel}>Opción: {articulo.etiquetaVariante}</Text>
                      <Text style={styles.cartItemPrice}>${(articulo.precio * articulo.cantidad).toLocaleString()}</Text>
                      <View style={styles.cartItemControls}>
                        <Pressable
                          style={styles.cartQtyBtn}
                          onPress={() => {
                            setCarrito(carrito.map(item =>
                              item.claveCarrito === articulo.claveCarrito
                                ? { ...item, cantidad: Math.max(1, item.cantidad - 1) }
                                : item
                            ));
                          }}
                        >
                          <Text style={styles.cartQtyBtnText}>-</Text>
                        </Pressable>
                        <Text style={styles.cartQtyValue}>{articulo.cantidad}</Text>
                        <Pressable
                          style={styles.cartQtyBtn}
                          onPress={() => {
                            const producto = productos.find(item => item.id === articulo.idProducto);
                            const variante = producto && Array.isArray(producto.variantes)
                              ? producto.variantes.find(item => item.id === articulo.idVariante)
                              : null;
                            const stockMaximo = variante ? variante.stock : articulo.cantidad;
                            if (articulo.cantidad + 1 > stockMaximo) {
                              alert(`Stock máximo alcanzado para "${articulo.etiquetaVariante}" (${stockMaximo} unidades).`);
                              return;
                            }
                            setCarrito(carrito.map(item =>
                              item.claveCarrito === articulo.claveCarrito
                                ? { ...item, cantidad: item.cantidad + 1 }
                                : item
                            ));
                          }}
                        >
                          <Text style={styles.cartQtyBtnText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => setCarrito(carrito.filter(item => item.claveCarrito !== articulo.claveCarrito))}
                      style={styles.deleteItemBtn}
                    >
                      <Text style={styles.deleteItemText}>×</Text>
                    </Pressable>
                  </View>
                ))}

                <View style={styles.couponBox}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Código de cupón (ej. BIENVENIDO10)"
                    placeholderTextColor="#A3A0B8"
                    value={codigoCupon}
                    onChangeText={setCodigoCupon}
                  />
                  <Pressable style={styles.couponBtn} onPress={aplicarCupon}>
                    <Text style={styles.couponBtnText}>Aplicar</Text>
                  </Pressable>
                </View>

                <View style={styles.formBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.specsTitle}>Datos de Entrega (Simulación)</Text>
                    <Pressable style={styles.autofillBtn} onPress={gestionarAutocompletarDesdePerfil}>
                      <Text style={styles.autofillBtnText}>📥 Autocompletar</Text>
                    </Pressable>
                  </View>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nombre completo"
                    placeholderTextColor="#A3A0B8"
                    value={nombreComprador}
                    onChangeText={setNombreComprador}
                  />
                  <TextInput
                    style={styles.formInput}
                    placeholder="Teléfono de contacto"
                    placeholderTextColor="#A3A0B8"
                    keyboardType="phone-pad"
                    value={telefonoComprador}
                    onChangeText={setTelefonoComprador}
                  />
                  <TextInput
                    style={styles.formInput}
                    placeholder="Municipio (ej. Mosquera, Funza, Madrid)"
                    placeholderTextColor="#A3A0B8"
                    value={ciudadComprador}
                    onChangeText={setCiudadComprador}
                  />
                  <TextInput
                    style={styles.formInput}
                    placeholder="Dirección exacta"
                    placeholderTextColor="#A3A0B8"
                    value={direccionComprador}
                    onChangeText={setDireccionComprador}
                  />
                </View>

                {(() => {
                  const subtotal = carrito.reduce((acumulado, articulo) => acumulado + (articulo.precio * articulo.cantidad), 0);
                  const descuento = descuentoActivo ? subtotal * 0.10 : 0;
                  const subtotalConDescuento = subtotal - descuento;
                  const envio = subtotalConDescuento >= 150000 ? 0 : 8000;
                  const total = subtotalConDescuento + envio;

                  return (
                    <View style={styles.summaryBox}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${subtotal.toLocaleString()}</Text>
                      </View>
                      {descuentoActivo && (
                        <View style={styles.summaryRow}>
                          <Text style={[styles.summaryLabel, { color: '#4ade80' }]}>Descuento (10%)</Text>
                          <Text style={[styles.summaryValue, { color: '#4ade80' }]}>-${descuento.toLocaleString()}</Text>
                        </View>
                      )}
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Envío Quantum Secure</Text>
                        <Text style={styles.summaryValue}>{envio === 0 ? 'Gratis' : '$8.000'}</Text>
                      </View>
                      <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                        <Text style={styles.summaryTotalLabel}>Total Estimado</Text>
                        <Text style={styles.summaryTotalValue}>${total.toLocaleString()}</Text>
                      </View>

                      <Pressable style={styles.primaryBtn} onPress={confirmarCompra}>
                        <Text style={styles.primaryBtnText}>Confirmar Compra Simulada</Text>
                      </Pressable>
                    </View>
                  );
                })()}
              </View>
            )}
          </ScrollView>
        )}

        {pantallaActual === 'success' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.successContainer}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🎉</Text>
              <Text style={styles.successTitle}>¡Pedido Registrado con Éxito!</Text>
              <Text style={styles.successCode}>Código de pedido: {ultimoCodigoPedido}</Text>
              <Text style={styles.successDesc}>
                Tu compra ha sido registrada en el prototipo de manera exitosa. Recuerda que este ejercicio es puramente académico y no genera cobros reales.
              </Text>
              <Pressable style={[styles.primaryBtn, { width: '100%', marginTop: 20 }]} onPress={() => navegarA('history')}>
                <Text style={styles.primaryBtnText}>Ver Historial de Pedidos</Text>
              </Pressable>
              <Pressable style={[styles.backBtn, { marginTop: 10, alignSelf: 'center' }]} onPress={() => navegarA('home')}>
                <Text style={styles.backBtnText}>Volver al Inicio</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {pantallaActual === 'history' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Historial de Pedidos</Text>

            <View style={styles.statusSummaryBanner}>
              <Text style={styles.specsTitle}>📊 Resumen de Estados ({historial.length} pedidos)</Text>
              <Text style={{ color: '#ffffff', fontSize: 12, marginBottom: 4 }}>
                Total acumulado pedidos activos: ${totalPedidosActivos.toLocaleString()}
              </Text>
              <Text style={{ color: '#A3A0B8', fontSize: 11 }}>
                Confirmado: {conteoEstadosHistorial['Confirmado'] || 0} • En preparación: {conteoEstadosHistorial['En preparación'] || 0} • Enviado: {conteoEstadosHistorial['Enviado'] || 0} • Entregado: {conteoEstadosHistorial['Entregado'] || 0} • Cancelado: {conteoEstadosHistorial['Cancelado'] || 0}
              </Text>
            </View>

            {historial.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay pedidos registrados en la sesión actual para consultar o recomprar.</Text>
                <Pressable style={[styles.primaryBtn, { marginTop: 16 }]} onPress={() => navegarA('catalog')}>
                  <Text style={styles.primaryBtnText}>Ir al Catálogo</Text>
                </Pressable>
              </View>
            ) : (
              historial.map((pedido, indice) => {
                const colorEstado = obtenerColorEstadoPedido(pedido.estado || 'Confirmado');
                return (
                  <View key={indice} style={styles.historyCard}>
                    <View style={styles.historyHeaderRow}>
                      <Text style={styles.historyCode}>{pedido.codigo}</Text>
                      <View style={[styles.statusBadge, { borderColor: colorEstado }]}>
                        <Text style={[styles.statusBadgeText, { color: colorEstado }]}>
                          {pedido.estado || 'Confirmado'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.historyDate, { marginBottom: 4 }]}>{pedido.fecha}</Text>
                    {pedido.comprador && (
                      <Text style={styles.historyBuyer}>Comprador: {pedido.comprador.nombre} ({pedido.comprador.ciudad})</Text>
                    )}
                    <View style={styles.historyItemsList}>
                      {pedido.articulos.map((articulo, i) => {
                        const precioUnitario = articulo.precio || articulo.precioUnitario || 0;
                        return (
                          <Text key={i} style={styles.historyItemText}>
                            • {articulo.nombre} {articulo.etiquetaVariante ? `[${articulo.etiquetaVariante}]` : ''} (x{articulo.cantidad}) - ${(precioUnitario * articulo.cantidad).toLocaleString()}
                          </Text>
                        );
                      })}
                    </View>
                    <View style={styles.historyFooterRow}>
                      <Text style={styles.historyTotalLabel}>Total Pagado:</Text>
                      <Text style={styles.historyTotalValue}>${pedido.total.toLocaleString()}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                      <Pressable
                        style={[styles.editProductBtn, { flex: 1, marginTop: 0, paddingVertical: 8 }]}
                        onPress={() => abrirDetallePedido(pedido.codigo)}
                      >
                        <Text style={styles.editProductBtnText}>📍 Seguimiento / Gestionar</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.couponBtn, { flex: 1, paddingVertical: 8 }]}
                        onPress={() => gestionarRecompra(pedido)}
                      >
                        <Text style={styles.couponBtnText}>🔄 Volver a comprar</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {pantallaActual === 'orderDetail' && (() => {
          const pedido = historial.find(item => item.codigo === codigoPedidoSeleccionado);
          if (!pedido) {
            return (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No se encontró el pedido seleccionado.</Text>
                <Pressable style={styles.backBtn} onPress={() => navegarA('history')}>
                  <Text style={styles.backBtnText}>← Volver al Historial</Text>
                </Pressable>
              </View>
            );
          }

          const estadoActual = pedido.estado || 'Confirmado';
          const colorEstado = obtenerColorEstadoPedido(estadoActual);
          const lineaTiempo = Array.isArray(pedido.historialEstados)
            ? pedido.historialEstados
            : [{ estado: estadoActual, fecha: pedido.fecha }];
          const puedeAvanzar = estadoActual !== 'Entregado' && estadoActual !== 'Cancelado';
          const puedeCancelar = estadoActual === 'Confirmado' || estadoActual === 'En preparación';

          return (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Pressable style={styles.backBtn} onPress={() => navegarA('history')}>
                <Text style={styles.backBtnText}>← Volver al Historial</Text>
              </Pressable>

              <View style={styles.historyHeaderRow}>
                <Text style={styles.sectionTitle}>Pedido {pedido.codigo}</Text>
                <View style={[styles.statusBadge, { borderColor: colorEstado }]}>
                  <Text style={[styles.statusBadgeText, { color: colorEstado }]}>{estadoActual}</Text>
                </View>
              </View>

              <View style={styles.specsBox}>
                <Text style={styles.specsTitle}>📍 Línea de Tiempo del Pedido</Text>
                {lineaTiempo.map((paso, indice) => (
                  <View key={indice} style={styles.timelineRow}>
                    <View style={[styles.timelineDot, { backgroundColor: obtenerColorEstadoPedido(paso.estado) }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>{paso.estado}</Text>
                      <Text style={{ color: '#A3A0B8', fontSize: 11 }}>{paso.fecha}</Text>
                    </View>
                  </View>
                ))}

                {estadoActual !== 'Cancelado' &&
                  PASOS_FLUJO_PEDIDO.filter(paso => !lineaTiempo.some(item => item.estado === paso)).map((pasoPendiente, indice) => (
                    <View key={`pend-${indice}`} style={[styles.timelineRow, { opacity: 0.45 }]}>
                      <View style={[styles.timelineDot, { backgroundColor: '#64748b' }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#cbd5e1', fontSize: 13 }}>{pasoPendiente}</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 11 }}>Pendiente</Text>
                      </View>
                    </View>
                  ))}

                {puedeAvanzar ? (
                  <Pressable
                    style={[styles.primaryBtn, { marginTop: 12, paddingVertical: 11 }]}
                    onPress={() => gestionarAvanzarEstadoPedido(pedido.codigo)}
                  >
                    <Text style={styles.primaryBtnText}>⏩ Avanzar estado (Simulación)</Text>
                  </Pressable>
                ) : (
                  <Text style={{ color: '#A3A0B8', fontSize: 12, marginTop: 10 }}>
                    Este pedido ha llegado a un estado final ({estadoActual}) y no puede avanzar más.
                  </Text>
                )}
              </View>

              <View style={styles.specsBox}>
                <Text style={styles.specsTitle}>🛡️ Gestión y Cancelación (HU26)</Text>
                {puedeCancelar ? (
                  <>
                    <Text style={{ color: '#A3A0B8', fontSize: 12, marginBottom: 10 }}>
                      Puedes cancelar este pedido mientras esté en "Confirmado" o "En preparación". Las unidades se reintegrarán automáticamente al catálogo.
                    </Text>
                    <Pressable
                      style={styles.cancelOrderBtn}
                      onPress={() => gestionarCancelarPedido(pedido.codigo)}
                    >
                      <Text style={styles.cancelOrderBtnText}>❌ Cancelar pedido y reintegrar stock</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text style={{ color: '#A3A0B8', fontSize: 12 }}>
                    {estadoActual === 'Cancelado'
                      ? 'Este pedido ya fue cancelado y su inventario fue reintegrado.'
                      : `No es posible cancelar un pedido que ya se encuentra en estado "${estadoActual}".`}
                  </Text>
                )}
              </View>

              <View style={styles.specsBox}>
                <Text style={styles.specsTitle}>📦 Artículos del Pedido</Text>
                {pedido.articulos.map((articulo, i) => {
                  const precioUnitario = articulo.precio || articulo.precioUnitario || 0;
                  return (
                    <Text key={i} style={[styles.historyItemText, { marginBottom: 4 }]}>
                      • {articulo.nombre} {articulo.etiquetaVariante ? `[${articulo.etiquetaVariante}]` : ''} (x{articulo.cantidad}) — ${(precioUnitario * articulo.cantidad).toLocaleString()}
                    </Text>
                  );
                })}
                <View style={[styles.historyFooterRow, { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }]}>
                  <Text style={styles.historyTotalLabel}>Total:</Text>
                  <Text style={styles.historyTotalValue}>${pedido.total.toLocaleString()}</Text>
                </View>

                <Pressable
                  style={[styles.couponBtn, { marginTop: 12, paddingVertical: 11 }]}
                  onPress={() => gestionarRecompra(pedido)}
                >
                  <Text style={styles.couponBtnText}>🔄 Volver a comprar estos artículos</Text>
                </Pressable>
              </View>
            </ScrollView>
          );
        })()}

      </View>

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => navegarA('home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Inicio</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => navegarA('catalog')}>
          <Text style={styles.navIcon}>📦</Text>
          <Text style={styles.navText}>Catálogo</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => navegarA('favorites')}>
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navText}>Favoritos</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => navegarA('cart')}>
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navText}>Carrito</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => navegarA('history')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Historial</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0a12',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 65,
    backgroundColor: '#171525',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 102, 241, 0.35)',
    marginTop: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImg: {
    width: 90,
    height: 28,
    resizeMode: 'contain',
  },
  headerOwnerText: {
    color: '#A3A0B8',
    fontSize: 11,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  cartIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(147, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartIconText: {
    fontSize: 13,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#9366F1',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  searchBox: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  favCategoryBanner: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderWidth: 1,
    borderColor: '#facc15',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  favCategoryBannerText: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: 'bold',
  },
  compareBannerBtn: {
    backgroundColor: 'rgba(147, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: '#9366F1',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  compareBannerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sellerPanelBtn: {
    backgroundColor: 'rgba(147, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: '#9366F1',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  sellerPanelBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  adminMiniBtn: {
    backgroundColor: '#9366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminMiniBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetFilterBtn: {
    backgroundColor: 'rgba(255, 92, 92, 0.2)',
    borderWidth: 1,
    borderColor: '#ff5c5c',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resetFilterBtnText: {
    color: '#ff8080',
    fontSize: 11,
    fontWeight: 'bold',
  },
  availabilityToggleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  availabilityToggleBtnActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderColor: '#4ade80',
  },
  compareMiniBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  compareMiniBtnActive: {
    backgroundColor: '#9366F1',
    borderColor: '#9366F1',
  },
  compareMiniBtnText: {
    color: '#c4b5fd',
    fontSize: 11,
    fontWeight: '600',
  },
  compareColumnsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
  },
  compareColCard: {
    width: 175,
    backgroundColor: 'rgba(23, 21, 37, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.45)',
    borderRadius: 16,
    padding: 12,
  },
  compareColImg: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  compareColTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    height: 38,
    marginBottom: 8,
  },
  compareRowBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
  },
  compareFieldLabel: {
    color: '#A3A0B8',
    fontSize: 11,
  },
  compareFieldValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  removeCompareBtn: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 92, 92, 0.15)',
    borderWidth: 1,
    borderColor: '#ff5c5c',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  removeCompareBtnText: {
    color: '#ff8080',
    fontSize: 11,
    fontWeight: 'bold',
  },
  editProductBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(147, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.4)',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  editProductBtnText: {
    color: '#9366F1',
    fontSize: 11,
    fontWeight: 'bold',
  },
  adminRowCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(23, 21, 37, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.3)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  adminRowImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  adminEditMiniBtn: {
    backgroundColor: '#9366F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  seeAllText: {
    color: '#9366F1',
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesScroll: {
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(147, 102, 241, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#9366F1',
  },
  categoryChipText: {
    color: '#A3A0B8',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  sortContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(147, 102, 241, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
  },
  sortLabel: {
    color: '#A3A0B8',
    fontSize: 12,
    marginBottom: 6,
  },
  sortBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.2)',
  },
  sortBtnActive: {
    backgroundColor: '#9366F1',
  },
  sortBtnText: {
    color: '#A3A0B8',
    fontSize: 12,
    fontWeight: '600',
  },
  sortBtnTextActive: {
    color: '#ffffff',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  productCard: {
    width: '48%',
    backgroundColor: 'rgba(23, 21, 37, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  productImg: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  favBtnCard: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  brandTagText: {
    color: '#9366F1',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    height: 36,
    marginBottom: 4,
  },
  ratingCardText: {
    color: '#facc15',
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '600',
  },
  variantBadgeText: {
    color: '#c4b5fd',
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '600',
  },
  stockInfoText: {
    color: '#A3A0B8',
    fontSize: 11,
    marginBottom: 6,
  },
  lowStockAlertText: {
    color: '#facc15',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lowStockBannerBox: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderWidth: 1,
    borderColor: '#facc15',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  outStockAlertText: {
    color: '#ff5c5c',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    color: '#9366F1',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addMiniBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(147, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: '#9366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMiniBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backBtn: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(23, 21, 37, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 13,
  },
  detailHeroImg: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  detailTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  detailPrice: {
    color: '#9366F1',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ratingOverviewBox: {
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderWidth: 1,
    borderColor: '#facc15',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  ratingOverviewText: {
    color: '#facc15',
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailDesc: {
    color: '#A3A0B8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  variantsList: {
    gap: 8,
    marginTop: 4,
  },
  variantOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 10,
    padding: 10,
  },
  variantOptionBtnActive: {
    backgroundColor: 'rgba(147, 102, 241, 0.35)',
    borderColor: '#9366F1',
  },
  variantOptionBtnDisabled: {
    opacity: 0.55,
    borderColor: 'rgba(255, 92, 92, 0.45)',
  },
  variantOptionTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  variantOptionMeta: {
    color: '#A3A0B8',
    fontSize: 11,
    marginTop: 2,
  },
  questionCard: {
    backgroundColor: 'rgba(23, 21, 37, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.3)',
    borderRadius: 10,
    padding: 10,
  },
  simActionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(147, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: '#9366F1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  simActionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  reviewBox: {
    backgroundColor: 'rgba(147, 102, 241, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  reviewInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  reviewInput: {
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 15,
    textAlign: 'center',
  },
  reviewBtn: {
    flex: 1,
    backgroundColor: '#9366F1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  reviewBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  specsBox: {
    backgroundColor: 'rgba(147, 102, 241, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  specsTitle: {
    color: '#9366F1',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  specsLabel: {
    color: '#A3A0B8',
    fontSize: 13,
  },
  specsValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  qtyLabel: {
    color: '#A3A0B8',
    fontSize: 14,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    paddingHorizontal: 14,
  },
  primaryBtn: {
    backgroundColor: '#9366F1',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#9366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
  },
  emptyText: {
    color: '#A3A0B8',
    fontSize: 14,
    textAlign: 'center',
  },
  outOfStockBox: {
    backgroundColor: 'rgba(255, 92, 92, 0.1)',
    borderWidth: 1,
    borderColor: '#ff5c5c',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  outOfStockText: {
    color: '#ff5c5c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusSummaryBanner: {
    backgroundColor: 'rgba(147, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.45)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  autofillBtn: {
    backgroundColor: 'rgba(147, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: '#9366F1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  autofillBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(23, 21, 37, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cartItemImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  cartVariantLabel: {
    color: '#c4b5fd',
    fontSize: 11,
    marginBottom: 4,
  },
  cartItemPrice: {
    color: '#9366F1',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartQtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartQtyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartQtyValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  deleteItemBtn: {
    padding: 8,
  },
  deleteItemText: {
    color: '#ff5c5c',
    fontSize: 20,
    fontWeight: 'bold',
  },
  couponBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  couponInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontSize: 13,
  },
  couponBtn: {
    backgroundColor: 'rgba(147, 102, 241, 0.3)',
    borderWidth: 1,
    borderColor: '#9366F1',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  formBox: {
    backgroundColor: 'rgba(147, 102, 241, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
  },
  summaryBox: {
    backgroundColor: 'rgba(147, 102, 241, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#A3A0B8',
    fontSize: 14,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  summaryTotalLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    color: '#9366F1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 10,
  },
  successTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successCode: {
    color: '#9366F1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  successDesc: {
    color: '#A3A0B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  historyCard: {
    backgroundColor: 'rgba(23, 21, 37, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyCode: {
    color: '#9366F1',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  historyDate: {
    color: '#A3A0B8',
    fontSize: 11,
  },
  historyBuyer: {
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  historyItemsList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    marginBottom: 8,
    gap: 4,
  },
  historyItemText: {
    color: '#A3A0B8',
    fontSize: 12,
  },
  historyFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTotalLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyTotalValue: {
    color: '#9366F1',
    fontSize: 15,
    fontWeight: 'bold',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cancelOrderBtn: {
    backgroundColor: 'rgba(255, 92, 92, 0.2)',
    borderWidth: 1,
    borderColor: '#ff5c5c',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  cancelOrderBtnText: {
    color: '#ff8080',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: 'rgba(23, 21, 37, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(147, 102, 241, 0.35)',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navText: {
    color: '#A3A0B8',
    fontSize: 10,
    fontWeight: '500',
  },
});