(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const supabaseUrl = 'https://kvhvvfsdztamglnkhbsa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aHZ2ZnNkenRhbWdsbmtoYnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMzk5MjYsImV4cCI6MjA2NjkxNTkyNn0.4SyQx5sHLymx-_r_KEqqH4S5-xxxBlXtU-YS9hsolnk';

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function insertProducts() {
    const { data, error } = await supabase.from('products').insert([
      { id: 'longaniza', title: 'Longanizas Artesanales Oma Wurst', category: 'Embutidos', description: 'Nuestras longanizas son elaboradas siguiendo una receta familiar alemana transmitida de generación en generación. Utilizamos solo carne de cerdo de primera calidad y una mezcla secreta de especias naturales, ahumadas lentamente para lograr ese sabor profundo y característico que tanto gusta. Perfectas para la parrilla, el sartén o como acompañamiento en tus platos favoritos. ¡Un verdadero deleite para el paladar!', images: ['assets/productos/longaniza/longaniza_oma.jpg', 'assets/productos/longaniza/longaniza_oma2.jpg', 'assets/productos/longaniza/longaniza_oma3.jpg', 'assets/productos/longaniza/longaniza_oma4.jpg'], price: 10.99 },
      { id: 'salchichas', title: 'Salchichas Artesanales Oma Wurst', category: 'Embutidos', description: 'Nuestras salchichas artesanales son un clásico irresistible. Elaboradas con carne seleccionada y una mezcla de especias que resalta su sabor auténtico, son perfectas para la parrilla, cocidas o como parte de tus recetas favoritas. Su textura jugosa y su sabor inconfundible las convierten en la elección ideal para toda la familia. ¡Pruébalas y siente la tradición en cada mordisco!', images: ['assets/productos/salchichas/salchichas_oma.jpg', 'assets/productos/salchichas/salchichas_detalle_1.jpg', 'assets/productos/salchichas/salchichas_detalle_2.jpg', 'assets/productos/salchichas/salchichas_detalle_3.jpg'], price: 8.99 },
      { id: 'prietas', title: 'Prietas Tradicionales Oma Wurst', category: 'Embutidos', description: 'Nuestras prietas son una auténtica delicia, elaboradas con la receta tradicional que combina sangre de cerdo, cebolla, especias y otros ingredientes secretos que les dan un sabor único e intenso. Cocinadas a la perfección, ofrecen una textura suave y un gusto que evoca las preparaciones caseras de antaño. Ideales para acompañar con papas cocidas o puré, son un plato contundente y lleno de sabor.', images: ['assets/productos/prietas/Prietas-Oma.jpg', 'assets/productos/prietas/prietas_detalle_1.jpg', 'assets/productos/prietas/prietas_detalle_2.jpg', 'assets/productos/prietas/prietas_detalle_3.jpg'], price: 7.99 },
      { id: 'anticuchos', title: 'Anticuchos para la parrilla Oma Wurst', category: 'Parrilleros', description: 'El Anticucho Oma Wurst es una deliciosa opción para tus asados. Preparado con carne de res marinada en una mezcla especial de especias y ají, estos brochetas son ideales para la parrilla. Vienen listos para cocinar y disfrutar, aportando un sabor auténtico y jugoso que hará que tus reuniones sean inolvidables.', images: ['assets/productos/anticuchos/anticucho_01.jpg', 'assets/productos/anticuchos/anticucho_02.jpg'], price: 12.99 },
      { id: 'chorizo', title: 'Chorizo Parrillero Oma Wurst', category: 'Parrilleros', description: 'Nuestro chorizo parrillero está hecho con la mejor selección de carne de cerdo y una mezcla de especias que le otorgan un sabor inigualable. Es el complemento perfecto para tus asados, garantizando un resultado jugoso y lleno de sabor que encantará a todos tus invitados.', images: ['assets/productos/chorizo/chorizo_parrillero.jpg', 'assets/productos/chorizo/chorizo_detalle_1.jpg', 'assets/productos/chorizo/chorizo_detalle_2.jpg'], price: 9.99 },
      { id: 'queso-cerdo', title: 'Queso de Cerdo Oma Wurst', category: 'Especialidades', description: 'El queso de cerdo es un embutido cocido tradicional, elaborado a partir de la cabeza del cerdo y otras carnes, todo finamente picado y prensado. Condimentado con especias seleccionadas, es un fiambre de sabor intenso y textura única, ideal para aperitivos o para darle un toque especial a tus sándwiches.', images: ['assets/productos/quesodecerdo/quesocerdo_01.jpg', 'assets/productos/quesodecerdo/quesocerdo_02.jpg', 'assets/productos/queso-cerdo/queso_cerdo_detalle_2.jpg'], price: 11.99 },
      { id: 'arrollado', title: 'Arrollado de Lomo Oma Wurst', category: 'Especialidades', description: 'El arrollado de Lomo es una joya de la cocina chilena. Preparamos el nuestro con pulpa de cerdo, tocino y cuero, todo marinado en una mezcla de ají y especias, y luego cocido lentamente. El resultado es una carne tierna y sabrosa, perfecta para servir en sándwiches o como plato principal.', images: ['assets/productos/arrollado/arrollado_lomo1.jpg', 'assets/productos/arrollado/arrollado_lomo2.jpg', 'assets/productos/arrollado/arrollado_lomo3.jpg'], price: 13.99 },
      { id: 'pateteewurst', title: 'Paté Teewurst para Untar', category: 'Especialidades', description: 'El Teewurst es un paté de origen alemán, un embutido crudo para untar elaborado con carne de cerdo y tocino. Suave, cremoso y con un delicado sabor ahumado, es perfecto para disfrutar en tostadas o pan fresco como aperitivo o en el desayuno. Una delicia tradicional que no te puedes perder.', images: ['assets/productos/pateteewurst/pateteewurst_01.jpg', 'assets/productos/pateteewurst/pateteewurst_02.jpg', 'assets/productos/pateteewurst/pateteewurst_03.jpg'], price: 6.99 },
      { id: 'cazuela', title: 'Cazuela ahumada Oma Wurst', category: 'Especialidades', description: 'Para que tus preparaciones sean fáciles y queden como la de la abuela, te ofrecemos nuestra base especial. Incluye una selección de los mejores cortes de carne y huesos, como osobuco o tapapecho, perfectos para dar un caldo sustancioso y lleno de sabor. Solo agrega las verduras y disfruta de un plato reconfortante.', images: ['assets/productos/cazuela/cazuela_ahumada01.jpg', 'assets/productos/cazuela/cazuela_ahumada02.jpg', 'assets/productos/cazuela/cazuela_detalle_2.jpg'], price: 14.99 },
    ]);
  
    if (error) {
      console.error('Error inserting products:', error);
    } else {
      console.log('Products inserted:', data);
    }
  }
},{}],2:[function(require,module,exports){
document.addEventListener('DOMContentLoaded', () => {
    // --- Insert products into Supabase (only once) ---
    if (!localStorage.getItem('products_inserted')) {
        insertProducts();
        localStorage.setItem('products_inserted', 'true');
    }
    // --- Control de Sonido para el Video del Hero ---
    const video = document.getElementById('hero-background-video');
    const soundToggle = document.getElementById('video-sound-toggle');

    if (video && soundToggle) {
        const soundIcon = soundToggle.querySelector('i');

        soundToggle.addEventListener('click', () => {
            video.muted = !video.muted;
            if (video.muted) {
                soundIcon.classList.remove('fa-volume-high');
                soundIcon.classList.add('fa-volume-xmark');
                soundToggle.setAttribute('aria-label', 'Activar sonido');
            } else {
                soundIcon.classList.remove('fa-volume-xmark');
                soundIcon.classList.add('fa-volume-high');
                soundToggle.setAttribute('aria-aria-label', 'Desactivar sonido');
            }
        });
    }

    // Funcionalidad del menú de navegación responsive
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            navToggle.classList.toggle('nav-open');
            // Actualizar aria-expanded
            const isExpanded = navMenu.classList.contains('show');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // --- Funcionalidad del Modal de Producto ---
    const productModal = document.getElementById('product-modal');
    const modalCloseBtn = productModal.querySelector('.modal-close-btn');
    const modalProductTitle = document.getElementById('modal-product-title');
    const modalSwiperWrapper = document.getElementById('modal-swiper-wrapper');
    const modalProductDescription = document.getElementById('modal-product-description');
    
    let productDataStore = {};
    let productKeys = [];

    let modalSwiper = null;

    function openProductModal(productData) {
        modalProductTitle.textContent = productData.title;
        modalProductDescription.textContent = productData.description;

        modalSwiperWrapper.innerHTML = ''; // Limpiar slides anteriores
        productData.images.forEach(imgSrc => {
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = productData.title;
            slide.appendChild(img);
            modalSwiperWrapper.appendChild(slide);
        });

        productModal.style.display = 'flex';

        if (modalSwiper) {
            modalSwiper.destroy(true, true);
        }
        modalSwiper = new Swiper('.modal-image-slider', {
            loop: productData.images.length > 1, // Loop solo si hay más de una imagen
            pagination: { el: '.modal-swiper-pagination', clickable: true },
            navigation: { nextEl: '.modal-swiper-button-next', prevEl: '.modal-swiper-button-prev' },
        });
        // Forzar actualización para asegurar que se renderice bien en el modal recién mostrado
        setTimeout(() => modalSwiper.update(), 0); 
    }

    function closeProductModal() {
        productModal.style.display = 'none';
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async function addToCart(productId) {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = generateUUID();
            localStorage.setItem('user_id', userId);
        }

        const { data, error } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) {
            console.error('Error checking cart:', error);
            return;
        }

        if (data.length > 0) {
            // Product already in cart, update quantity
            const newQuantity = data[0].quantity + 1;
            const { error } = await supabase
                .from('cart')
                .update({ quantity: newQuantity })
                .eq('id', data[0].id);
            if (error) {
                console.error('Error updating cart:', error);
            }
        } else {
            // Product not in cart, insert new row
            const { error } = await supabase
                .from('cart')
                .insert([{ product_id: productId, quantity: 1, user_id: userId }]);
            if (error) {
                console.error('Error inserting into cart:', error);
            }
        }
        updateCartBadge();
    }

    async function removeFromCart(itemId) {
        const { error } = await supabase
            .from('cart')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Error removing from cart:', error);
        }

        displayCartItems();
        updateCartBadge();
    }

    // --- LÓGICA DE PRODUCTOS, FILTROS Y PAGINACIÓN (REFACTORIZADO) ---
    const productsPerPage = 6; // Puedes cambiar este número (ej. 3, 6, 9)

    // Referencias a los elementos del DOM
    const productGrid = document.getElementById('products-grid');
    const productFiltersContainer = document.getElementById('product-filters');
    const paginationControls = document.getElementById('pagination-controls');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResultsMessage = document.getElementById('no-results');

    // Flag para evitar el scroll en la carga inicial de la página.
    let isInitialProductLoad = true;

    // Función para mostrar/ocultar el indicador de carga
    function showLoading(isLoading) {
        if (loadingIndicator) loadingIndicator.style.display = isLoading ? 'flex' : 'none';
        if (productGrid) productGrid.style.display = isLoading ? 'none' : 'grid';
        if (noResultsMessage) noResultsMessage.style.display = 'none'; // Siempre ocultar al cargar
    }

    // Función para mostrar/ocultar el mensaje de "no hay resultados"
    function showNoResults(show) {
        if (noResultsMessage) noResultsMessage.style.display = show ? 'block' : 'none';
        if (productGrid) productGrid.style.display = show ? 'none' : 'grid';
        if (show) productGrid.style.display = 'none';
    }

    async function loadProducts() {
        const { data, error } = await supabase.from('products').select('*');
        if (error) {
            console.error('Error fetching products:', error);
            return;
        }

        productDataStore = data.reduce((acc, product) => {
            acc[product.id] = product;
            return acc;
        }, {});

        productKeys = Object.keys(productDataStore);

        createFilterButtons();
        displayProducts('Todos', 1);
    }

    // Función para crear y renderizar los botones de filtro
    function createFilterButtons() {
        if (!productFiltersContainer) return;

        const categories = ['Todos', ...new Set(productKeys.map(key => productDataStore[key].category))];

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.textContent = category;
            button.dataset.category = category.toLowerCase();
            if (category === 'Todos') {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                displayProducts(category, 1);
            });
            productFiltersContainer.appendChild(button);
        });
    }

    // Función principal para mostrar productos
    function displayProducts(filter = 'Todos', page = 1) {
        // Si no es la carga inicial, desplaza suavemente la vista al inicio de la sección de productos.
        // Esto reemplaza el salto brusco con un movimiento controlado y mejora la experiencia de usuario.
        if (!isInitialProductLoad) {
            document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        showLoading(true);

        // Simular una pequeña demora para que el spinner sea visible
        setTimeout(() => {
            // 1. Filtrar productos
            const filteredKeys = filter === 'Todos'
                ? productKeys
                : productKeys.filter(key => productDataStore[key].category === filter);

            showLoading(false);

            if (filteredKeys.length === 0) {
                showNoResults(true);
                paginationControls.innerHTML = ''; // Limpiar paginación si no hay resultados
                return;
            }

            showNoResults(false);

            // 2. Lógica de paginación
            const totalPages = Math.ceil(filteredKeys.length / productsPerPage);
            const start = (page - 1) * productsPerPage;
            const end = start + productsPerPage;
            const productsToShow = filteredKeys.slice(start, end);

            // 3. Renderizar tarjetas de producto
            productGrid.innerHTML = '';
            productsToShow.forEach(productId => {
                const productData = productDataStore[productId];
                const card = document.createElement('article');
                card.className = 'product-card';
                card.dataset.productId = productId;
                const cardTitle = productData.title.replace(' Oma Wurst', '').replace(' para Untar', '').replace(' para la parrilla', '');
                // Estructura HTML rediseñada para la tarjeta de producto
                card.innerHTML = `
                    <img class="product-card-img" src="${productData.images[0]}" alt="${productData.title}">
                    <div class="product-card-overlay"></div>
                    <div class="product-card-content">
                        <h3 class="product-card-title">${cardTitle}</h3>
                        <p class="product-card-description">${productData.description.substring(0, 80)}...</p>
                        <span class="product-card-cta">Ver más detalles</span>
                        <button class="add-to-cart-btn">Agregar al carrito</button>
                    </div>
                `;
                card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    addToCart(productData.id);
                });
                card.addEventListener('click', () => openProductModal(productData));
                productGrid.appendChild(card);
            });

            // 4. Renderizar controles de paginación
            renderPagination(totalPages, page, filter);

            // Después de la primera carga, actualizamos el flag para que las siguientes interacciones sí hagan scroll.
            isInitialProductLoad = false;

        }, 300); // Coincide con la transición de opacidad
    }

    // Función para renderizar los controles de paginación
    function renderPagination(totalPages, currentPage, currentFilter) {
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return; // No mostrar paginación si solo hay una página

        // Botón "Anterior"
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.className = 'page-btn';
            prevButton.innerHTML = '&laquo;'; // «
            prevButton.addEventListener('click', () => displayProducts(currentFilter, currentPage - 1));
            paginationControls.appendChild(prevButton);
        }

        // Botones de página
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'page-btn';
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            } else {
                pageButton.addEventListener('click', () => displayProducts(currentFilter, i));
            }
            paginationControls.appendChild(pageButton);
        }

        // Botón "Siguiente"
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.className = 'page-btn';
            nextButton.innerHTML = '&raquo;'; // »
            nextButton.addEventListener('click', () => displayProducts(currentFilter, currentPage + 1));
            paginationControls.appendChild(nextButton);
        }
    }

    async function displayCartItems() {
        let userId = localStorage.getItem('user_id');
        if (!userId) return;

        const { data, error } = await supabase
            .from('cart')
            .select('*, products(*)')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching cart items:', error);
            return;
        }

        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (data.length === 0) {
            cartItemsContainer.innerHTML = '<p>No hay productos en el carrito.</p>';
            document.getElementById('cart-total').textContent = '$0.00';
        } else {
            data.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.products.images[0]}" alt="${item.products.title}">
                    <div class="cart-item-details">
                        <p>${item.products.title}</p>
                        <p>Cantidad: ${item.quantity}</p>
                        <p>Precio: $${item.products.price}</p>
                    </div>
                    <button class="remove-from-cart-btn" data-id="${item.id}">Eliminar</button>
                `;
                cartItem.querySelector('.remove-from-cart-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeFromCart(item.id);
                });
                cartItemsContainer.appendChild(cartItem);
                total += item.products.price * item.quantity;
            });
        }

        document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
    }

    async function updateCartBadge() {
        let userId = localStorage.getItem('user_id');
        if (!userId) return;

        const { data, error } = await supabase
            .from('cart')
            .select('quantity')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching cart count:', error);
            return;
        }

        const cartBadge = document.querySelector('.cart-badge');
        const totalItems = data.reduce((acc, item) => acc + item.quantity, 0);
        cartBadge.textContent = totalItems;
    }

    // --- INICIALIZACIÓN ---
    loadProducts();
    updateCartBadge();

    const cartModal = document.getElementById('cart-modal');
    const cartCloseBtn = cartModal.querySelector('.modal-close-btn');
    const cartIcon = document.querySelector('.cart-icon-container');

    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'flex';
        displayCartItems();
    });

    cartCloseBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Event Listeners para cerrar el modal
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
    window.addEventListener('click', (event) => { 
        if (event.target === productModal) closeProductModal(); 
        if (event.target === cartModal) cartModal.style.display = 'none';
    });
    window.addEventListener('keydown', (event) => { 
        if (event.key === 'Escape' && productModal.style.display !== 'none') closeProductModal(); 
        if (event.key === 'Escape' && cartModal.style.display !== 'none') cartModal.style.display = 'none';
    });
    
    // --- Script para activar la animación de fondo al hacer scroll ---
    // Seleccionamos todas las secciones que queremos animar
    const animatedSections = document.querySelectorAll('#quienes-somos, #products, #location, #contact');

    if (animatedSections.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Si la sección entra en la vista, añadimos la clase.
                // Si sale, la quitamos. Esto permite que la animación se revierta.
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, {
            threshold: 0.1 // Se activa cuando el 10% de la sección es visible para mejorar la visibilidad
        });
        animatedSections.forEach(section => observer.observe(section));
    }

    // --- Script para activar la animación de los divisores con logo ---
    const sectionDividers = document.querySelectorAll('.section-divider');
    if (sectionDividers.length > 0) {
        const dividerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    // Permite que la animación se revierta al hacer scroll hacia arriba
                    entry.target.classList.remove('in-view'); 
                }
            });
        }, {
            threshold: 0.5 // La animación se activa cuando el 50% del divisor es visible
        });
        sectionDividers.forEach(divider => dividerObserver.observe(divider));
    }
    });
},{}]},{},[1,2]);
