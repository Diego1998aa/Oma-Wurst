import { supabaseClient } from './database';

// --- 1. CONFIGURACIÓN Y CONEXIÓN ---

// --- 2. ELEMENTOS DEL DOM ---
const userEmailElement = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const mainTitle = document.getElementById('main-title');
const navLinks = document.querySelectorAll('.sidebar-nav a');
const mainSections = document.querySelectorAll('.main-section');

// Reservas
const calendarView = document.getElementById('calendar-view');
const listView = document.getElementById('list-view');
const btnViewCalendar = document.getElementById('btn-view-calendar');
const btnViewList = document.getElementById('btn-view-list');
const calendarContainer = document.getElementById('calendar-container');
const reservasTableBody = document.getElementById('reservas-table-body');
const statusFilterSelect = document.getElementById('status-filter');
const dateFilterInput = document.getElementById('date-filter');
const backToDashboardBtn = document.getElementById('back-to-dashboard');
const sidebarToggleButton = document.getElementById('sidebar-toggle');
const bodyElement = document.body;
const MOBILE_BREAKPOINT = 1024;
let currentReservasView = 'calendar';
let calendar;
let reservasData = [];

// Productos
const productsTableBody = document.getElementById('products-table-body');
const productsLoadingIndicator = document.getElementById('products-loading-indicator');
const productsEmptyState = document.getElementById('products-empty-state');
const productsEmptyMessage = document.getElementById('products-empty-message');
const productTotalCount = document.getElementById('product-total-count');
const productCategoryCount = document.getElementById('product-category-count');
const productMissingImagesCount = document.getElementById('product-missing-images-count');
const productSearchInput = document.getElementById('product-search-input');
const productCategoryFilter = document.getElementById('product-category-filter');
const productSortSelect = document.getElementById('product-sort-select');
const productResetFiltersBtn = document.getElementById('product-reset-filters');
const refreshProductsBtn = document.getElementById('refresh-products-btn');
const quickAddProductBtn = document.getElementById('quick-add-product-btn');
const productsEmptyCtaBtn = document.getElementById('empty-state-add-product-btn');
const dashboardToast = document.getElementById('dashboard-toast');
const addProductBtn = document.getElementById('add-product-btn');
const productModal = document.getElementById('product-modal');
const modalProductCloseBtn = document.getElementById('modal-product-close-btn');
const productForm = document.getElementById('product-form');
const modalProductTitleForm = document.getElementById('modal-product-title-form');
const imagePreviewsContainer = document.getElementById('image-previews');
const productCategorySelectInput = document.getElementById('product-category-select');
const newCategoryWrapper = document.getElementById('new-category-wrapper');
const productCategoryNewInput = document.getElementById('product-category-new');
let productsData = [];
let removedImageUrls = new Set();
const productFilters = { query: '', category: 'all', sort: 'recent' };
let productsLoading = false;
let toastTimeoutId = null;
const NEW_CATEGORY_VALUE = '__new__';

// --- 3. AUTENTICACIÓN Y SESIÓN ---
let isAdmin = false;

// Lee el rol desde la tabla profiles
async function getUserRole(userId) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();   // no lanza error si no hay fila

    if (error) {
        console.error('Error leyendo role desde profiles:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
        return null;
    }

    console.log('Perfil desde BD:', data);
    return data?.role ?? null;
}

