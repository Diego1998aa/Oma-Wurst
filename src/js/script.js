import { supabase } from './database.js';
import Swiper from 'swiper/bundle';

function onDomReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
        callback();
    }
}

onDomReady(() => {
    // Constantes globales para animaciones
    const FADE_THRESHOLD = 0.3; // 30%
    const FADE_BASE_DELAY = 200; // ms
    const FADE_STAGGER = 120; // ms por tarjeta
    const FADE_DURATION = 1200; // ms
    const FADE_EASING = 'ease-out';
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
                soundToggle.setAttribute('aria-label', 'Desactivar sonido');
            }
        });
    }

    // --- Funcionalidad del menú de navegación responsive ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav .nav-link');
    const navIndicator = document.querySelector('.nav-indicator');
    const headerEl = document.querySelector('.header');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            navToggle.classList.toggle('nav-open');
            const isExpanded = navMenu.classList.contains('show');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    function moveNavIndicator(target) {
        if (!navIndicator || !target) return;
        const navRect = navMenu.getBoundingClientRect();
        const rect = target.getBoundingClientRect();
        const left = rect.left - navRect.left;
        navIndicator.style.left = `${left}px`;
        navIndicator.style.width = `${rect.width}px`;
    }

    function setActiveNavByHash(hash) {
        navLinks.forEach(l => l.classList.remove('active'));
        const current = Array.from(navLinks).find(l => l.getAttribute('href') === hash);
        if (current) {
            current.classList.add('active');
            moveNavIndicator(current);
        }
    }

    // Hover indicator
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => moveNavIndicator(link));
        link.addEventListener('focus', () => moveNavIndicator(link));
        link.addEventListener('mouseleave', () => {
            const active = document.querySelector('.nav .nav-link.active');
            moveNavIndicator(active || link);
        });
    });

    // --- Funcionalidad del Modal de Producto ---
    const productModal = document.getElementById('product-modal');
    const modalCloseBtn = productModal ? productModal.querySelector('.modal-close-btn') : null;
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeProductModal);
    }
    const modalProductTitle = document.getElementById('modal-product-title');
    const modalSwiperWrapper = document.getElementById('modal-swiper-wrapper');
    const modalProductDescription = document.getElementById('modal-product-description');
    
    let productDataStore = {};
    let productKeys = [];
    let modalSwiper = null;
    let isBusinessUser = false;
    let businessUserId = null;
    let activeFilter = 'Todos';
    let activePage = 1;
    const BUSINESS_LOGIN_URL = 'client-login.html';
    document.body.classList.add('reservation-locked');

    function openProductModal(productData) {
        if (!productModal || !modalSwiperWrapper || !modalProductTitle || !modalProductDescription) return;
        const safeTitle = productData.title || 'Producto Oma Wurst';
        const safeDescription = productData.description || 'Muy pronto compartiremos más detalles sobre este producto.';
        const images = (productData.images && productData.images.length > 0) ? productData.images : ['/assets/logo-oma-final.png'];

        modalProductTitle.textContent = safeTitle;
        modalProductDescription.textContent = safeDescription;

        modalSwiperWrapper.innerHTML = '';
        images.forEach(imgSrc => {
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = safeTitle;
            img.loading = 'lazy';
            slide.appendChild(img);
            modalSwiperWrapper.appendChild(slide);
        });

        productModal.style.display = 'flex';

        if (modalSwiper) {
            modalSwiper.destroy(true, true);
        }
        modalSwiper = new Swiper('.modal-image-slider', {
            loop: images.length > 1,
            pagination: { el: '.modal-swiper-pagination', clickable: true },
            navigation: { nextEl: '.modal-swiper-button-next', prevEl: '.modal-swiper-button-prev' },
        });
        setTimeout(() => modalSwiper.update(), 0); 
    }

    function closeProductModal() {
        productModal.style.display = 'none';
    }

    function redirectToBusinessLogin() {
        window.location.href = BUSINESS_LOGIN_URL;
    }

    async function fetchUserRole(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
            if (!error && data?.role) return data.role;
        } catch (_) {}
        return null;
    }

    async function isBusinessFromSession(session) {
        const user = session?.user;
        if (!user) return false;
        const dbRole = await fetchUserRole(user.id);
        if (dbRole) return ['business', 'owner', 'admin'].includes(dbRole);
        const meta = user.user_metadata || {};
        const appMeta = user.app_metadata || {};
        const roles = appMeta.roles || appMeta.role || [];
        const hasBusinessFields = Boolean(meta.company_name || meta.tax_id || meta.is_business || meta.isBusiness);
        const hasBusinessRole = Array.isArray(roles)
            ? (roles.includes('business') || roles.includes('comercio') || roles.includes('owner') || roles.includes('admin'))
            : (roles === 'business' || roles === 'comercio' || roles === 'owner' || roles === 'admin');
        return hasBusinessFields || hasBusinessRole;
    }

    async function handleBusinessSession(session) {
        isBusinessUser = await isBusinessFromSession(session);
        businessUserId = isBusinessUser ? (session?.user?.id || null) : null;
        document.body.classList.toggle('business-mode', isBusinessUser);
        document.body.classList.toggle('reservation-locked', !isBusinessUser);
        // Muestra/oculta el botón del carrito según si hay sesión de negocio
        if (cartToggle) {
            cartToggle.hidden = !isBusinessUser;
        }
        if (!isBusinessUser) {
            closeCart();
        }
        if (productKeys.length > 0) {
            displayProducts(activeFilter, activePage);
        }
        updateCartBadge();
    }

    async function checkBusinessAccess() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            await handleBusinessSession(data?.session ?? null);
        } catch (sessionError) {
            console.error('Error verificando sesión de negocios:', sessionError);
            await handleBusinessSession(null);
        }
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
        await handleBusinessSession(session);
    });

    function ensureBusinessAccess() {
        if (isBusinessUser && businessUserId) {
            return true;
        }
        alert('Las reservas están disponibles solo para comercios registrados. Serás redirigido al acceso de clientes.');
        redirectToBusinessLogin();
        return false;
    }

    // --- LÓGICA DEL CARRITO DE COMPRAS ---
    const cartModal = document.getElementById('cart-modal');
    const cartCloseBtn = cartModal ? cartModal.querySelector('.modal-close-btn') : null;
    const cartToggle = document.getElementById('cart-toggle');
    // Ocultar por defecto para evitar parpadeo hasta resolver sesión
    if (cartToggle) {
        cartToggle.hidden = true;
    }


    
    function openCart() {
        if (!cartModal || !ensureBusinessAccess()) return;
        cartModal.classList.add('visible');
        cartModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (cartToggle) {
            cartToggle.setAttribute('aria-expanded', 'true');
        }
        displayCartItems();
    }

    function closeCart() {
        if (!cartModal) return;
        cartModal.classList.remove('visible');
        cartModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (cartToggle) {
            cartToggle.setAttribute('aria-expanded', 'false');
        }
    }

    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            if (cartModal && cartModal.classList.contains('visible')) {
                closeCart();
            } else {
                openCart();
            }
        });
    }

    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', closeCart);
    }

    async function addToCart(productId) {
        if (!ensureBusinessAccess()) return;
        const userId = businessUserId;

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
            const newQuantity = data[0].quantity + 1;
            const { error: updateError } = await supabase
                .from('cart')
                .update({ quantity: newQuantity })
                .eq('id', data[0].id);
            if (updateError) console.error('Error updating cart:', updateError);
        } else {
            const { error: insertError } = await supabase
                .from('cart')
                .insert([{ product_id: productId, quantity: 1, user_id: userId }]);
            if (insertError) console.error('Error inserting into cart:', insertError);
        }
        updateCartBadge();
    }

    async function removeFromCart(itemId) {
        if (!ensureBusinessAccess()) return;
        const { error } = await supabase
            .from('cart')
            .delete()
            .eq('id', itemId);
        if (error) console.error('Error removing from cart:', error);
        displayCartItems();
        updateCartBadge();
    }

    // --- FUNCIÓN PARA MOSTRAR PRODUCTOS EN EL CARRITO (CORREGIDA) ---
    async function displayCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalEl = document.getElementById('cart-total');
        if (!cartItemsContainer || !cartTotalEl) return;

        if (!isBusinessUser || !businessUserId) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #bbb;">Inicia sesión con tu cuenta de negocios para ver tus reservas.</p>';
            cartTotalEl.textContent = '$0.00';
            return;
        }

        const { data: cartData, error } = await supabase
            .from('cart')
            .select('id, quantity, product_id')
            .eq('user_id', businessUserId);

        if (error) {
            console.error('Error fetching cart items:', error);
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #bbb;">Error al cargar tus reservas.</p>';
            return;
        }

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cartData.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #bbb;">Aún no tienes reservas.</p>';
            cartTotalEl.textContent = '$0.00';
        } else {
            // 2. Usar los datos de productos ya cargados en la página (productDataStore)
            cartData.forEach(item => {
                const product = productDataStore[item.product_id];
                
                if (product) { // Si encontramos el producto...
                    const priceValue = typeof product.price === 'number' ? product.price : Number(product.price) || 0;
                    const productImage = (product.images && product.images.length > 0) ? product.images[0] : DEFAULT_PRODUCT_IMAGE;
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="${productImage}" alt="${product.title}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-title">${product.title}</p>
                            <p class="cart-item-price">$${priceValue.toFixed(2)}</p>
                            <div class="cart-item-quantity">
                                <span>Cantidad: ${item.quantity}</span>
                            </div>
                        </div>
                        <button class="remove-from-cart-btn" data-id="${item.id}" aria-label="Eliminar producto">&times;</button>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                    total += priceValue * item.quantity;
                }
            });

            // 3. Asignar eventos a los botones de eliminar
            cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(btn => {
                btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
            });
            cartTotalEl.textContent = `$${total.toFixed(2)}`;
        }
    }

    // --- FUNCIÓN DEL CONTADOR DEL CARRITO (CORREGIDA) ---
    async function updateCartBadge() {
        const cartBadge = document.querySelector('.cart-badge');
        const baseLabel = 'Abrir reservas';
        if (!cartBadge) return;

        if (!isBusinessUser || !businessUserId) {
            cartBadge.textContent = 0;
            cartBadge.hidden = true;
            if (cartToggle) {
                cartToggle.setAttribute('aria-label', baseLabel);
            }
            return;
        }

        const { data, error } = await supabase
            .from('cart')
            .select('quantity')
            .eq('user_id', businessUserId);

        if (error) {
            console.error('Error fetching cart items for badge:', error);
            cartBadge.textContent = 0;
            cartBadge.hidden = true;
            if (cartToggle) {
                cartToggle.setAttribute('aria-label', baseLabel);
            }
            return;
        }

        const totalItems = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartBadge.textContent = totalItems;
        cartBadge.hidden = totalItems === 0;
        if (cartToggle) {
            cartToggle.setAttribute(
                'aria-label',
                totalItems > 0
                    ? `${baseLabel}. ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'} en las reservas`
                    : baseLabel
            );
        }
    }

    // --- LÓGICA DE PRODUCTOS, FILTROS Y PAGINACIÓN ---
    const productsPerPage = 6;
    const DEFAULT_PRODUCT_IMAGE = '/assets/logo-oma-final.png';
    const productGrid = document.getElementById('products-grid');
    const productFiltersContainer = document.getElementById('product-filters');
    const paginationControls = document.getElementById('pagination-controls');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResultsMessage = document.getElementById('no-results');
    let isInitialProductLoad = true;

    function showLoading(isLoading) {
        if (loadingIndicator) loadingIndicator.style.display = isLoading ? 'flex' : 'none';
        if (productGrid) productGrid.style.display = isLoading ? 'none' : 'grid';
        if (noResultsMessage) noResultsMessage.style.display = 'none';
    }

    function showNoResults(show) {
        if (noResultsMessage) noResultsMessage.style.display = show ? 'block' : 'none';
        if (productGrid) productGrid.style.display = show ? 'none' : 'grid';
        if (show) productGrid.style.display = 'none';
    }

    function normalizeProductRecord(product = {}) {
        const baseImages = Array.isArray(product.images)
            ? product.images
            : (typeof product.images === 'string' && product.images.trim().length > 0)
                ? [product.images.trim()]
                : [];
        const filteredImages = baseImages.filter(Boolean);
        return {
            ...product,
            title: product.title || 'Producto Oma Wurst',
            description: product.description || '',
            category: product.category || 'Especialidad',
            images: filteredImages
        };
    }

    async function loadProducts() {
        try {
            const { data, error } = await supabase.from('products').select('*');
            if (error) throw error;
            if (!Array.isArray(data) || data.length === 0) {
                productDataStore = {};
                productKeys = [];
                showNoResults(true);
                if (noResultsMessage) {
                    noResultsMessage.innerHTML = '<p>Aún no hay productos publicados en el catálogo.</p>';
                }
                return;
            }
            productDataStore = data.reduce((acc, product) => {
                const normalized = normalizeProductRecord(product);
                acc[normalized.id] = normalized;
                return acc;
            }, {});
            productKeys = Object.keys(productDataStore);
            createFilterButtons();
            activeFilter = 'Todos';
            activePage = 1;
            displayProducts(activeFilter, activePage);
        } catch (err) {
            console.error('Error cargando productos desde Supabase:', err);
            productDataStore = {};
            productKeys = [];
            showNoResults(true);
            if (noResultsMessage) {
                noResultsMessage.innerHTML = '<p>No pudimos conectar con el catálogo. Intenta recargar o contáctanos.</p>';
            }
        }
    }

    function createFilterButtons() {
        if (!productFiltersContainer) return;
        const categories = ['Todos', ...new Set(productKeys.map(key => productDataStore[key].category))];
        productFiltersContainer.innerHTML = '';
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.textContent = category;
            if (category === 'Todos') button.classList.add('active');
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                displayProducts(category, 1);
            });
            productFiltersContainer.appendChild(button);
        });
    }

    // --- FUNCIÓN DE RENDERIZADO DE PRODUCTOS (ACTUALIZADA) ---
    function displayProducts(filter = 'Todos', page = 1) {
        activeFilter = filter;
        activePage = page;
        if (!isInitialProductLoad) {
            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        showLoading(true);
        setTimeout(() => {
            const filteredKeys = filter === 'Todos' ? productKeys : productKeys.filter(key => productDataStore[key].category === filter);
            showLoading(false);
            if (filteredKeys.length === 0) {
                showNoResults(true);
                paginationControls.innerHTML = '';
                return;
            }
            showNoResults(false);
            const totalPages = Math.ceil(filteredKeys.length / productsPerPage);
            const start = (page - 1) * productsPerPage;
            const end = start + productsPerPage;
            const productsToShow = filteredKeys.slice(start, end);

            if (!productGrid) return;
            productGrid.innerHTML = '';
            let cardIndex = 0;
            productsToShow.forEach(productId => {
                const productData = productDataStore[productId];
                if (!productData) return;
                const images = (productData.images && productData.images.length > 0) ? productData.images : [DEFAULT_PRODUCT_IMAGE];
                const card = document.createElement('article');
                card.className = 'product-card fade-content';
                card.style.setProperty('--fc-delay', `${FADE_BASE_DELAY + cardIndex * FADE_STAGGER}ms`);
                const cardTitle = (productData.title || 'Producto Oma Wurst')
                    .replace(' Oma Wurst', '')
                    .replace(' para Untar', '')
                    .replace(' para la parrilla', '');
                const description = productData.description
                    ? `${productData.description.substring(0, 80)}${productData.description.length > 80 ? '…' : ''}`
                    : 'Muy pronto compartiremos más detalles.';
                const categoryTag = productData.category ? productData.category : 'Especialidad';
                const showReserveButton = isBusinessUser;
                const buttonWrapperClass = `product-card-buttons${showReserveButton ? '' : ' single-action'}`;
                const reserveButtonMarkup = showReserveButton ? '<button class="btn-product-card primary add-to-cart-btn">Reservar</button>' : '';

                card.innerHTML = `
                    <img class="product-card-img" src="${images[0]}" alt="${productData.title || 'Producto Oma Wurst'}" loading="lazy">
                    <div class="product-card-overlay"></div>
                    <span class="product-card-tag">${categoryTag}</span>
                    <div class="product-card-content">
                        <h3 class="product-card-title">${cardTitle}</h3>
                        <p class="product-card-description">${description}</p>
                        <div class="${buttonWrapperClass}">
                            <button class="btn-product-card secondary view-details-btn">Ver más</button>
                            ${reserveButtonMarkup}
                        </div>
                    </div>
                `;
                
                const addButton = card.querySelector('.add-to-cart-btn');
                if (addButton) {
                    addButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        addToCart(productData.id);
                    });
                }
                card.querySelector('.view-details-btn').addEventListener('click', (e) => {
                     e.stopPropagation();
                    openProductModal(productData);
                });
                card.addEventListener('click', () => openProductModal(productData));
                productGrid.appendChild(card);
                applyFadeContent([card], { baseDelay: FADE_BASE_DELAY + cardIndex * FADE_STAGGER, stagger: 0 });
                cardIndex++;
            });
            renderPagination(totalPages, page, filter);
            isInitialProductLoad = false;
        }, 300);
    }

    function renderPagination(totalPages, currentPage, currentFilter) {
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return;
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.className = 'page-btn';
            prevButton.innerHTML = '&laquo;';
            prevButton.addEventListener('click', () => displayProducts(currentFilter, currentPage - 1));
            paginationControls.appendChild(prevButton);
        }
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
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.className = 'page-btn';
            nextButton.innerHTML = '&raquo;';
            nextButton.addEventListener('click', () => displayProducts(currentFilter, currentPage + 1));
            paginationControls.appendChild(nextButton);
        }
    }

    // --- INICIALIZACIÓN Y EVENTOS GLOBALES ---
    async function initializeStorefront() {
        await checkBusinessAccess();
        await loadProducts();
        updateCartBadge();
    }

    initializeStorefront();

    window.addEventListener('click', (event) => { 
        if (event.target === productModal) closeProductModal(); 
        if (cartModal && event.target === cartModal) closeCart();
    });
    window.addEventListener('keydown', (event) => { 
        if (event.key === 'Escape' && productModal.style.display !== 'none') closeProductModal(); 
        if (event.key === 'Escape' && cartModal && cartModal.classList.contains('visible')) closeCart();
    });
    
    const animatedSections = document.querySelectorAll('#quienes-somos, .signature-experience, #products, #location, #contact');
    const spySections = document.querySelectorAll('section[id]');
    if (animatedSections.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('in-view', entry.isIntersecting);
            });
        }, { threshold: 0.1 });
        animatedSections.forEach(section => observer.observe(section));
    }

    // Scroll‑spy basado en posición para más precisión (evita quedarse pegado)
    function refreshActiveByScroll() {
        const headerH = (headerEl && headerEl.offsetHeight) || 78;
        const checkpoint = headerH + 20;
        let bestSection = null;
        let bestScore = -Infinity;
        spySections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            // Prioriza la sección cuyo borde superior pasó el header pero aún está visible
            let score = -Math.abs(rect.top - checkpoint);
            if (rect.top <= checkpoint && rect.bottom > checkpoint) score += 1000;
            if (score > bestScore) { bestScore = score; bestSection = sec; }
        });
        if (bestSection) setActiveNavByHash(`#${bestSection.id}`);
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                refreshActiveByScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Inicializa indicador posicionado en el primer link o hash actual
    window.addEventListener('load', () => {
        const initialHash = window.location.hash || '#home';
        setActiveNavByHash(initialHash);
        refreshActiveByScroll();
    });
    window.addEventListener('resize', () => {
        const active = document.querySelector('.nav .nav-link.active');
        moveNavIndicator(active);
        refreshActiveByScroll();
    });

    const sectionDividers = document.querySelectorAll('.section-divider');
    if (sectionDividers.length > 0) {
        const dividerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('in-view', entry.isIntersecting);
            });
        }, { threshold: 0.5 });
        sectionDividers.forEach(divider => dividerObserver.observe(divider));
    }

    // --- Header Scroll Effect ---
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    function applyFadeContent(elements, { blur = false, duration = FADE_DURATION, easing = FADE_EASING, baseDelay = FADE_BASE_DELAY, stagger = FADE_STAGGER, threshold = FADE_THRESHOLD, initialOpacity = 0.3 } = {}) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    observer.unobserve(el);
                    const elDelay = Number(el.dataset.fadeDelay || 0);
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.filter = blur ? 'blur(0px)' : 'none';
                    }, elDelay);
                }
            });
        }, { threshold });

        Array.from(elements).forEach((el, i) => {
            const delay = baseDelay + i * stagger;
            el.classList.add('fade-content');
            el.dataset.fadeDelay = String(delay);
            el.style.opacity = String(initialOpacity);
            el.style.filter = blur ? 'blur(10px)' : 'none';
            el.style.transition = `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`;
            observer.observe(el);
        });
    }

    // Inicializa para las tarjetas ya presentes
    applyFadeContent(document.querySelectorAll('.pillar-card'));
    applyFadeContent(document.querySelectorAll('.experience-card'));
    applyFadeContent(document.querySelectorAll('.product-card'));
});
