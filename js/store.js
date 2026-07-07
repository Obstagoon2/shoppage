/**
 * Team 1912 Store — Fourthwall Storefront API integration
 * Fetches products from the "all" collection and renders responsive product cards.
 */

const CONFIG = {
    /** Storefront token from Fourthwall Settings > For Developers */
    STOREFRONT_TOKEN: 'YOUR_STOREFRONT_TOKEN_HERE',
    /** Fourthwall shop URL used for "View Product" links (no trailing slash) */
    SHOP_URL: 'https://team1912combustion-shop.fourthwall.com',
    /** Base URL for the Storefront API */
    API_BASE_URL: 'https://storefront-api.fourthwall.com/v1',
    /** Collection slug — "all" contains every public product */
    COLLECTION_SLUG: 'all',
    /** ISO currency code for price display */
    CURRENCY: 'USD',
    /** Products fetched per API page */
    PAGE_SIZE: 50,
    /** Max characters for the short description shown on cards */
    DESCRIPTION_MAX_LENGTH: 120
};

/* ------------------------------------------------------------------ */
/*  API layer                                                          */
/* ------------------------------------------------------------------ */

/**
 * Builds a Storefront API URL with the storefront token appended.
 * @param {string} path - API path relative to API_BASE_URL (e.g. "/collections/all/products")
 * @param {Record<string, string|number>} [params] - Additional query parameters
 * @returns {string}
 */
function buildApiUrl(path, params = {}) {
    const url = new URL(`${CONFIG.API_BASE_URL}${path}`);
    url.searchParams.set('storefront_token', CONFIG.STOREFRONT_TOKEN);
    url.searchParams.set('currency', CONFIG.CURRENCY);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
    });

    return url.toString();
}

/**
 * Fetches a single page of products from a collection.
 * @param {number} page - Zero-based page index
 * @returns {Promise<{ results: object[], paging: object }>}
 */
async function fetchCollectionProductsPage(page) {
    const url = buildApiUrl(`/collections/${CONFIG.COLLECTION_SLUG}/products`, {
        page,
        size: CONFIG.PAGE_SIZE
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API request failed (${response.status}): ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetches all products from the configured collection, handling pagination.
 * @returns {Promise<object[]>}
 */
async function fetchAllProducts() {
    const products = [];
    let page = 0;
    let hasNextPage = true;

    while (hasNextPage) {
        const data = await fetchCollectionProductsPage(page);
        products.push(...(data.results || []));
        hasNextPage = Boolean(data.paging?.hasNextPage);
        page += 1;
    }

    return products;
}

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Strips HTML tags and collapses whitespace from a string.
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

/**
 * Returns a truncated plain-text description suitable for card display.
 * @param {string} description - Raw product description (may contain HTML)
 * @returns {string}
 */
function getShortDescription(description) {
    if (!description) return '';

    const plain = stripHtml(description);
    if (plain.length <= CONFIG.DESCRIPTION_MAX_LENGTH) return plain;

    return `${plain.slice(0, CONFIG.DESCRIPTION_MAX_LENGTH).trim()}…`;
}

/**
 * Formats a Fourthwall Money object as a localized currency string.
 * @param {{ value: number, currency: string }|undefined} money
 * @returns {string}
 */
function formatPrice(money) {
    if (!money || typeof money.value !== 'number') return '';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: money.currency || CONFIG.CURRENCY
    }).format(money.value);
}

/**
 * Derives the display price for a product from its variants.
 * Shows a single price or a range when variants differ.
 * @param {object} product
 * @returns {string}
 */
function getProductPrice(product) {
    const variants = product.variants || [];
    if (variants.length === 0) return '';

    const prices = variants
        .map((variant) => variant.unitPrice?.value)
        .filter((value) => typeof value === 'number');

    if (prices.length === 0) return '';

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) {
        return formatPrice({ value: min, currency: variants[0].unitPrice.currency });
    }

    const currency = variants[0].unitPrice.currency || CONFIG.CURRENCY;
    return `${formatPrice({ value: min, currency })} – ${formatPrice({ value: max, currency })}`;
}

/**
 * Returns the best available image URL for a product.
 * @param {object} product
 * @returns {string|null}
 */
function getProductImageUrl(product) {
    const images = product.images || [];
    if (images.length === 0) return null;

    const image = images[0];
    return image.transformedUrl || image.url || null;
}

/**
 * Builds the external product page URL on the Fourthwall shop.
 * @param {object} product
 * @returns {string}
 */
function getProductUrl(product) {
    const base = CONFIG.SHOP_URL.replace(/\/$/, '');
    return `${base}/products/${product.slug}`;
}

/**
 * Escapes text for safe insertion into HTML templates.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    const el = document.createElement('span');
    el.textContent = text;
    return el.innerHTML;
}

/* ------------------------------------------------------------------ */
/*  DOM rendering                                                      */
/* ------------------------------------------------------------------ */