// Comprueba la sesión y aplica permisos según el rol en profiles
async function checkSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data.session) {
        window.location.href = 'login.html';
        return;
    }

    const session = data.session;
    const user = session.user;

    // 1) Rol real desde BD
    const dbRole = await getUserRole(user.id);

    // 🔥 CORRECCIÓN CLAVE: No asumir 'customer' si no hay perfil
    // En su lugar, si no hay rol, lo inferimos del metadata de Auth (útil para desarrollo)
    let effectiveRole = dbRole;

    if (!effectiveRole) {
        // Intentar obtener rol desde user_metadata (útil si usaste signUp con metadata)
        const metadata = user.user_metadata || {};
        const appMetadata = user.app_metadata || {};
        const rolesFromMetadata = appMetadata.roles || appMetadata.role || metadata.role;

        if (Array.isArray(rolesFromMetadata)) {
            effectiveRole = rolesFromMetadata.find(r => ['owner', 'admin', 'staff'].includes(r)) || 'customer';
        } else if (typeof rolesFromMetadata === 'string') {
            effectiveRole = ['owner', 'admin', 'staff'].includes(rolesFromMetadata) ? rolesFromMetadata : 'customer';
        } else {
            // Si no hay nada, asumimos 'customer' (pero mostramos advertencia)
            console.warn('⚠️ Usuario sin perfil en `profiles` y sin rol en metadata. Asignando "customer".');
            effectiveRole = 'customer';
        }
    }

    // 2) Es admin si está en estos roles
    isAdmin = ['owner', 'admin', 'staff'].includes(effectiveRole);

    // 3) Texto que se muestra en el header
    const roleLabel = isAdmin ? ` · ${effectiveRole}` : ' · Solo lectura';
    userEmailElement.textContent = user.email + roleLabel;

    // 4) Si no es admin, ocultamos el botón de agregar producto
    if (!isAdmin) {
        const addBtn = document.getElementById('add-product-btn');
        if (addBtn) addBtn.style.display = 'none';
        if (productsEmptyCtaBtn) productsEmptyCtaBtn.style.display = 'none';
        if (quickAddProductBtn) quickAddProductBtn.style.display = 'none';
    }

    await loadDashboardData();
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}

// --- 4. NAVEGACIÓN SPA ---
function setupNavigation() {
    if (!navLinks || navLinks.length === 0) return;
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('data-target');
            if (!targetId) return;
            showSection(targetId);
            setActiveSidebarItem(targetId);
            closeSidebarOnMobile();
        });
    });
}

function setActiveSidebarItem(targetId) {
    const activeItem = document.querySelector('.sidebar-nav li.active');
    if (activeItem) {
        activeItem.classList.remove('active');
    }
    const targetLink = document.querySelector(`.sidebar-nav a[data-target="${targetId}"]`);
    if (targetLink?.parentElement) {
        targetLink.parentElement.classList.add('active');
    }
}

function closeSidebarOnMobile() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
        bodyElement.classList.remove('sidebar-open');
    }
}

function showSection(targetId) {
    mainSections.forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
        const link = document.querySelector(`a[data-target="${targetId}"]`);
        const linkText = link.textContent.trim();
        mainTitle.textContent = linkText === 'Dashboard' ? 'Panel de Administración' : `Gestión de ${linkText}`;

        if (targetId === 'reservas-section' && reservasData.length === 0) {
            loadReservasData();
        }
        if (targetId === 'productos-section' && productsData.length === 0) {
            loadProductsData();
        }
    }
}

// --- 5. LÓGICA DE DATOS (Dashboard / Reservas) ---
async function loadDashboardData() {
    document.getElementById('kpi-usuarios-registrados').textContent = '—';
    document.getElementById('kpi-usuarios-activos').textContent = '—';
    await loadReservasData();
    const now = new Date();
    const monthKey = now.toISOString().slice(0, 7); // yyyy-mm
    const countMonth = reservasData.filter(r => r.date.toISOString().slice(0, 7) === monthKey).length;
    document.getElementById('kpi-nuevas-reservas').textContent = String(countMonth);
}

