/**
 * Catalog View Controller
 * Manages full product catalog with multi-facet filtering (Category, Search,
 * Price range, Rating, Stock availability), Sort options, View Mode (Grid/List),
 * and dynamic Pagination.
 */
import { api } from '../api.js';
import { renderProductCard, handleProductCardAction } from '../components/productCard.js';
import { icons } from '../utils/icons.js';
import { store } from '../store.js';
import { debounce } from '../utils/helpers.js';

export class CatalogView {
  constructor(params = {}, query = {}) {
    this.container = document.getElementById('main-content');
    this.params = params;
    this.query = query;
    this.categories = [];
    this.currentProducts = [];
    this.viewMode = 'grid'; // 'grid' | 'list'
    this.currentPage = parseInt(query.page || '1', 10);
    this.itemsPerPage = 8;
  }

  async render() {
    document.title = 'Product Catalog | NovaCommerce';

    this.container.innerHTML = `
      <div class="container view-loading">
        <div class="spinner"></div>
        <p>Loading catalog products...</p>
      </div>
    `;

    this.categories = await api.getCategories();

    // Sync query parameters into store filters if present
    const activeFilters = store.getFilters();
    if (this.query.category) {
      activeFilters.category = decodeURIComponent(this.query.category);
    }
    if (this.query.q) {
      activeFilters.searchQuery = decodeURIComponent(this.query.q);
    }
    store.setFilters(activeFilters);

    this.renderLayout();
    await this.fetchAndRenderProducts();
  }

