import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image, TextInput, SafeAreaView, StatusBar, Platform } from 'react-native';
import { BRAND_INFO, INITIAL_PRODUCTS } from './data/products';

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'catalog', 'detail', 'favorites', 'cart', 'success', 'history', 'admin'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default'); 
  const [detailQty, setDetailQty] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discountActive, setDiscountActive] = useState(false);

  // Estados para la valoración (HU19)
  const [reviewInput, setReviewInput] = useState('');

  // Estados para el Panel de Vendedor / Admin (HU18)
  const [editProductId, setEditProductId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Neural Net');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');

  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [lastOrderCode, setLastOrderCode] = useState('');

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  const openProductDetail = (product) => {
    const currentProd = products.find(p => p.id === product.id) || product;
    setSelectedProduct(currentProd);
    setDetailQty(1);
    setReviewInput('');
    navigateTo('detail');
  };

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Función para registrar reseña (HU19)
  const handleAddReview = (productId) => {
    const ratingNum = parseInt(reviewInput, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      alert('Error (CA02): La valoración debe ser un número entero entre 1 y 5.');
      return;
    }

    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        if (prod.id === productId) {
          const updatedReviews = [...prod.reviews, ratingNum];
          const updatedProduct = { ...prod, reviews: updatedReviews };
          if (selectedProduct && selectedProduct.id === productId) {
            setSelectedProduct(updatedProduct);
          }
          return updatedProduct;
        }
        return prod;
      });
    });

    setReviewInput('');
    alert('¡Valoración registrada con éxito (CA01)!');
  };

  // Funciones para el Panel de Vendedor (HU18 - CA01, CA02, CA03)
  const startCreateProduct = () => {
    setEditProductId(null);
    setFormName('');
    setFormCategory('Neural Net');
    setFormPrice('');
    setFormStock('');
    setFormDesc('');
    setFormImage('https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80');
    navigateTo('admin');
  };

  const startEditProduct = (prod) => {
    setEditProductId(prod.id);
    setFormName(prod.nombre);
    setFormCategory(prod.categoria);
    setFormPrice(prod.precio.toString());
    setFormStock(prod.stock.toString());
    setFormDesc(prod.descripcion);
    setFormImage(prod.imagen);
    navigateTo('admin');
  };

  const handleSaveProduct = () => {
    const priceNum = parseFloat(formPrice);
    const stockNum = parseInt(formStock, 10);

    // CA03: Validación de precio no positivo y stock negativo
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Error (CA03): El precio del producto debe ser un número positivo mayor a 0.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Error (CA03): El stock del producto no puede ser un número negativo.');
      return;
    }
    if (!formName.trim() || !formDesc.trim() || !formImage.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (editProductId === null) {
      // CA01: Crear producto con ID único
      const newProduct = {
        id: Date.now(),
        nombre: formName.trim(),
        categoria: formCategory,
        precio: priceNum,
        stock: stockNum,
        descripcion: formDesc.trim(),
        imagen: formImage.trim(),
        reviews: []
      };
      setProducts(prev => [newProduct, ...prev]);
      alert('¡Producto creado y agregado al catálogo con éxito (CA01)!');
    } else {
      // CA02: Actualizar producto existente sin duplicar la referencia
      setProducts(prev => prev.map(p => {
        if (p.id === editProductId) {
          return {
            ...p,
            nombre: formName.trim(),
            categoria: formCategory,
            precio: priceNum,
            stock: stockNum,
            descripcion: formDesc.trim(),
            imagen: formImage.trim()
          };
        }
        return p;
      }));
      alert('¡Información del producto actualizada correctamente (CA02)!');
    }

    navigateTo('catalog');
  };

  const addToCart = (product, quantity = 1) => {
    const currentProductInCatalog = products.find(p => p.id === product.id);
    const existingInCart = cart.find(item => item.id === product.id);
    const currentQtyInCart = existingInCart ? existingInCart.qty : 0;

    if (currentQtyInCart + quantity > currentProductInCatalog.stock) {
      alert(`Stock insuficiente. Solo hay ${currentProductInCatalog.stock} unidades disponibles.`);
      return;
    }

    setCart(prevCart => {
      if (existingInCart) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + quantity } : item
        );
      } else {
        return [...prevCart, { ...product, qty: quantity }];
      }
    });
  };

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'BIENVENIDO10') {
      setDiscountActive(true);
      alert('¡Cupón BIENVENIDO10 aplicado con éxito (10% de descuento)!');
    } else {
      alert('Código de cupón inválido o desconocido.');
      setDiscountActive(false);
    }
  };

  const confirmCheckout = () => {
    if (!buyerName.trim() || !buyerPhone.trim() || !buyerCity.trim() || !buyerAddress.trim()) {
      alert('Por favor completa todos los datos obligatorios del comprador.');
      return;
    }

    for (let item of cart) {
      const prod = products.find(p => p.id === item.id);
      if (item.qty > prod.stock) {
        alert(`El producto "${prod.nombre}" ya no cuenta con stock suficiente.`);
        return;
      }
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.qty), 0);
    const discount = discountActive ? subtotal * 0.10 : 0;
    const subtotalWithDiscount = subtotal - discount;
    const shipping = subtotalWithDiscount >= 150000 ? 0 : 8000;
    const finalTotal = subtotalWithDiscount + shipping;

    const orderCode = 'OMNX-' + Math.floor(100000 + Math.random() * 900000);
    setLastOrderCode(orderCode);

    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const cartItem = cart.find(item => item.id === prod.id);
        if (cartItem) {
          return { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) };
        }
        return prod;
      });
    });

    const newOrder = {
      code: orderCode,
      date: new Date().toLocaleString(),
      items: [...cart],
      subtotal,
      discount,
      shipping,
      total: finalTotal,
      buyer: { name: buyerName, phone: buyerPhone, city: buyerCity, address: buyerAddress }
    };

    setHistory(prev => [newOrder, ...prev]);
    setCart([]);
    setDiscountActive(false);
    setCouponCode('');
    navigateTo('success');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.categoria.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'asc') return a.precio - b.precio;
    if (sortBy === 'desc') return b.precio - a.precio;
    return 0;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171525" />
      
      {/* 1. BARRA SUPERIOR (HEADER OMNIX) */}
      <View style={styles.header}>
        <Pressable onPress={() => navigateTo('home')} style={styles.logoContainer}>
          <Image 
            source={require('./assets/Imagenes/OMNIX_logo.jpg')} 
            style={styles.logoImg} 
          />
          <Text style={styles.headerOwnerText}>OMNIX - Tecnologia a tu alcancé</Text> 
        </Pressable>
        <View style={styles.headerIcons}>
          <Pressable style={styles.cartIconBtn} onPress={() => navigateTo('favorites')}>
            <Text style={styles.cartIconText}>❤️</Text>
            {favorites.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{favorites.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.cartIconBtn} onPress={() => navigateTo('cart')}>
            <Text style={styles.cartIconText}>🛒</Text>
            {totalCartItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* 2. CONTENEDOR DE VISTAS (RENDERIZADO CONDICIONAL) */}
      <View style={styles.contentContainer}>
        
        {/* --- PANTALLA DE INICIO (HOME) --- */}
        {currentScreen === 'home' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar tecnología OMNIX..."
                placeholderTextColor="#A3A0B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Botón de acceso al Panel de Vendedor (HU18) */}
            <Pressable style={styles.sellerPanelBtn} onPress={startCreateProduct}>
              <Text style={styles.sellerPanelBtnText}>⚙️ Panel de Vendedor (Crear / Editar)</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Categorías</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              <Pressable 
                style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[styles.categoryChipText, selectedCategory === 'all' && styles.categoryChipTextActive]}>Todos</Text>
              </Pressable>
              {BRAND_INFO.categories.map((cat, index) => (
                <Pressable 
                  key={index}
                  style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Destacados</Text>
              <Pressable onPress={() => navigateTo('catalog')}>
                <Text style={styles.seeAllText}>Ver todo</Text>
              </Pressable>
            </View>

            <View style={styles.productsGrid}>
              {filteredProducts.slice(0, 4).map(product => {
                const avg = product.reviews && product.reviews.length > 0 
                  ? (product.reviews.reduce((a, b) => a + b, 0) / product.reviews.length).toFixed(1) 
                  : '0.0';
                return (
                  <Pressable key={product.id} style={styles.productCard} onPress={() => openProductDetail(product)}>
                    <Image source={{ uri: product.imagen }} style={styles.productImg} />
                    <Pressable style={styles.favBtnCard} onPress={(e) => { e.stopPropagation(); toggleFavorite(product); }}>
                      <Text>{favorites.some(f => f.id === product.id) ? '❤️' : '🤍'}</Text>
                    </Pressable>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>{product.nombre}</Text>
                      <Text style={styles.ratingCardText}>⭐ {avg} ({product.reviews ? product.reviews.length : 0})</Text>
                      <View style={styles.productFooter}>
                        <Text style={styles.productPrice}>${product.precio.toLocaleString()}</Text>
                        <Pressable 
                          style={styles.addMiniBtn} 
                          onPress={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                        >
                          <Text style={styles.addMiniBtnText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* --- PANTALLA DE CATÁLOGO COMPLETO --- */}
        {currentScreen === 'catalog' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Filtrar catálogo OMNIX..."
                placeholderTextColor="#A3A0B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Ordenar por precio:</Text>
              <View style={styles.sortBtnsRow}>
                <Pressable 
                  style={[styles.sortBtn, sortBy === 'asc' && styles.sortBtnActive]} 
                  onPress={() => setSortBy('asc')}
                >
                  <Text style={[styles.sortBtnText, sortBy === 'asc' && styles.sortBtnTextActive]}>Menor a mayor</Text>
                </Pressable>
                <Pressable 
                  style={[styles.sortBtn, sortBy === 'desc' && styles.sortBtnActive]} 
                  onPress={() => setSortBy('desc')}
                >
                  <Text style={[styles.sortBtnText, sortBy === 'desc' && styles.sortBtnTextActive]}>Mayor a menor</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Catálogo ({filteredProducts.length})</Text>
              <Pressable style={styles.adminMiniBtn} onPress={startCreateProduct}>
                <Text style={styles.adminMiniBtnText}>+ Nuevo</Text>
              </Pressable>
            </View>
            
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No encontramos productos con esos criterios.</Text>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {filteredProducts.map(product => {
                  const avg = product.reviews && product.reviews.length > 0 
                    ? (product.reviews.reduce((a, b) => a + b, 0) / product.reviews.length).toFixed(1) 
                    : '0.0';
                  return (
                    <Pressable key={product.id} style={styles.productCard} onPress={() => openProductDetail(product)}>
                      <Image source={{ uri: product.imagen }} style={styles.productImg} />
                      <Pressable style={styles.favBtnCard} onPress={(e) => { e.stopPropagation(); toggleFavorite(product); }}>
                        <Text>{favorites.some(f => f.id === product.id) ? '❤️' : '🤍'}</Text>
                      </Pressable>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>{product.nombre}</Text>
                        <Text style={styles.ratingCardText}>⭐ {avg} ({product.reviews ? product.reviews.length : 0})</Text>
                        <Text style={styles.stockInfoText}>Stock: {product.stock}</Text>
                        <View style={styles.productFooter}>
                          <Text style={styles.productPrice}>${product.precio.toLocaleString()}</Text>
                          <Pressable 
                            style={styles.addMiniBtn} 
                            onPress={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                          >
                            <Text style={styles.addMiniBtnText}>+</Text>
                          </Pressable>
                        </View>
                        <Pressable style={styles.editProductBtn} onPress={(e) => { e.stopPropagation(); startEditProduct(product); }}>
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

        {/* --- PANTALLA DE DETALLE DE PRODUCTO (CON RESEÑAS HU19) --- */}
        {currentScreen === 'detail' && selectedProduct && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Pressable style={styles.backBtn} onPress={() => navigateTo('home')}>
              <Text style={styles.backBtnText}>← Regresar</Text>
            </Pressable>

            <Image source={{ uri: selectedProduct.imagen }} style={styles.detailHeroImg} />
            
            <View style={styles.detailTitleRow}>
              <Text style={styles.detailTitle}>{selectedProduct.nombre}</Text>
              <Pressable onPress={() => toggleFavorite(selectedProduct)}>
                <Text style={{ fontSize: 24 }}>{favorites.some(f => f.id === selectedProduct.id) ? '❤️' : '🤍'}</Text>
              </Pressable>
            </View>

            <Text style={styles.detailPrice}>${selectedProduct.precio.toLocaleString()}</Text>
            
            {/* Promedio de Reseñas (CA03 HU19) */}
            {(() => {
              const reviewsList = selectedProduct.reviews || [];
              const avg = reviewsList.length > 0 
                ? (reviewsList.reduce((a, b) => a + b, 0) / reviewsList.length).toFixed(1) 
                : 'Sin valoraciones';
              return (
                <View style={styles.ratingOverviewBox}>
                  <Text style={styles.ratingOverviewText}>
                    ⭐ Promedio: {avg} / 5.0 ({reviewsList.length} valoraciones)
                  </Text>
                </View>
              );
            })()}

            <Text style={styles.detailDesc}>{selectedProduct.descripcion}</Text>

            {/* SECCIÓN HU19: Registrar nueva reseña */}
            <View style={styles.reviewBox}>
              <Text style={styles.specsTitle}>Califica este producto (1 al 5)</Text>
              <View style={styles.reviewInputRow}>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Ej. 5"
                  placeholderTextColor="#A3A0B8"
                  keyboardType="numeric"
                  maxLength={1}
                  value={reviewInput}
                  onChangeText={setReviewInput}
                />
                <Pressable style={styles.reviewBtn} onPress={() => handleAddReview(selectedProduct.id)}>
                  <Text style={styles.reviewBtnText}>Enviar Calificación</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.specsBox}>
              <Text style={styles.specsTitle}>Especificaciones Técnicas</Text>
              <View style={styles.specsRow}>
                <Text style={styles.specsLabel}>Categoría</Text>
                <Text style={styles.specsValue}>{selectedProduct.categoria}</Text>
              </View>
              <View style={styles.specsRow}>
                <Text style={styles.specsLabel}>Stock Disponible</Text>
                <Text style={styles.specsValue}>{selectedProduct.stock} unidades</Text>
              </View>
            </View>

            <Pressable style={[styles.editProductBtn, { marginBottom: 16, padding: 12 }]} onPress={() => startEditProduct(selectedProduct)}>
              <Text style={[styles.editProductBtnText, { textAlign: 'center', fontSize: 14 }]}>✏️ Editar este producto en Panel Vendedor</Text>
            </Pressable>

            {selectedProduct.stock === 0 ? (
              <View style={styles.outOfStockBox}>
                <Text style={styles.outOfStockText}>PRODUCTO AGOTADO</Text>
              </View>
            ) : (
              <>
                <View style={styles.quantityContainer}>
                  <Text style={styles.qtyLabel}>Cantidad:</Text>
                  <View style={styles.qtyControls}>
                    <Pressable style={styles.qtyBtn} onPress={() => setDetailQty(Math.max(1, detailQty - 1))}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{detailQty}</Text>
                    <Pressable style={styles.qtyBtn} onPress={() => setDetailQty(Math.min(selectedProduct.stock, detailQty + 1))}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                </View>

                <Pressable 
                  style={styles.primaryBtn} 
                  onPress={() => {
                    addToCart(selectedProduct, detailQty);
                    navigateTo('cart');
                  }}
                >
                  <Text style={styles.primaryBtnText}>Agregar al Carrito</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        )}

        {/* --- PANTALLA PANEL DE VENDEROR / ADMIN (HU18) --- */}
        {currentScreen === 'admin' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Pressable style={styles.backBtn} onPress={() => navigateTo('home')}>
              <Text style={styles.backBtnText}>← Regresar al Inicio</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>
              {editProductId === null ? '➕ Registrar Nuevo Producto' : '✏️ Editar Producto Existente'}
            </Text>
            <Text style={{ color: '#A3A0B8', fontSize: 12, marginBottom: 16 }}>
              {editProductId === null ? 'Complete el formulario para agregar un producto único al catálogo.' : `Modificando ID: ${editProductId} sin duplicar referencia.`}
            </Text>

            <View style={styles.formBox}>
              <Text style={styles.specsLabel}>Nombre del Producto *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. Cyber Neural Pad"
                placeholderTextColor="#A3A0B8"
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={styles.specsLabel}>Categoría *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 }}>
                {BRAND_INFO.categories.map((cat, idx) => (
                  <Pressable 
                    key={idx}
                    style={[styles.categoryChip, formCategory === cat && styles.categoryChipActive]}
                    onPress={() => setFormCategory(cat)}
                  >
                    <Text style={[styles.categoryChipText, formCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.specsLabel}>Precio en COP (Debe ser > 0) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. 199990"
                placeholderTextColor="#A3A0B8"
                keyboardType="numeric"
                value={formPrice}
                onChangeText={setFormPrice}
              />

              <Text style={styles.specsLabel}>Stock Disponible (>= 0) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. 10"
                placeholderTextColor="#A3A0B8"
                keyboardType="numeric"
                value={formStock}
                onChangeText={setFormStock}
              />

              <Text style={styles.specsLabel}>Descripción *</Text>
              <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Detalles del producto tecnológico..."
                placeholderTextColor="#A3A0B8"
                multiline
                value={formDesc}
                onChangeText={setFormDesc}
              />

              <Text style={styles.specsLabel}>URL de Imagen (Unsplash u otro) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor="#A3A0B8"
                value={formImage}
                onChangeText={setFormImage}
              />

              <Pressable style={[styles.primaryBtn, { marginTop: 10 }]} onPress={handleSaveProduct}>
                <Text style={styles.primaryBtnText}>
                  {editProductId === null ? 'Guardar Nuevo Producto' : 'Actualizar Producto'}
                </Text>
              </Pressable>

              <Pressable style={[styles.backBtn, { marginTop: 8, alignSelf: 'center' }]} onPress={() => navigateTo('catalog')}>
                <Text style={styles.backBtnText}>Cancelar</Text>
              </Pressable>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Catálogo Actual para Edición Rápida</Text>
            {products.map(p => (
              <View key={p.id} style={styles.adminRowCard}>
                <Image source={{ uri: p.imagen }} style={styles.adminRowImg} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>{p.nombre}</Text>
                  <Text style={{ color: '#9366F1', fontSize: 12 }}>${p.precio.toLocaleString()} | Stock: {p.stock}</Text>
                </View>
                <Pressable style={styles.adminEditMiniBtn} onPress={() => startEditProduct(p)}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Editar</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {/* --- PANTALLA DE FAVORITOS --- */}
        {currentScreen === 'favorites' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Tus Favoritos OMNIX</Text>
            {favorites.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tienes productos guardados en favoritos.</Text>
                <Pressable style={[styles.primaryBtn, { marginTop: 16 }]} onPress={() => navigateTo('catalog')}>
                  <Text style={styles.primaryBtnText}>Explorar Catálogo</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {favorites.map(product => (
                  <Pressable key={product.id} style={styles.productCard} onPress={() => openProductDetail(product)}>
                    <Image source={{ uri: product.imagen }} style={styles.productImg} />
                    <Pressable style={styles.favBtnCard} onPress={(e) => { e.stopPropagation(); toggleFavorite(product); }}>
                      <Text>❤️</Text>
                    </Pressable>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>{product.nombre}</Text>
                      <View style={styles.productFooter}>
                        <Text style={styles.productPrice}>${product.precio.toLocaleString()}</Text>
                        <Pressable 
                          style={styles.addMiniBtn} 
                          onPress={(e) => { e.stopPropagation(); addToCart(product, 1); }}
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

        {/* --- PANTALLA DE CARRITO Y CHECKOUT --- */}
        {currentScreen === 'cart' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Tu Carrito OMNIX</Text>
            
            {cart.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tu carrito OMNIX está vacío.</Text>
                <Pressable style={[styles.primaryBtn, { marginTop: 16 }]} onPress={() => navigateTo('catalog')}>
                  <Text style={styles.primaryBtnText}>Explorar Catálogo</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                {cart.map(item => (
                  <View key={item.id} style={styles.cartItem}>
                    <Image source={{ uri: item.imagen }} style={styles.cartItemImg} />
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemTitle}>{item.nombre}</Text>
                      <Text style={styles.cartItemPrice}>${(item.precio * item.qty).toLocaleString()}</Text>
                      <View style={styles.cartItemControls}>
                        <Pressable 
                          style={styles.cartQtyBtn} 
                          onPress={() => {
                            setCart(cart.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
                          }}
                        >
                          <Text style={styles.cartQtyBtnText}>-</Text>
                        </Pressable>
                        <Text style={styles.cartQtyValue}>{item.qty}</Text>
                        <Pressable 
                          style={styles.cartQtyBtn} 
                          onPress={() => {
                            const prod = products.find(p => p.id === item.id);
                            if (item.qty + 1 > prod.stock) {
                              alert(`Stock máximo alcanzado (${prod.stock} unidades).`);
                              return;
                            }
                            setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
                          }}
                        >
                          <Text style={styles.cartQtyBtnText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                    <Pressable 
                      onPress={() => setCart(cart.filter(i => i.id !== item.id))}
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
                    value={couponCode}
                    onChangeText={setCouponCode}
                  />
                  <Pressable style={styles.couponBtn} onPress={applyCoupon}>
                    <Text style={styles.couponBtnText}>Aplicar</Text>
                  </Pressable>
                </View>

                <View style={styles.formBox}>
                  <Text style={styles.specsTitle}>Datos de Entrega (Simulación)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nombre completo"
                    placeholderTextColor="#A3A0B8"
                    value={buyerName}
                    onChangeText={setBuyerName}
                  />
                  <TextInput
                    style={styles.formInput}
                    placeholder="Teléfono de contacto"
                    placeholderTextColor="#A3A0B8"
                    keyboardType="phone-pad"
                    value={buyerPhone}
                    onChangeText={setBuyerPhone}
                  />
                  <TextInput
                    style={styles.formInput}
                    placeholder="Municipio (ej. Mosquera, Funza, Madrid)"
                    placeholderTextColor="#A3A0B8"
                    value={buyerCity}
                    onChangeText={setBuyerCity}
                  />
                  <TextInput
                    style={styles.formInput}
                    placeholder="Dirección exacta"
                    placeholderTextColor="#A3A0B8"
                    value={buyerAddress}
                    onChangeText={setBuyerAddress}
                  />
                </View>

                {(() => {
                  const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.qty), 0);
                  const discount = discountActive ? subtotal * 0.10 : 0;
                  const subtotalWithDiscount = subtotal - discount;
                  const shipping = subtotalWithDiscount >= 150000 ? 0 : 8000;
                  const total = subtotalWithDiscount + shipping;

                  return (
                    <View style={styles.summaryBox}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${subtotal.toLocaleString()}</Text>
                      </View>
                      {discountActive && (
                        <View style={styles.summaryRow}>
                          <Text style={[styles.summaryLabel, { color: '#4ade80' }]}>Descuento (10%)</Text>
                          <Text style={[styles.summaryValue, { color: '#4ade80' }]}>-${discount.toLocaleString()}</Text>
                        </View>
                      )}
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Envío Quantum Secure</Text>
                        <Text style={styles.summaryValue}>{shipping === 0 ? 'Gratis' : '$8.000'}</Text>
                      </View>
                      <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                        <Text style={styles.summaryTotalLabel}>Total Estimado</Text>
                        <Text style={styles.summaryTotalValue}>${total.toLocaleString()}</Text>
                      </View>
                      
                      <Pressable style={styles.primaryBtn} onPress={confirmCheckout}>
                        <Text style={styles.primaryBtnText}>Confirmar Compra Simulada</Text>
                      </Pressable>
                    </View>
                  );
                })()}
              </View>
            )}
          </ScrollView>
        )}

        {/* --- PANTALLA DE ÉXITO DE COMPRA --- */}
        {currentScreen === 'success' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.successContainer}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🎉</Text>
              <Text style={styles.successTitle}>¡Pedido Registrado con Éxito!</Text>
              <Text style={styles.successCode}>Código de pedido: {lastOrderCode}</Text>
              <Text style={styles.successDesc}>
                Tu compra ha sido registrada en el prototipo de manera exitosa. Recuerda que este ejercicio es puramente académico y no genera cobros reales.
              </Text>
              <Pressable style={[styles.primaryBtn, { width: '100%', marginTop: 20 }]} onPress={() => navigateTo('history')}>
                <Text style={styles.primaryBtnText}>Ver Historial de Pedidos</Text>
              </Pressable>
              <Pressable style={[styles.backBtn, { marginTop: 10, alignSelf: 'center' }]} onPress={() => navigateTo('home')}>
                <Text style={styles.backBtnText}>Volver al Inicio</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* --- PANTALLA DE HISTORIAL DE PEDIDOS --- */}
        {currentScreen === 'history' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Historial de Pedidos</Text>
            {history.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay pedidos registrados en la sesión actual.</Text>
                <Pressable style={[styles.primaryBtn, { marginTop: 16 }]} onPress={() => navigateTo('catalog')}>
                  <Text style={styles.primaryBtnText}>Ir al Catálogo</Text>
                </Pressable>
              </View>
            ) : (
              history.map((order, idx) => (
                <View key={idx} style={styles.historyCard}>
                  <View style={styles.historyHeaderRow}>
                    <Text style={styles.historyCode}>{order.code}</Text>
                    <Text style={styles.historyDate}>{order.date}</Text>
                  </View>
                  <Text style={styles.historyBuyer}>Comprador: {order.buyer.name} ({order.buyer.city})</Text>
                  <View style={styles.historyItemsList}>
                    {order.items.map((it, i) => (
                      <Text key={i} style={styles.historyItemText}>• {it.nombre} (x{it.qty}) - ${(it.precio * it.qty).toLocaleString()}</Text>
                    ))}
                  </View>
                  <View style={styles.historyFooterRow}>
                    <Text style={styles.historyTotalLabel}>Total Pagado:</Text>
                    <Text style={styles.historyTotalValue}>${order.total.toLocaleString()}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

      </View>

      {/* 3. BARRA DE NAVEGACIÓN INFERIOR (BOTTOM DOCK) */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => navigateTo('home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Inicio</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => navigateTo('catalog')}>
          <Text style={styles.navIcon}>📦</Text>
          <Text style={styles.navText}>Catálogo</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => navigateTo('favorites')}>
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navText}>Favoritos</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => navigateTo('cart')}>
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navText}>Carrito</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => navigateTo('history')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Historial</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

// ================= ESTILOS (StyleSheet) =================
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0b0a12',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
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
    marginTop: 10 
  },
  logoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 8,
  },
  logoImg: { 
    width: 90, 
    height: 28, 
    resizeMode: 'contain' 
  },
  headerOwnerText: {
    color: '#A3A0B8',
    fontSize: 11,
    fontWeight: '500',
  },
  headerIcons: { flexDirection: 'row', gap: 10 },
  cartIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(147, 102, 241, 0.15)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cartIconText: { fontSize: 15 },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#9366F1', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  contentContainer: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  searchBox: { marginBottom: 16 },
  searchInput: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: '#ffffff', fontSize: 14 },
  sellerPanelBtn: { backgroundColor: 'rgba(147, 102, 241, 0.2)', borderWidth: 1, borderColor: '#9366F1', borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
  sellerPanelBtnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  adminMiniBtn: { backgroundColor: '#9366F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  adminMiniBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  editProductBtn: { marginTop: 8, backgroundColor: 'rgba(147, 102, 241, 0.15)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.4)', borderRadius: 8, paddingVertical: 6, alignItems: 'center' },
  editProductBtnText: { color: '#9366F1', fontSize: 11, fontWeight: 'bold' },
  adminRowCard: { flexDirection: 'row', backgroundColor: 'rgba(23, 21, 37, 0.8)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.3)', borderRadius: 12, padding: 10, alignItems: 'center', marginBottom: 8 },
  adminRowImg: { width: 40, height: 40, borderRadius: 8, resizeMode: 'cover' },
  adminEditMiniBtn: { backgroundColor: '#9366F1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 12 },
  seeAllText: { color: '#9366F1', fontSize: 13, fontWeight: '600' },
  categoriesScroll: { marginBottom: 20 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(147, 102, 241, 0.08)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 20, marginRight: 10 },
  categoryChipActive: { backgroundColor: '#9366F1' },
  categoryChipText: { color: '#A3A0B8', fontSize: 13, fontWeight: '500' },
  categoryChipTextActive: { color: '#ffffff' },
  sortContainer: { marginBottom: 16, backgroundColor: 'rgba(147, 102, 241, 0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)' },
  sortLabel: { color: '#A3A0B8', fontSize: 13, marginBottom: 8 },
  sortBtnsRow: { flexDirection: 'row', gap: 10 },
  sortBtn: { flex: 1, paddingVertical: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.2)' },
  sortBtnActive: { backgroundColor: '#9366F1' },
  sortBtnText: { color: '#A3A0B8', fontSize: 12, fontWeight: '600' },
  sortBtnTextActive: { color: '#ffffff' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 },
  productCard: { width: '48%', backgroundColor: 'rgba(23, 21, 37, 0.9)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 18, overflow: 'hidden', marginBottom: 10, position: 'relative' },
  productImg: { width: '100%', height: 120, resizeMode: 'cover' },
  favBtnCard: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: 12 },
  productName: { color: '#ffffff', fontSize: 13, fontWeight: '600', height: 36, marginBottom: 4 },
  ratingCardText: { color: '#facc15', fontSize: 11, marginBottom: 4, fontWeight: '600' },
  stockInfoText: { color: '#A3A0B8', fontSize: 11, marginBottom: 6 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { color: '#9366F1', fontSize: 14, fontWeight: 'bold' },
  addMiniBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(147, 102, 241, 0.2)', borderWidth: 1, borderColor: '#9366F1', justifyContent: 'center', alignItems: 'center' },
  addMiniBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  backBtn: { marginBottom: 16, alignSelf: 'flex-start', backgroundColor: 'rgba(23, 21, 37, 0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)' },
  backBtnText: { color: '#ffffff', fontSize: 13 },
  detailHeroImg: { width: '100%', height: 240, borderRadius: 16, marginBottom: 16, resizeMode: 'cover' },
  detailTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', flex: 1 },
  detailPrice: { color: '#9366F1', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  ratingOverviewBox: { backgroundColor: 'rgba(250, 204, 21, 0.1)', borderWidth: 1, borderColor: '#facc15', padding: 10, borderRadius: 10, marginBottom: 12 },
  ratingOverviewText: { color: '#facc15', fontSize: 14, fontWeight: 'bold' },
  detailDesc: { color: '#A3A0B8', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  reviewBox: { backgroundColor: 'rgba(147, 102, 241, 0.05)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 12, padding: 14, marginBottom: 20 },
  reviewInputRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  reviewInput: { width: 60, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 10, paddingHorizontal: 12, color: '#ffffff', fontSize: 15, textAlign: 'center' },
  reviewBtn: { flex: 1, backgroundColor: '#9366F1', borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  reviewBtnText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  specsBox: { backgroundColor: 'rgba(147, 102, 241, 0.05)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 12, padding: 14, marginBottom: 20 },
  specsTitle: { color: '#9366F1', fontSize: 13, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  specsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
  specsLabel: { color: '#A3A0B8', fontSize: 13 },
  specsValue: { color: '#ffffff', fontSize: 13, fontWeight: '500' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  qtyLabel: { color: '#A3A0B8', fontSize: 14 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 10, overflow: 'hidden' },
  qtyBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  qtyValue: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', paddingHorizontal: 14 },
  primaryBtn: { backgroundColor: '#9366F1', paddingVertical: 14, borderRadius: 14, alignItems: 'center', shadowColor: '#9366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  primaryBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 40, gap: 10 },
  emptyText: { color: '#A3A0B8', fontSize: 14, textAlign: 'center' },
  outOfStockBox: { backgroundColor: 'rgba(255, 92, 92, 0.1)', borderWidth: 1, borderColor: '#ff5c5c', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  outOfStockText: { color: '#ff5c5c', fontWeight: 'bold', fontSize: 14 },
  cartItem: { flexDirection: 'row', backgroundColor: 'rgba(23, 21, 37, 0.8)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 14, padding: 12, alignItems: 'center', marginBottom: 12 },
  cartItemImg: { width: 60, height: 60, borderRadius: 10, resizeMode: 'cover' },
  cartItemInfo: { flex: 1, marginLeft: 12 },
  cartItemTitle: { color: '#ffffff', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  cartItemPrice: { color: '#9366F1', fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  cartItemControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cartQtyBtn: { width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  cartQtyBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  cartQtyValue: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  deleteItemBtn: { padding: 8 },
  deleteItemText: { color: '#ff5c5c', fontSize: 20, fontWeight: 'bold' },
  couponBox: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  couponInput: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 12, paddingHorizontal: 14, color: '#ffffff', fontSize: 13 },
  couponBtn: { backgroundColor: 'rgba(147, 102, 241, 0.3)', borderWidth: 1, borderColor: '#9366F1', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  couponBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  formBox: { backgroundColor: 'rgba(147, 102, 241, 0.05)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 14, padding: 14, marginBottom: 16, gap: 10 },
  formInput: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.3)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#ffffff', fontSize: 13 },
  summaryBox: { backgroundColor: 'rgba(147, 102, 241, 0.05)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 14, padding: 16, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#A3A0B8', fontSize: 14 },
  summaryValue: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  summaryTotalRow: { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)', paddingTop: 10, marginTop: 4, marginBottom: 16 },
  summaryTotalLabel: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  summaryTotalValue: { color: '#9366F1', fontSize: 16, fontWeight: 'bold' },
  successContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 10 },
  successTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  successCode: { color: '#9366F1', fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  successDesc: { color: '#A3A0B8', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  historyCard: { backgroundColor: 'rgba(23, 21, 37, 0.9)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 14, padding: 14, marginBottom: 14 },
  historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  historyCode: { color: '#9366F1', fontSize: 14, fontWeight: 'bold' },
  historyDate: { color: '#A3A0B8', fontSize: 11 },
  historyBuyer: { color: '#ffffff', fontSize: 13, marginBottom: 8, fontWeight: '500' },
  historyItemsList: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingVertical: 8, marginBottom: 8, gap: 4 },
  historyItemText: { color: '#A3A0B8', fontSize: 12 },
  historyFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTotalLabel: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  historyTotalValue: { color: '#9366F1', fontSize: 15, fontWeight: 'bold' },
  bottomNav: { position: 'absolute', bottom: 16, left: 16, right: 16, height: 64, backgroundColor: 'rgba(23, 21, 37, 0.95)', borderWidth: 1, borderColor: 'rgba(147, 102, 241, 0.35)', borderRadius: 20, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 18, marginBottom: 2 },
  navText: { color: '#A3A0B8', fontSize: 10, fontWeight: '500' }
});