async function loadReservasData() {
    let populated = false;
    try {
        const { data, error } = await supabaseClient
            .from('reservations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);
        if (!error && Array.isArray(data)) {
            reservasData = data.map(mapReservationRecord);
            populated = true;
        }
    } catch (e) {
        console.error('Error cargando reservations:', e);
    }

    // Fallback desde carrito
    if (!populated) {
        try {
            const { data: cartRows, error: cartErr } = await supabaseClient
                .from('cart')
                .select('id,user_id,product_id,quantity,created_at')
                .order('created_at', { ascending: false })
                .limit(500);
            if (!cartErr && Array.isArray(cartRows)) {
                const { data: products } = await supabaseClient.from('products').select('id,price,title');
                const priceMap = new Map((products || []).map(p => [String(p.id), Number(p.price) || 0]));
                const grouped = new Map();
                for (const row of cartRows) {
                    const key = row.user_id || 'anon';
                    const itemTotal = (priceMap.get(String(row.product_id)) || 0) * (row.quantity || 0);
                    if (!grouped.has(key)) {
                        grouped.set(key, {
                            id: key.slice(0, 8),
                            customer: key.slice(0, 8),
                            date: new Date(row.created_at || Date.now()),
                            status: 'Pendiente',
                            total: 0,
                            _src: 'cart'
                        });
                    }
                    const g = grouped.get(key);
                    g.total += itemTotal;
                    if (row.created_at && new Date(row.created_at) > g.date) g.date = new Date(row.created_at);
                }
                reservasData = Array.from(grouped.values());
                populated = true;
            }
        } catch (e) {
            console.error('Error cargando reservas desde cart:', e);
        }
    }

    renderReservasUI();
}

function mapReservationRecord(r) {
    const id = r.id || r.reservation_id || r.uuid || '';
    const customer = r.customer_name || r.customer || r.client_name || r.name || (r.user_id ? String(r.user_id).slice(0, 8) : 'Cliente');
    const dateRaw = r.delivery_date || r.date || r.created_at || Date.now();
    const status = r.status || 'Pendiente';
    const total = Number(r.total || r.amount || r.total_amount || 0);
    return { id, customer, date: new Date(dateRaw), status, total, _src: 'reservations' };
}

function renderReservasUI() {
    renderReservasList();
    renderUltimasReservas();
    renderCalendar();
}

function formatCLP(n) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    }).format(Math.round(n || 0));
}

function renderUltimasReservas() {
    const tbody = document.getElementById('ultimas-reservas-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    reservasData.slice(0, 5).forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.date.toLocaleDateString()}</td>
            <td>${r.customer}</td>
            <td><span class="status-badge status-${(r.status || 'Pendiente').toLowerCase()}">${r.status || 'Pendiente'}</span></td>
            <td><button class="btn-product-card secondary" onclick="viewReserva('${r.id}')">Ver</button></td>`;
        tbody.appendChild(tr);
    });
}

function renderReservasList() {
    const statusFilterValue = statusFilterSelect ? statusFilterSelect.value : 'all';
    const dateFilterValue = dateFilterInput ? dateFilterInput.value : '';
    let rows = reservasData;
    if (statusFilterValue && statusFilterValue !== 'all') {
        rows = rows.filter(r => (r.status || 'Pendiente') === statusFilterValue);
    }
    if (dateFilterValue) {
        const dateInstance = new Date(dateFilterValue);
        const iso = dateInstance.toISOString().slice(0, 10);
        rows = rows.filter(r => r.date.toISOString().slice(0, 10) === iso);
    }
    reservasTableBody.innerHTML = '';
    if (rows.length === 0) {
        reservasTableBody.innerHTML = '<tr><td colspan="6">No hay reservas para los filtros seleccionados.</td></tr>';
        return;
    }
    rows.forEach(r => {
        const canUpdate = (r._src === 'reservations') && isAdmin;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.id}</td>
            <td>${r.customer}</td>
            <td>${r.date.toLocaleString()}</td>
            <td><span class="status-badge status-${(r.status || 'Pendiente').toLowerCase()}">${r.status || 'Pendiente'}</span></td>
            <td>${formatCLP(r.total || 0)}</td>
            <td>
                ${canUpdate ? `
                    <button class="btn-product-card secondary" onclick="updateReservaStatus('${r.id}','Confirmado')">Confirmar</button>
                    <button class="btn-product-card secondary" onclick="updateReservaStatus('${r.id}','Completado')">Completar</button>
                    <button class="btn-product-card danger" onclick="updateReservaStatus('${r.id}','Cancelado')">Cancelar</button>
                ` : '<em>Solo lectura</em>'}
            </td>`;
        reservasTableBody.appendChild(tr);
    });
}