/** @type {Record<string, HTMLElement|null>} */
const elements = {
    loading: null,
    error: null,
    empty: null,
    grid: null,
    errorMessage: null,
    retryBtn: null
};

/**
 * Caches DOM references once the document is ready.
 */
function cacheElements() {
    elements.loading = document.getElementById('store-loading');
    elements.error = document.getElementById('store-error');
    elements.empty = document.getElementById('store-empty');
    elements.grid = document.getElementById('store-grid');
    elements.errorMessage = document.getElementById('store-error-message');
    elements.retryBtn = document.getElementById('store-retry-btn');
}

/**
 * Shows exactly one store state panel and toggles the product grid.
 * @param {'loading'|'error'|'empty'|'grid'} state
 */
function showState(state) {
    const stateMap = {
        loading: elements.loading,
        error: elements.error,
        empty: elements.empty,
        grid: elements.grid
    };

    Object.entries(stateMap).forEach(([key, el]) => {
        if (!el) return;
        el.hidden = key !== state;
    });
}

/**
 * Creates the HTML markup for a single product card.
 * @param {object} product
 * @returns {string}
 */
function createProductCardHtml(product) {
    const name = escapeHtml(product.name);
    const price = escapeHtml(getProductPrice(product));
    const shortDescription = getShortDescription(product.description);
    const descriptionHtml = shortDescription
        ? `<p class="store-card-description">${escapeHtml(shortDescription)}</p>`
        : '';
    const imageUrl = getProductImageUrl(product);
    const productUrl = getProductUrl(product);

    const imageHtml = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="${name}" loading="lazy" decoding="async">`
        : `<div class="store-card-placeholder" aria-hidden="true"><span>No Image</span></div>`;

    return `
        <article class="store-card">
            <div class="store-card-image">
                ${imageHtml}
            </div>
            <div class="store-card-info">
                <h2 class="store-card-name">${name}</h2>
                ${price ? `<p class="store-card-price">${price}</p>` : ''}
                ${descriptionHtml}
                <a href="${escapeHtml(productUrl)}" class="store-btn store-btn-primary" target="_blank" rel="noopener noreferrer">
                    View Product
                </a>
            </div>
        </article>
    `;
}

/**
 * Renders product cards into the grid container.
 * @param {object[]} products
 */
function renderProducts(products) {
    if (!elements.grid) return;

    elements.grid.innerHTML = products.map(createProductCardHtml).join('');
    showState('grid');
    initCardAnimations();
}

/**
 * Displays the error state with an optional custom message.
 * @param {string} [message]
 */
function showError(message) {
    if (elements.errorMessage && message) {
        elements.errorMessage.textContent = message;
    }
    showState('error');
}

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */

/** @type {IntersectionObserver|null} */
let cardObserver = null;

/**
 * Sets up IntersectionObserver to fade-in product cards on scroll,
 * matching the animation pattern used on the robots page.
 */
function initCardAnimations() {
    if (cardObserver) {
        cardObserver.disconnect();
    }

    cardObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        entry.target.classList.add('animate');
                    });
                    cardObserver.unobserve(entry.target);
                }
            });
        },
        {
            root: null,
            rootMargin: '50px',
            threshold: 0.15
        }
    );

    document.querySelectorAll('.store-card').forEach((card) => {
        cardObserver.observe(card);
    });
}

/* ------------------------------------------------------------------ */
/*  Initialization                                                     */
/* ------------------------------------------------------------------ */

/**
 * Validates that required configuration values are present.
 * @returns {string|null} Error message, or null if config is valid
 */
function validateConfig() {
    if (!CONFIG.STOREFRONT_TOKEN || CONFIG.STOREFRONT_TOKEN === 'YOUR_STOREFRONT_TOKEN_HERE') {
        return 'Storefront token is not configured. Add your token to CONFIG in js/store.js.';
    }

    if (!CONFIG.SHOP_URL || CONFIG.SHOP_URL.includes('YOUR_SHOP')) {
        return 'Shop URL is not configured. Add your Fourthwall shop URL to CONFIG in js/store.js.';
    }

    return null;
}

/**
 * Main entry point — fetches products and renders the store.
 */
async function loadStore() {
    showState('loading');

    const configError = validateConfig();
    if (configError) {
        showError(configError);
        return;
    }

    try {
        const products = await fetchAllProducts();

        if (products.length === 0) {
            showState('empty');
            return;
        }

        renderProducts(products);
    } catch (error) {
        console.error('[Store] Failed to load products:', error);
        showError(
            error instanceof Error
                ? error.message
                : 'Something went wrong while fetching the store catalog. Please try again later.'
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cacheElements();

    if (elements.retryBtn) {
        elements.retryBtn.addEventListener('click', loadStore);
    }

    loadStore();
});