  renderLayout() {
    const filters = store.getFilters();

    this.container.innerHTML = `
      <div class="catalog-view-wrapper">
        <!-- Breadcrumbs & Header -->
        <div class="container catalog-header-section">
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="#/">Home</a>
            <span class="breadcrumb-separator">${icons.chevronRight}</span>
            <span class="breadcrumb-current">Product Catalog</span>
          </nav>

          <div class="catalog-title-row">
            <div>
              <h1 class="page-title">Explore Catalog</h1>
              <p class="page-subtitle">Discover our full collection of premium lifestyle essentials</p>
            </div>
            
            <!-- Mobile filter toggle button -->
            <button type="button" class="btn btn-outline mobile-filter-btn" id="btn-toggle-mobile-filter">
              ${icons.filter} <span>Filters</span>
            </button>
          </div>
        </div>

        <div class="container catalog-main-layout">
          <!-- Sidebar Filters -->
          <aside class="catalog-sidebar" id="catalog-sidebar">
            <div class="sidebar-header mobile-only">
              <h3>Filter Products</h3>
              <button type="button" class="icon-btn" id="btn-close-sidebar">${icons.x}</button>
            </div>

            <div class="sidebar-card">
              <!-- Search Filter -->
              <div class="filter-group">
                <label for="catalog-search" class="filter-label">Search</label>
                <div class="filter-search-box">
                  <input 
                    type="search" 
                    id="catalog-search" 
                    placeholder="Search keywords..." 
                    value="${filters.searchQuery || ''}"
                  />
                  ${icons.search}
                </div>
              </div>

              <!-- Categories Filter -->
              <div class="filter-group">
                <label class="filter-label">Categories</label>
                <div class="category-pills">
                  ${this.categories.map(cat => `
                    <button 
                      type="button" 
                      class="category-pill ${filters.category.toLowerCase() === cat.toLowerCase() ? 'active' : ''}" 
                      data-category="${cat}"
                    >
                      ${cat}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Price Range Filter -->
              <div class="filter-group">
                <div class="filter-label-row">
                  <label for="filter-price-range" class="filter-label">Max Price</label>
                  <span id="price-range-display" class="filter-value-display">$${filters.maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  id="filter-price-range" 
                  min="20" 
                  max="500" 
                  step="10" 
                  value="${filters.maxPrice}" 
                  class="price-range-slider"
                />
                <div class="range-limits">
                  <span>$20</span>
                  <span>$500</span>
                </div>
              </div>

              <!-- Minimum Rating Filter -->
              <div class="filter-group">
                <label class="filter-label">Customer Rating</label>
                <div class="rating-filter-options">
                  <label class="rating-radio">
                    <input type="radio" name="rating-filter" value="0" ${filters.minRating === 0 ? 'checked' : ''} />
                    <span>All Ratings</span>
                  </label>
                  <label class="rating-radio">
                    <input type="radio" name="rating-filter" value="4.5" ${filters.minRating === 4.5 ? 'checked' : ''} />
                    <span>4.5 & up ★</span>
                  </label>
                  <label class="rating-radio">
                    <input type="radio" name="rating-filter" value="4.0" ${filters.minRating === 4.0 ? 'checked' : ''} />
                    <span>4.0 & up ★</span>
                  </label>
                </div>
              </div>

              <!-- Stock Availability -->
              <div class="filter-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="filter-instock" ${filters.inStockOnly ? 'checked' : ''} />
                  <span>In Stock Only</span>
                </label>
              </div>

              <!-- Reset Button -->
              <button type="button" class="btn btn-outline btn-block" id="btn-reset-filters">
                Reset All Filters
              </button>
            </div>
          </aside>

          <!-- Catalog Content Area -->
          <div class="catalog-content-col">
            <!-- Controls Bar: Item count, Sorting, View Toggle -->
            <div class="catalog-controls-bar">
              <div class="catalog-results-count" id="catalog-results-count">
                Loading products...
              </div>

              <div class="catalog-controls-right">
                <!-- Sort Dropdown -->
                <div class="sort-selector-wrapper">
                  <label for="catalog-sort">Sort by:</label>
                  <select id="catalog-sort" class="select-input">
                    <option value="featured" ${filters.sortBy === 'featured' ? 'selected' : ''}>Featured</option>
                    <option value="price-asc" ${filters.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                    <option value="price-desc" ${filters.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                    <option value="rating-desc" ${filters.sortBy === 'rating-desc' ? 'selected' : ''}>Customer Rating</option>
                    <option value="title-asc" ${filters.sortBy === 'title-asc' ? 'selected' : ''}>Name: A to Z</option>
                  </select>
                </div>

                <!-- View Mode Switcher -->
                <div class="view-mode-toggle" role="group" aria-label="Catalog Layout">
                  <button 
                    type="button" 
                    class="view-mode-btn ${this.viewMode === 'grid' ? 'active' : ''}" 
                    id="btn-view-grid" 
                    title="Grid View"
                    aria-label="Grid View"
                  >
                    ${icons.grid}
                  </button>
                  <button 
                    type="button" 
                    class="view-mode-btn ${this.viewMode === 'list' ? 'active' : ''}" 
                    id="btn-view-list" 
                    title="List View"
                    aria-label="List View"
                  >
                    ${icons.list}
                  </button>
                </div>
              </div>
            </div>

            <!-- Products Grid / List Mount -->
            <div id="catalog-products-container" class="products-container products-${this.viewMode}">
              <!-- Rendered dynamically -->
            </div>

            <!-- Dynamic Pagination Container -->
            <div id="catalog-pagination-container" class="pagination-wrapper">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  async fetchAndRenderProducts() {
    const filters = store.getFilters();
    const container = document.getElementById('catalog-products-container');
    const countDisplay = document.getElementById('catalog-results-count');
    const paginationContainer = document.getElementById('catalog-pagination-container');

    if (!container) return;

    container.innerHTML = `
      <div class="products-loading-state">
        <div class="spinner"></div>
        <p>Filtering items...</p>
      </div>
    `;

    const result = await api.queryProducts({
      category: filters.category,
      searchQuery: filters.searchQuery,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      inStockOnly: filters.inStockOnly,
      sortBy: filters.sortBy,
      page: this.currentPage,
      limit: this.itemsPerPage
    });

    this.currentProducts = result.items;

    if (countDisplay) {
      countDisplay.innerHTML = `Showing <strong>${result.items.length}</strong> of <strong>${result.pagination.totalItems}</strong> products`;
    }

    if (result.items.length === 0) {
      container.innerHTML = `
        <div class="empty-catalog-state">
          <div class="empty-icon">${icons.search}</div>
          <h3>No products match your criteria</h3>
          <p>Try clearing active filters or modifying your search query.</p>
          <button type="button" class="btn btn-primary" id="btn-empty-reset">
            Clear Filters
          </button>
        </div>
      `;
      document.getElementById('btn-empty-reset')?.addEventListener('click', () => {
        store.resetFilters();
        this.currentPage = 1;
        this.renderLayout();
        this.fetchAndRenderProducts();
      });
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    container.className = `products-container products-${this.viewMode}`;
    container.innerHTML = result.items.map(p => renderProductCard(p, this.viewMode)).join('');

    this.renderPagination(result.pagination, paginationContainer);
  }

  renderPagination(pagination, container) {
    if (!container || pagination.totalPages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }

    let pagesHtml = '';
    for (let i = 1; i <= pagination.totalPages; i++) {
      pagesHtml += `
        <button 
          type="button" 
          class="pagination-btn ${i === pagination.currentPage ? 'active' : ''}" 
          data-page="${i}"
        >
          ${i}
        </button>
      `;
    }

    container.innerHTML = `
      <nav class="pagination-nav" aria-label="Pagination">
        <button 
          type="button" 
          class="pagination-btn pagination-arrow" 
          data-page="${pagination.currentPage - 1}" 
          ${!pagination.hasPrev ? 'disabled' : ''}
          aria-label="Previous page"
        >
          ${icons.chevronLeft} Prev
        </button>

        <div class="pagination-numbers">
          ${pagesHtml}
        </div>

        <button 
          type="button" 
          class="pagination-btn pagination-arrow" 
          data-page="${pagination.currentPage + 1}" 
          ${!pagination.hasNext ? 'disabled' : ''}
          aria-label="Next page"
        >
          Next ${icons.chevronRight}
        </button>
      </nav>
    `;

    container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'), 10);
        if (page && page !== this.currentPage && !btn.hasAttribute('disabled')) {
          this.currentPage = page;
          this.fetchAndRenderProducts();
          window.scrollTo({ top: 180, behavior: 'smooth' });
        }
      });
    });
  }

  bindEvents() {
    // Product cards interactions
    const productsContainer = document.getElementById('catalog-products-container');
    productsContainer?.addEventListener('click', (e) => handleProductCardAction(e, this.currentProducts));

    // Category pills filter
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const category = pill.getAttribute('data-category');
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        store.setFilters({ category });
        this.currentPage = 1;
        this.fetchAndRenderProducts();
      });
    });

    // Search filter input with debounce
    const searchInput = document.getElementById('catalog-search');
    const debouncedSearch = debounce((query) => {
      store.setFilters({ searchQuery: query });
      this.currentPage = 1;
      this.fetchAndRenderProducts();
    }, 280);

    searchInput?.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });

    // Price range slider
    const priceSlider = document.getElementById('filter-price-range');
    const priceDisplay = document.getElementById('price-range-display');
    priceSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (priceDisplay) priceDisplay.textContent = `$${val}`;
    });
    priceSlider?.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      store.setFilters({ maxPrice: val });
      this.currentPage = 1;
      this.fetchAndRenderProducts();
    });

    // Rating filter radios
    document.querySelectorAll('input[name="rating-filter"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const rating = parseFloat(e.target.value);
        store.setFilters({ minRating: rating });
        this.currentPage = 1;
        this.fetchAndRenderProducts();
      });
    });

    // In-Stock checkbox
    const inStockCheck = document.getElementById('filter-instock');
    inStockCheck?.addEventListener('change', (e) => {
      store.setFilters({ inStockOnly: e.target.checked });
      this.currentPage = 1;
      this.fetchAndRenderProducts();
    });

    // Sort select
    const sortSelect = document.getElementById('catalog-sort');
    sortSelect?.addEventListener('change', (e) => {
      store.setFilters({ sortBy: e.target.value });
      this.fetchAndRenderProducts();
    });

    // View Mode toggles
    const gridBtn = document.getElementById('btn-view-grid');
    const listBtn = document.getElementById('btn-view-list');

    gridBtn?.addEventListener('click', () => {
      this.viewMode = 'grid';
      gridBtn.classList.add('active');
      listBtn?.classList.remove('active');
      const cont = document.getElementById('catalog-products-container');
      if (cont) {
        cont.className = 'products-container products-grid';
        cont.innerHTML = this.currentProducts.map(p => renderProductCard(p, 'grid')).join('');
      }
    });

    listBtn?.addEventListener('click', () => {
      this.viewMode = 'list';
      listBtn.classList.add('active');
      gridBtn?.classList.remove('active');
      const cont = document.getElementById('catalog-products-container');
      if (cont) {
        cont.className = 'products-container products-list';
        cont.innerHTML = this.currentProducts.map(p => renderProductCard(p, 'list')).join('');
      }
    });

    // Reset Filters button
    const resetBtn = document.getElementById('btn-reset-filters');
    resetBtn?.addEventListener('click', () => {
      store.resetFilters();
      this.currentPage = 1;
      this.renderLayout();
      this.fetchAndRenderProducts();
    });

    // Mobile filter sidebar drawer toggle
    const toggleMobileBtn = document.getElementById('btn-toggle-mobile-filter');
    const closeSidebarBtn = document.getElementById('btn-close-sidebar');
    const sidebar = document.getElementById('catalog-sidebar');

    toggleMobileBtn?.addEventListener('click', () => {
      sidebar?.classList.add('mobile-open');
    });

    closeSidebarBtn?.addEventListener('click', () => {
      sidebar?.classList.remove('mobile-open');
    });
  }
}