async function updateReservaStatus(reservaId, status) {
    try {
        const { error } = await supabaseClient
            .from('reservations')
            .update({ status })
            .eq('id', reservaId);
        if (error) throw error;
        reservasData = reservasData.map(r => r.id === reservaId ? { ...r, status } : r);
        renderReservasUI();
    } catch (e) {
        showToast('No fue posible actualizar la reserva. Verifica permisos o RLS.', 'error');
        console.error(e);
    }
}

function renderCalendar() {
    if (!calendar) {
        calendar = new FullCalendar.Calendar(calendarContainer, {
            initialView: 'dayGridMonth',
            height: 'auto',
            locale: 'es',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            events: reservasData.map(r => ({
                id: r.id,
                title: `${r.customer} • ${r.status || 'Pendiente'}`,
                start: r.date
            }))
        });
        calendar.render();
    } else {
        calendar.removeAllEvents();
        calendar.addEventSource(reservasData.map(r => ({
            id: r.id,
            title: `${r.customer} • ${r.status || 'Pendiente'}`,
            start: r.date
        })));
    }
}

// --- 6. PRODUCTOS ---
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function extractStoragePathFromUrl(url) {
    if (!url) return null;
    const marker = '/product-images/';
    const index = url.indexOf(marker);
    if (index === -1) return null;
    const pathWithParams = url.substring(index + marker.length);
    return pathWithParams.split('?')[0];
}

function debounce(fn, delay = 250) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

function showToast(message, variant = 'info') {
    if (!dashboardToast) {
        if (variant === 'error') console.error(message);
        else console.log(message);
        return;
    }
    dashboardToast.textContent = message;
    dashboardToast.className = `dashboard-toast show ${variant}`;
    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
        dashboardToast.classList.remove('show');
    }, 4000);
}

function toggleProductsLoadingState(isLoading) {
    productsLoading = isLoading;
    if (productsLoadingIndicator) {
        productsLoadingIndicator.hidden = !isLoading;
    }
}

function normalizeText(value) {
    return (value || '').toString().toLowerCase().trim();
}

