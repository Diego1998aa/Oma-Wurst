import { supabaseClient } from './database';
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
    const FADE_THRESHOLD = 0.3;
    const FADE_BASE_DELAY = 200;
    const FADE_STAGGER = 120;
    const FADE_DURATION = 1200;
    const FADE_EASING = 'ease-out';

    // --- Control de Sonido para el Video del Hero ---
    const video = document.getElementById('hero-background-video');
    const soundToggle = document.getElementById('video-sound-toggle');

    if (video && soundToggle) {
        const soundIcon = soundToggle.querySelector('i');
        soundToggle.addEventListener('click', () => {
            video.muted = !video.muted;
            if (video.muted) {
                soundIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
                soundToggle.setAttribute('aria-label', 'Activar sonido');
            } else {
                soundIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
                soundToggle.setAttribute('aria-label', 'Desactivar sonido');
            }
        });
    }

    // --- Menú de navegación responsive ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav .nav-link');
    const navIndicator = document.querySelector('.nav-indicator');
    const headerEl = document.querySelector('.header');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = !navMenu.classList.contains('show');
            navMenu.classList.toggle('show', isExpanded);
            navToggle.classList.toggle('nav-open', isExpanded);
            navToggle.setAttribute('aria-expanded', String(isExpanded));
        });
    }

    function moveNavIndicator(target) {
        if (!navIndicator || !target || !navMenu) return;
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

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => moveNavIndicator(link));
        link.addEventListener('focus', () => moveNavIndicator(link));
        link.addEventListener('mouseleave', () => {
            const active = document.querySelector('.nav .nav-link.active');
            moveNavIndicator(active || link);
        });
    });

    // --- Modal de Producto ---
    const productModal = document.getElementById('product-modal');
    const modalCloseBtn = productModal?.querySelector('.modal-close-btn');
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
        const images = (productData.images && productData.images.length > 0) 
            ? productData.images 
            : ['/assets/logo-oma-final.png'];

        modalProductTitle.textContent = safeTitle;
        modalProductDescription.textContent = safeDescription;

        modalSwiperWrapper.innerHTML = '';
        images.forEach(imgSrc => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = safeTitle;
            img.loading = 'lazy';
            img.decoding = 'async';
            slide.appendChild(img);
            modalSwiperWrapper.appendChild(slide);
        });

        productModal.style.display = 'flex';

        if (modalSwiper) {
            modalSwiper.destroy(true, true);
            modalSwiper = null;
        }

        // Solo iniciamos Swiper si hay contenedor en el DOM
        const modalSliderEl = productModal.querySelector('.modal-image-slider');
        if (modalSliderEl) {
            modalSwiper = new Swiper(modalSliderEl, {
                loop: images.length > 1,
                pagination: { el: '.modal-swiper-pagination', clickable: true },
                navigation: { nextEl: '.modal-swiper-button-next', prevEl: '.modal-swiper-button-prev' },
                lazy: true,
            });
        }

        // Forzar actualización si hay contenido
        setTimeout(() => modalSwiper?.update(), 50);
    }

    function closeProductModal() {
        if (!productModal) return;
        productModal.style.display = 'none';
        if (modalSwiper) {
            modalSwiper.destroy(true, true);
            modalSwiper = null;
        }
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeProductModal);
    }

    function redirectToBusinessLogin() {
        window.location.href = BUSINESS_LOGIN_URL;
    }

    async function fetchUserRole(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
            if (!error && data?.role) return data.role;
        } catch (err) {
            console.warn('Error fetching user role:', err);
        }
        return null;
    }

    async function isBusinessFromSession(session) {
        const user = session?.user;
        if (!user) return false;

        const dbRole = await fetchUserRole(user.id);
        if (dbRole) return ['business', 'owner', 'admin'].includes(dbRole);

        const meta = user.user_metadata || {};
        const appMeta = user.app_metadata || {};
        const roles = Array.isArray(appMeta.roles) ? appMeta.roles : [appMeta.role].filter(Boolean);
        const hasBusinessFields = Boolean(meta.company_name || meta.tax_id || meta.is_business || meta.isBusiness);
        const hasBusinessRole = roles.some(r => ['business', 'comercio', 'owner', 'admin'].includes(r));
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
            const { data } = await supabaseClient.auth.getSession();
            await handleBusinessSession(data?.session ?? null);
        } catch (err) {
            console.error('Error verificando sesión:', err);
            await handleBusinessSession(null);
        }
    }

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        handleBusinessSession(session);
    });

    function ensureBusinessAccess() {
        if (isBusinessUser && businessUserId) return true;
        // Mejor que un alert: redirigir directamente
        redirectToBusinessLogin();
        return false;
    }

    // --- Carrito ---
    const cartModal = document.getElementById('cart-modal');
    const cartCloseBtn = cartModal?.querySelector('.modal-close-btn');
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
        cartToggle?.setAttribute('aria-expanded', 'true');
        displayCartItems();
    }

    function closeCart() {
        if (!cartModal) return;
        cartModal.classList.remove('visible');
        cartModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        cartToggle?.setAttribute('aria-expanded', 'false');
    }

    cartToggle?.addEventListener('click', () => {
        cartModal?.classList.contains('visible') ? closeCart() : openCart();
    });

    cartCloseBtn?.addEventListener('click', closeCart);

    // --- Carrito: lógica CRUD ---
    async function addToCart(productId) {
        if (!ensureBusinessAccess()) return;
        const userId = businessUserId;

        const { data, error } = await supabaseClient
            .from('cart')
            .select('id, quantity')
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) {
            console.error('Error checking cart:', error);
            return;
        }

        if (data.length > 0) {
            const newQty = data[0].quantity + 1;
            await supabaseClient.from('cart').update({ quantity: newQty }).eq('id', data[0].id);
        } else {
            await supabaseClient.from('cart').insert([{ product_id: productId, quantity: 1, user_id: userId }]);
        }
        updateCartBadge();
    }

    async function removeFromCart(itemId) {
        if (!ensureBusinessAccess()) return;
        await supabaseClient.from('cart').delete().eq('id', itemId);
        displayCartItems();
        updateCartBadge();
    }

    // --- Mostrar items del carrito ---
    async function displayCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalEl = document.getElementById('cart-total');
        if (!cartItemsContainer || !cartTotalEl) return;

        if (!isBusinessUser || !businessUserId) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #bbb;">Inicia sesión con tu cuenta de negocios para ver tus reservas.</p>';
            cartTotalEl.textContent = '$0.00';
            return;
        }

        const { data: cartData, error } = await supabaseClient
            .from('cart')
            .select('id, quantity, product_id')
            .eq('user_id', businessUserId);

        if (error) {
            console.error('Error fetching cart:', error);
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #bbb;">Error al cargar tus reservas.</p>';
            return;
        }

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cartData.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #bbb;">Aún no tienes reservas.</p>';
            cartTotalEl.textContent = '$0.00';
        } else {
            cartData.forEach(item => {
                const product = productDataStore[item.product_id];
                if (!product) return;

                const priceValue = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
                const productImage = (product.images?.[0]) || '/assets/logo-oma-final.png';

                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${productImage}" alt="${product.title}" class="cart-item-img" loading="lazy" decoding="async">
                    <div class="cart-item-details">
                        <p class="cart-item-title">${product.title}</p>
                        <p class="cart-item-price">$${priceValue.toFixed(2)}</p>
                        <div class="cart-item-quantity">Cantidad: ${item.quantity}</div>
                    </div>
                    <button class="remove-from-cart-btn" data-id="${item.id}" aria-label="Eliminar ${product.title}">&times;</button>
                `;
                cartItemsContainer.appendChild(cartItem);
                total += priceValue * item.quantity;
            });

            // Limpiar eventos anteriores para evitar duplicados
            cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(btn => {
                btn.removeEventListener('click', handleRemoveClick);
                btn.addEventListener('click', handleRemoveClick);
            });

            cartTotalEl.textContent = `$${total.toFixed(2)}`;
        }
    }

    function handleRemoveClick(e) {
        const id = e.target.dataset.id;
        if (id) removeFromCart(id);
    }

    // --- Badge del carrito ---
    async function updateCartBadge() {
        const cartBadge = document.querySelector('.cart-badge');
        if (!cartBadge) return;

        if (!isBusinessUser || !businessUserId) {
            cartBadge.textContent = '0';
            cartBadge.hidden = true;
            return;
        }

        const { data, error } = await supabaseClient
            .from('cart')
            .select('quantity')
            .eq('user_id', businessUserId);

        if (error) {
            console.error('Error fetching cart count:', error);
            cartBadge.textContent = '0';
            cartBadge.hidden = true;
            return;
        }

        const totalItems = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartBadge.textContent = String(totalItems);
        cartBadge.hidden = totalItems === 0;
    }

    // --- Productos y catálogo ---
    const productsPerPage = 6;
    const DEFAULT_PRODUCT_IMAGE = '/assets/logo-oma-final.png';
    const productGrid = document.getElementById('products-grid');
    const productFiltersContainer = document.getElementById('product-filters');
    const paginationControls = document.getElementById('pagination-controls');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResultsMessage = document.getElementById('no-results');

    let isInitialProductLoad = true;
    const DEFAULT_PRODUCTS = [
        {
            id: 'catalogo-longaniza',
            title: 'Longaniza Oma Wurst',
            description: 'Receta tradicional curada lentamente con especias chileno-alemanas.',
            category: 'Clásicos',
            price: 8490,
            images: ['/assets/productos/longaniza/longaniza_oma.jpg']
        },
        {
            id: 'catalogo-chorizo',
            title: 'Chorizo Parrillero',
            description: 'Ideal para la parrilla, con toque ahumado y ají cacho de cabra.',
            category: 'Parrilla',
            price: 6990,
            images: ['/assets/productos/chorizo/chorizo_parrillero.jpg']
        },
        {
            id: 'catalogo-salchicha',
            title: 'Salchicha Artesanal',
            description: 'Textura suave y el ahumado característico de Oma.',
            category: 'Clásicos',
            price: 6290,
            images: ['/assets/productos/salchichas/salchichas_oma.jpg']
        },
        {
            id: 'catalogo-pate',
            title: 'Paté Tee Wurst',
            description: 'Untable premium con carnes seleccionadas y especias europeas.',
            category: 'Gourmet',
            price: 5490,
            images: ['/assets/productos/pateteewurst/pateteewurst_01.jpg']
        }
    ];

    function showLoading(isLoading) {
        if (loadingIndicator) loadingIndicator.style.display = isLoading ? 'flex' : 'none';
        if (productGrid) productGrid.style.display = isLoading ? 'none' : 'grid';
        if (noResultsMessage) noResultsMessage.style.display = 'none';
    }

    function showNoResults(show) {
        if (noResultsMessage) noResultsMessage.style.display = show ? 'block' : 'none';
        if (productGrid) productGrid.style.display = show ? 'none' : 'grid';
    }

    function normalizeProductRecord(product = {}) {
        const baseImages = Array.isArray(product.images)
            ? product.images
            : (typeof product.images === 'string' && product.images.trim())
                ? [product.images.trim()]
                : [];
        return {
            ...product,
            id: product.id || (product.title ? generateIdFromTitle(product.title) : `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`),
            title: product.title || 'Producto Oma Wurst',
            description: product.description || '',
            category: product.category || 'Especialidad',
            images: baseImages.filter(Boolean)
        };
    }

    function generateIdFromTitle(title) {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    async function loadProducts() {
        showLoading(true);
        try {
            const { data, error } = await supabaseClient.from('products').select('*');
            if (!error && Array.isArray(data) && data.length > 0) {
                hydrateProductsData(data, 'Supabase');
                showLoading(false);
                return;
            }
        } catch (err) {
            console.warn('Supabase falló, usando respaldo:', err);
        }

        // Intentar cargar desde products.json
        try {
            const res = await fetch('/products.json', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    hydrateProductsData(data, 'products.json');
                    showLoading(false);
                    return;
                }
            }
        } catch (err) {
            console.warn('products.json no disponible:', err);
        }

        // Último recurso: datos por defecto
        hydrateProductsData(DEFAULT_PRODUCTS, 'catálogo predeterminado');
        showLoading(false);
    }

    function hydrateProductsData(products = [], sourceLabel = 'catálogo') {
        if (!Array.isArray(products) || products.length === 0) {
            productDataStore = {};
            productKeys = [];
            if (productFiltersContainer) productFiltersContainer.innerHTML = '';
            showNoResults(true);
            if (noResultsMessage) {
                noResultsMessage.innerHTML = '<p>Aún no hay productos publicados en el catálogo.</p>';
            }
            return;
        }

        productDataStore = {};
        products.forEach(p => {
            const normalized = normalizeProductRecord(p);
            productDataStore[normalized.id] = normalized;
        });
        productKeys = Object.keys(productDataStore);
        createFilterButtons();
        activeFilter = 'Todos';
        activePage = 1;
        displayProducts(activeFilter, activePage);
        console.info(`Catálogo cargado (${productKeys.length} productos) desde ${sourceLabel}.`);
    }

    function createFilterButtons() {
        if (!productFiltersContainer) return;
        const categories = ['Todos', ...new Set(productKeys.map(k => productDataStore[k].category))];
        productFiltersContainer.innerHTML = '';
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = category;
            if (category === 'Todos') btn.classList.add('active');
            btn.addEventListener('click', () => {
                productFiltersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                displayProducts(category, 1);
            });
            productFiltersContainer.appendChild(btn);
        });
    }

    function displayProducts(filter = 'Todos', page = 1) {
        activeFilter = filter;
        activePage = page;

        if (!isInitialProductLoad) {
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        const filteredKeys = filter === 'Todos'
            ? productKeys
            : productKeys.filter(k => productDataStore[k].category === filter);

        if (filteredKeys.length === 0) {
            showNoResults(true);
            paginationControls.innerHTML = '';
            return;
        }

        showNoResults(false);
        const totalPages = Math.ceil(filteredKeys.length / productsPerPage);
        const start = (page - 1) * productsPerPage;
        const productsToShow = filteredKeys.slice(start, start + productsPerPage);

        if (!productGrid) return;
        productGrid.innerHTML = '';

        productsToShow.forEach((productId, idx) => {
            const product = productDataStore[productId];
            if (!product) return;

            const images = product.images.length > 0 ? product.images : [DEFAULT_PRODUCT_IMAGE];
            const cardTitle = (product.title || 'Producto Oma Wurst')
                .replace(/ Oma Wurst$/, '')
                .replace(/ para Untar$/, '')
                .replace(/ para la parrilla$/, '');
            const description = product.description
                ? `${product.description.substring(0, 80)}${product.description.length > 80 ? '…' : ''}`
                : 'Muy pronto compartiremos más detalles.';

            const card = document.createElement('article');
            card.className = 'product-card';
            card.innerHTML = `
                <img class="product-card-img" src="${images[0]}" alt="${product.title}" loading="lazy" decoding="async">
                <div class="product-card-overlay"></div>
                <span class="product-card-tag">${product.category || 'Especialidad'}</span>
                <div class="product-card-content">
                    <h3 class="product-card-title">${cardTitle}</h3>
                    <p class="product-card-description">${description}</p>
                    <div class="product-card-buttons${isBusinessUser ? '' : ' single-action'}">
                        <button class="btn-product-card secondary view-details-btn">Ver más</button>
                        ${isBusinessUser ? '<button class="btn-product-card primary add-to-cart-btn">Reservar</button>' : ''}
                    </div>
                </div>
            `;

            const viewBtn = card.querySelector('.view-details-btn');
            const addBtn = card.querySelector('.add-to-cart-btn');

            viewBtn?.addEventListener('click', e => {
                e.stopPropagation();
                openProductModal(product);
            });

            addBtn?.addEventListener('click', e => {
                e.stopPropagation();
                addToCart(product.id);
            });

            card.addEventListener('click', () => openProductModal(product));
            productGrid.appendChild(card);
        });

        renderPagination(totalPages, page, filter);
        isInitialProductLoad = false;
    }

    function renderPagination(totalPages, currentPage, currentFilter) {
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return;

        if (currentPage > 1) {
            const prev = document.createElement('button');
            prev.className = 'page-btn';
            prev.innerHTML = '&laquo;';
            prev.addEventListener('click', () => displayProducts(currentFilter, currentPage - 1));
            paginationControls.appendChild(prev);
        }

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'page-btn';
            btn.textContent = i;
            if (i === currentPage) btn.classList.add('active');
            else btn.addEventListener('click', () => displayProducts(currentFilter, i));
            paginationControls.appendChild(btn);
        }

        if (currentPage < totalPages) {
            const next = document.createElement('button');
            next.className = 'page-btn';
            next.innerHTML = '&raquo;';
            next.addEventListener('click', () => displayProducts(currentFilter, currentPage + 1));
            paginationControls.appendChild(next);
        }
    }

    // --- Inicialización ---
    loadProducts();
    checkBusinessAccess();
    updateCartBadge();

    // --- Eventos globales ---
    window.addEventListener('click', e => {
        if (e.target === productModal) closeProductModal();
        if (cartModal && e.target === cartModal) closeCart();
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (productModal?.style.display === 'flex') closeProductModal();
            if (cartModal?.classList.contains('visible')) closeCart();
        }
    });

    // --- Animaciones e intersección ---
    const animatedSections = document.querySelectorAll('#quienes-somos, .signature-experience, #products, #location, #contact');
    if (animatedSections.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting));
        }, { threshold: 0.1 });
        animatedSections.forEach(s => observer.observe(s));
    }

    // Scroll spy mejorado
    function refreshActiveByScroll() {
        const headerH = (headerEl?.offsetHeight || 78) + 20;
        let bestSection = null;
        let bestScore = -Infinity;

        document.querySelectorAll('section[id]').forEach(sec => {
            const rect = sec.getBoundingClientRect();
            let score = -Math.abs(rect.top - headerH);
            if (rect.top <= headerH && rect.bottom > headerH) score += 1000;
            if (score > bestScore) {
                bestScore = score;
                bestSection = sec;
            }
        });

        if (bestSection) setActiveNavByHash(`#${bestSection.id}`);
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                refreshActiveByScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('load', () => {
        const hash = window.location.hash || '#home';
        setActiveNavByHash(hash);
        refreshActiveByScroll();
    });

    window.addEventListener('resize', () => {
        const active = document.querySelector('.nav .nav-link.active');
        moveNavIndicator(active);
        refreshActiveByScroll();
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        header?.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Divider observer
    const sectionDividers = document.querySelectorAll('.section-divider');
    if (sectionDividers.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting));
        }, { threshold: 0.5 });
        sectionDividers.forEach(d => observer.observe(d));
    }
});