function getUniqueCategoriesList(products = []) {
    return Array.from(new Set(
        products
            .map(p => (p.category || '').trim())
            .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function populateCategoryFilter(products = []) {
    const categories = getUniqueCategoriesList(products);
    if (productCategoryFilter) {
        const previousValue = productFilters.category || 'all';
        productCategoryFilter.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = 'all';
        defaultOption.textContent = 'Todas las categorías';
        productCategoryFilter.appendChild(defaultOption);

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            productCategoryFilter.appendChild(option);
        });

        if (categories.includes(previousValue)) {
            productCategoryFilter.value = previousValue;
        } else {
            productCategoryFilter.value = 'all';
            productFilters.category = 'all';
        }
    }
    updateCategorySelectOptions(categories);
}

function toggleNewCategoryInput(show) {
    if (!newCategoryWrapper) return;
    newCategoryWrapper.style.display = show ? 'block' : 'none';
    if (!show && productCategoryNewInput) {
        productCategoryNewInput.value = '';
    }
    if (show && productCategoryNewInput) {
        productCategoryNewInput.focus();
    }
}

function updateCategorySelectOptions(categories = [], selectedValue = '') {
    if (!productCategorySelectInput) return;
    const uniqueCategories = Array.from(new Set(categories)).filter(Boolean);
    const previousSelection = selectedValue || productCategorySelectInput.value || '';
    productCategorySelectInput.innerHTML = '';

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.disabled = true;
    placeholderOption.textContent = 'Selecciona una categoría';
    productCategorySelectInput.appendChild(placeholderOption);

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        productCategorySelectInput.appendChild(option);
    });

    const createOption = document.createElement('option');
    createOption.value = NEW_CATEGORY_VALUE;
    createOption.textContent = '➕ Crear nueva categoría';
    productCategorySelectInput.appendChild(createOption);

    if (previousSelection && previousSelection !== NEW_CATEGORY_VALUE && uniqueCategories.includes(previousSelection)) {
        productCategorySelectInput.value = previousSelection;
    } else if (previousSelection === NEW_CATEGORY_VALUE) {
        productCategorySelectInput.value = NEW_CATEGORY_VALUE;
    } else {
        productCategorySelectInput.value = '';
    }

    if (!productCategorySelectInput.value && previousSelection && previousSelection !== NEW_CATEGORY_VALUE) {
        const tempOption = document.createElement('option');
        tempOption.value = previousSelection;
        tempOption.textContent = previousSelection;
        productCategorySelectInput.insertBefore(tempOption, createOption);
        productCategorySelectInput.value = previousSelection;
    }

    toggleNewCategoryInput(productCategorySelectInput.value === NEW_CATEGORY_VALUE);
}

function updateProductStats(products = []) {
    if (productTotalCount) productTotalCount.textContent = products.length;
    if (productCategoryCount) {
        const categories = new Set(products.map(p => (p.category || '').trim()).filter(Boolean));
        productCategoryCount.textContent = categories.size;
    }
    if (productMissingImagesCount) {
        const missing = products.filter(p => !Array.isArray(p.images) || p.images.length === 0).length;
        productMissingImagesCount.textContent = missing;
    }
}

function getProductDateValue(product) {
    const raw = product?.updated_at || product?.created_at || product?.inserted_at || product?.published_at;
    const time = raw ? new Date(raw).getTime() : 0;
    return Number.isNaN(time) ? 0 : time;
}

function getFilteredProducts() {
    let list = Array.isArray(productsData) ? [...productsData] : [];
    if (productFilters.query) {
        const query = productFilters.query;
        list = list.filter(product =>
            [product.title, product.description, product.category]
                .some(field => normalizeText(field).includes(query))
        );
    }
    if (productFilters.category && productFilters.category !== 'all') {
        list = list.filter(product => normalizeText(product.category) === normalizeText(productFilters.category));
    }
    switch (productFilters.sort) {
        case 'price_desc':
            list.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
        case 'price_asc':
            list.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
        case 'name_asc':
            list.sort((a, b) => normalizeText(a.title).localeCompare(normalizeText(b.title), 'es'));
            break;
        default:
            list.sort((a, b) => getProductDateValue(b) - getProductDateValue(a));
    }
    return list;
}

function renderProductsUI() {
    populateCategoryFilter(productsData);
    updateProductStats(productsData);
    const filtered = getFilteredProducts();
    displayProductsInTable(filtered);
}

async function loadProductsData(forceReload = false) {
    if (productsLoading && !forceReload) return;
    if (productsLoading && forceReload) {
        showToast('Ya estamos sincronizando los productos…', 'info');
        return;
    }
    toggleProductsLoadingState(true);
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*');
        if (error) throw error;
        productsData = Array.isArray(data) ? data : [];
        renderProductsUI();
    } catch (error) {
        console.error('Error cargando productos:', error);
        showToast('No pudimos cargar los productos. Intenta nuevamente.', 'error');
    } finally {
        toggleProductsLoadingState(false);
    }
}

function displayProductsInTable(products) {
    if (!productsTableBody) return;
    const hasFilters = Boolean(productFilters.query) || productFilters.category !== 'all';
    productsTableBody.innerHTML = '';
    if (!products || products.length === 0) {
        if (productsEmptyState) {
            productsEmptyState.hidden = false;
            if (productsEmptyMessage) {
                productsEmptyMessage.textContent = hasFilters
                    ? 'No encontramos productos para los filtros seleccionados.'
                    : 'Aún no hay productos. ¡Agrega el primero!';
            }
        }
        productsTableBody.innerHTML = '<tr><td colspan="5">No hay productos para mostrar.</td></tr>';
        return;
    }
    if (productsEmptyState) {
        productsEmptyState.hidden = true;
    }
    const rowsHtml = products.map(product => {
        const actions = isAdmin
            ? `<button class="btn-product-card secondary" onclick="editProduct('${product.id}')">Editar</button>
               <button class="btn-product-card danger" onclick="deleteProduct('${product.id}')">Eliminar</button>`
            : '<em>Solo lectura</em>';
        const imageSrc = (Array.isArray(product.images) && product.images.length > 0)
            ? product.images[0]
            : '/assets/logo-oma-final.png';
        const priceLabel = typeof product.price === 'number'
            ? formatCLP(product.price)
            : '$0';
        return `
            <tr>
                <td>
                    <img src="${imageSrc}"
                         alt="${product.title || 'Producto'}"
                         style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
                </td>
                <td>${product.title || 'Sin título'}</td>
                <td>${product.category || 'Sin categoría'}</td>
                <td>${priceLabel}</td>
                <td class="product-actions">${actions}</td>
            </tr>
        `;
    }).join('');
    productsTableBody.innerHTML = rowsHtml;
}

function openProductModal(product = null) {
    productForm.reset();
    imagePreviewsContainer.innerHTML = '';
    document.getElementById('product-id').value = '';
    removedImageUrls = new Set();
    const categoriesList = getUniqueCategoriesList(productsData);
    const selectedCategory = product?.category || '';
    updateCategorySelectOptions(categoriesList, selectedCategory);
    toggleNewCategoryInput(productCategorySelectInput && productCategorySelectInput.value === NEW_CATEGORY_VALUE);
    if (productCategoryNewInput) productCategoryNewInput.value = '';

    if (product) {
        modalProductTitleForm.textContent = 'Editar Producto';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-title').value = product.title;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        if (product.images && product.images.length > 0) {
            product.images.forEach(imgUrl => {
                const preview = document.createElement('div');
                preview.className = 'image-preview-item';
                preview.innerHTML = `
                    <img src="${imgUrl}" alt="preview">
                    <button type="button" class="remove-preview-btn" data-url="${imgUrl}">&times;</button>`;
                imagePreviewsContainer.appendChild(preview);
            });
        }
    } else {
        modalProductTitleForm.textContent = 'Agregar Nuevo Producto';
    }
    productModal.style.display = 'flex';
}

function closeProductModal() {
    productModal.style.display = 'none';
}

async function handleProductFormSubmit(event) {
    event.preventDefault();
    if (!isAdmin) {
        showToast('No tienes permisos para modificar el catálogo.', 'error');
        return;
    }
    const formButton = event.target.querySelector('button[type="submit"]');
    formButton.disabled = true;
    const originalLabel = formButton.textContent;
    formButton.textContent = 'Guardando...';

    const productId = document.getElementById('product-id').value.trim();
    const title = document.getElementById('product-title').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const priceValue = parseFloat(document.getElementById('product-price').value);
    const price = Number.isNaN(priceValue) ? 0 : Math.max(0, Math.round(priceValue));
    const imageInput = document.getElementById('product-images');
    const imageFiles = imageInput ? Array.from(imageInput.files || []) : [];
    let category = '';
    if (productCategorySelectInput) {
        const selectedCategory = productCategorySelectInput.value;
        if (selectedCategory === NEW_CATEGORY_VALUE) {
            category = (productCategoryNewInput?.value || '').trim();
            if (!category) {
                showToast('Escribe un nombre para la nueva categoría.', 'error');
                formButton.disabled = false;
                formButton.textContent = originalLabel;
                productCategoryNewInput?.focus();
                return;
            }
        } else if (selectedCategory) {
            category = selectedCategory;
        } else {
            showToast('Selecciona una categoría para el producto.', 'error');
            formButton.disabled = false;
            formButton.textContent = originalLabel;
            productCategorySelectInput.focus();
            return;
        }
    }

    if (!title || !description || !category) {
        showToast('Completa todos los campos antes de guardar.', 'error');
        formButton.disabled = false;
        formButton.textContent = originalLabel;
        return;
    }

    let imageUrls = [];
    if (productId) {
        const existingProduct = productsData.find(p => p.id === productId);
        if (existingProduct) {
            imageUrls = (existingProduct.images || []).filter(u => !removedImageUrls.has(u));
        }
    }

    try {
        if (imageFiles.length > 0) {
            for (const file of imageFiles) {
                const dataUrl = await readFileAsDataUrl(file);
                if (dataUrl) imageUrls.push(dataUrl);
            }
        }

        const productPayload = {
            title,
            description,
            category,
            price,
            images: imageUrls
        };

        if (productId) {
            const { error } = await supabaseClient
                .from('products')
                .update(productPayload)
                .eq('id', productId);
            if (error) throw error;
            showToast('Producto actualizado correctamente.', 'success');
        } else {
            const { error } = await supabaseClient
                .from('products')
                .insert([productPayload]);
            if (error) throw error;
            showToast('Producto agregado con éxito.', 'success');
        }

        closeProductModal();
        removedImageUrls = new Set();
        if (imageInput) imageInput.value = '';
        await loadProductsData(true);
    } catch (err) {
        console.error('Error guardando producto:', err);
        showToast(`Error al guardar el producto: ${err.message || err}`, 'error');
    } finally {
        formButton.disabled = false;
        formButton.textContent = originalLabel;
    }
}

function editProduct(productId) {
    const product = productsData.find(p => p.id == productId);
    if (product) openProductModal(product);
}

async function deleteProduct(productId) {
    if (!isAdmin) {
        showToast('No tienes permisos para eliminar productos.', 'error');
        return;
    }
    const productToDelete = productsData.find(p => p.id == productId);
    const productName = productToDelete?.title || 'este producto';
    if (!confirm(`¿Eliminar "${productName}" del catálogo?`)) return;

    try {
        const filePaths = (productToDelete?.images || [])
            .map(extractStoragePathFromUrl)
            .filter(Boolean);
        if (filePaths.length > 0) {
            try {
                const { error: removeError } = await supabaseClient
                    .storage.from('product-images')
                    .remove(filePaths);
                if (removeError && !String(removeError.message || removeError).includes('Bucket not found')) {
                    console.error('Error eliminando imágenes de Storage:', removeError);
                }
            } catch (storageErr) {
                console.warn('No se pudo acceder al bucket product-images:', storageErr);
            }
        }

        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;
        showToast('Producto eliminado correctamente.', 'success');
        await loadProductsData(true);
    } catch (err) {
        console.error('Error deleting product:', err);
        showToast('No se pudo eliminar el producto. Intenta nuevamente.', 'error');
    }
}

// --- 7. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', initDashboard);

function initDashboard() {
    setupLayoutInteractions();
    setupDashboardChrome();
    setupNavigation();
    setupReservasControls();
    setupProductsControls();
    checkSession();
}

function setupDashboardChrome() {
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            handleLogout();
        });
    }
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', () => {
            showSection('dashboard-section');
            setActiveSidebarItem('dashboard-section');
            closeSidebarOnMobile();
        });
    }
}

function setupLayoutInteractions() {
    if (sidebarToggleButton) {
        sidebarToggleButton.addEventListener('click', () => {
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                bodyElement.classList.toggle('sidebar-open');
            } else {
                bodyElement.classList.toggle('sidebar-collapsed');
            }
        });
    }
    window.addEventListener('resize', () => {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            bodyElement.classList.remove('sidebar-open');
        }
    });
    document.addEventListener('click', (event) => {
        if (!bodyElement.classList.contains('sidebar-open')) return;
        const isInsideSidebar = event.target.closest('.sidebar');
        const clickedToggle = event.target.closest('#sidebar-toggle');
        if (!isInsideSidebar && !clickedToggle) {
            bodyElement.classList.remove('sidebar-open');
        }
    });
    document.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') {
            bodyElement.classList.remove('sidebar-open');
        }
    });
}

function setupReservasControls() {
    if (btnViewCalendar) {
        btnViewCalendar.addEventListener('click', () => switchReservationView('calendar'));
    }
    if (btnViewList) {
        btnViewList.addEventListener('click', () => switchReservationView('list'));
    }
    statusFilterSelect?.addEventListener('change', renderReservasList);
    dateFilterInput?.addEventListener('change', renderReservasList);
}

function switchReservationView(view) {
    if (!calendarView || !listView || !btnViewCalendar || !btnViewList) return;
    if (currentReservasView === view) return;
    currentReservasView = view;
    const showCalendar = view === 'calendar';
    btnViewCalendar.classList.toggle('active', showCalendar);
    btnViewList.classList.toggle('active', !showCalendar);
    calendarView.classList.toggle('active', showCalendar);
    listView.classList.toggle('active', !showCalendar);
    if (showCalendar) {
        renderCalendar();
    } else {
        renderReservasList();
    }
}

function setupProductsControls() {
    addProductBtn?.addEventListener('click', () => openProductModal());
    productsEmptyCtaBtn?.addEventListener('click', () => openProductModal());
    refreshProductsBtn?.addEventListener('click', () => loadProductsData(true));
    quickAddProductBtn?.addEventListener('click', () => openProductModal());

    if (productCategorySelectInput) {
        productCategorySelectInput.addEventListener('change', (event) => {
            toggleNewCategoryInput(event.target.value === NEW_CATEGORY_VALUE);
        });
    }
    if (productSearchInput) {
        const handleSearchInput = debounce((event) => {
            productFilters.query = normalizeText(event.target.value);
            renderProductsUI();
        }, 250);
        productSearchInput.addEventListener('input', handleSearchInput);
    }
    if (productCategoryFilter) {
        productCategoryFilter.addEventListener('change', (event) => {
            productFilters.category = event.target.value;
            renderProductsUI();
        });
    }
    if (productSortSelect) {
        productSortSelect.value = productFilters.sort;
        productSortSelect.addEventListener('change', (event) => {
            productFilters.sort = event.target.value;
            renderProductsUI();
        });
    }
    if (productResetFiltersBtn) {
        productResetFiltersBtn.addEventListener('click', () => {
            productFilters.query = '';
            productFilters.category = 'all';
            productFilters.sort = 'recent';
            if (productSearchInput) productSearchInput.value = '';
            if (productCategoryFilter) productCategoryFilter.value = 'all';
            if (productSortSelect) productSortSelect.value = 'recent';
            renderProductsUI();
        });
    }
    modalProductCloseBtn?.addEventListener('click', closeProductModal);
    productForm?.addEventListener('submit', handleProductFormSubmit);
    if (imagePreviewsContainer) {
        imagePreviewsContainer.addEventListener('click', (event) => {
            const btn = event.target.closest('.remove-preview-btn');
            if (!btn) return;
            const url = btn.dataset.url;
            if (url) removedImageUrls.add(url);
            const item = btn.parentElement;
            if (item) item.remove();
        });
    }
}

// Funciones globales para onclick en HTML
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateReservaStatus = updateReservaStatus;
window.viewReserva = (id) => alert(`Reserva ${id}`);
