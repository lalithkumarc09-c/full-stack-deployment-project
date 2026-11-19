/**
 * Dynamic Product Details View Controller
 * Route: #/product/:id
 * Implements dynamic parameter extraction, multi-angle image gallery,
 * quantity stepper, specifications table, verified customer reviews, and related items.
 */
import { api } from '../api.js';
import { renderProductCard, handleProductCardAction } from '../components/productCard.js';
import { formatCurrency, renderStars } from '../utils/helpers.js';
import { icons } from '../utils/icons.js';
import { store } from '../store.js';

export class ProductView {
  constructor(params = {}) {
    this.container = document.getElementById('main-content');
    this.productId = params.id;
    this.product = null;
    this.relatedProducts = [];
    this.selectedQuantity = 1;
    this.activeImageIndex = 0;
  }

  async render() {
    this.container.innerHTML = `
      <div class="container view-loading">
        <div class="spinner"></div>
        <p>Loading product details...</p>
      </div>
    `;

    this.product = await api.getProductById(this.productId);

    if (!this.product) {
      document.title = 'Product Not Found | NovaCommerce';
      this.container.innerHTML = `
        <div class="container not-found-view">
          <div class="not-found-icon">${icons.shield}</div>
          <h2>Product Not Found</h2>
          <p>The product you are looking for (#${this.productId}) does not exist or may have been retired.</p>
          <a href="#/products" class="btn btn-primary">Return to Catalog</a>
        </div>
      `;
      return;
    }

    document.title = `${this.product.title} | NovaCommerce`;

    this.relatedProducts = await api.getRelatedProducts(this.product.id, 4);

    const isWishlisted = store.isInWishlist(this.product.id);
    const gallery = this.product.gallery && this.product.gallery.length > 0 
      ? this.product.gallery 
      : [this.product.image];

    this.container.innerHTML = `
      <div class="product-detail-wrapper">
        <!-- Breadcrumbs -->
        <div class="container">
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="#/">Home</a>
            <span class="breadcrumb-separator">${icons.chevronRight}</span>
            <a href="#/products">Catalog</a>
            <span class="breadcrumb-separator">${icons.chevronRight}</span>
            <a href="#/products?category=${encodeURIComponent(this.product.category)}">${this.product.category}</a>
            <span class="breadcrumb-separator">${icons.chevronRight}</span>
            <span class="breadcrumb-current">${this.product.title}</span>
          </nav>
        </div>

        <!-- Main Product Section -->
        <div class="container product-detail-main">
          <!-- Gallery Column -->
          <div class="detail-gallery-col">
            <div class="main-image-viewport">
              <img 
                id="main-product-img" 
                src="${gallery[0]}" 
                alt="${this.product.title}" 
                class="main-product-img" 
                width="600" 
                height="600"
              />
              ${this.product.discount ? `<span class="badge badge-discount detail-badge">-${this.product.discount}%</span>` : ''}
            </div>

            <!-- Thumbnails List -->
            <div class="gallery-thumbnails">
              ${gallery.map((imgUrl, idx) => `
                <button 
                  type="button" 
                  class="thumb-btn ${idx === 0 ? 'active' : ''}" 
                  data-thumb-idx="${idx}"
                  data-src="${imgUrl}"
                  aria-label="View product angle ${idx + 1}"
                >
                  <img src="${imgUrl}" alt="Thumbnail ${idx + 1}" width="80" height="80" />
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Product Info Column -->
          <div class="detail-info-col">
            <div class="detail-category-row">
              <span class="category-chip">${this.product.category}</span>
              ${this.product.badge ? `<span class="badge badge-accent">${this.product.badge}</span>` : ''}
            </div>

            <h1 class="detail-title">${this.product.title}</h1>

            <div class="detail-rating-row">
              ${renderStars(this.product.rating, this.product.reviewsCount)}
              <span class="divider">•</span>
              <span class="verified-buyer-tag">${icons.check} Verified Reviews</span>
            </div>

            <!-- Price Breakdown -->
            <div class="detail-price-box">
              <span class="price-current detail-price-lg">${formatCurrency(this.product.price)}</span>
              ${this.product.originalPrice ? `
                <span class="price-original detail-price-original">${formatCurrency(this.product.originalPrice)}</span>
                <span class="save-tag">Save ${formatCurrency(this.product.originalPrice - this.product.price)}</span>
              ` : ''}
            </div>

            <p class="detail-description">${this.product.description}</p>

            <!-- Inventory Status -->
            <div class="stock-status-row">
              <span class="stock-indicator ${this.product.inStock ? 'in-stock' : 'out-of-stock'}"></span>
              <span class="stock-text">
                ${this.product.inStock 
                  ? `In Stock (${this.product.stockCount || 15} available for immediate dispatch)` 
                  : 'Currently Out of Stock'}
              </span>
            </div>

            <!-- Quantity & Purchase Actions -->
            <div class="detail-actions-box">
              <div class="quantity-stepper-wrapper">
                <label for="detail-qty-input" class="qty-label">Quantity</label>
                <div class="quantity-stepper">
                  <button type="button" class="qty-btn" id="btn-qty-minus" aria-label="Decrease quantity">
                    ${icons.minus}
                  </button>
                  <input 
                    type="number" 
                    id="detail-qty-input" 
                    value="1" 
                    min="1" 
                    max="${this.product.stockCount || 99}" 
                    readonly
                  />
                  <button type="button" class="qty-btn" id="btn-qty-plus" aria-label="Increase quantity">
                    ${icons.plus}
                  </button>
                </div>
              </div>

              <div class="purchase-buttons">
                <button type="button" class="btn btn-primary btn-lg" id="btn-detail-add-cart">
                  <span class="btn-icon">${icons.cart}</span>
                  <span>Add to Cart</span>
                </button>
                <button type="button" class="btn btn-secondary btn-lg" id="btn-detail-buy-now">
                  <span>Buy Now</span>
                </button>
                <button 
                  type="button" 
                  class="btn-wishlist-icon ${isWishlisted ? 'active' : ''}" 
                  id="btn-detail-wishlist"
                  title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                  aria-label="Wishlist"
                >
                  ${isWishlisted ? icons.heartFilled : icons.heart}
                </button>
              </div>
            </div>

            <!-- Value Guarantees list -->
            <div class="detail-guarantees">
              <div class="guarantee-item">
                <span class="guarantee-icon">${icons.truck}</span>
                <span>Fast & Free Delivery on orders over $100</span>
              </div>
              <div class="guarantee-item">
                <span class="guarantee-icon">${icons.shield}</span>
                <span>Official 2-Year Full Hardware Warranty</span>
              </div>
              <div class="guarantee-item">
                <span class="guarantee-icon">${icons.rotateCcw}</span>
                <span>30-Day Risk-Free Returns & Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabbed Information Section -->
        <section class="section detail-tabs-section">
          <div class="container">
            <div class="tabs-nav" role="tablist">
              <button type="button" class="tab-btn active" data-tab="specs" role="tab">Specifications</button>
              <button type="button" class="tab-btn" data-tab="shipping" role="tab">Shipping & Returns</button>
              <button type="button" class="tab-btn" data-tab="reviews" role="tab">Reviews (${this.product.reviewsCount})</button>
            </div>

            <div class="tabs-content">
              <!-- Specifications Tab -->
              <div class="tab-pane active" id="tab-specs">
                <table class="specs-table">
                  <tbody>
                    ${this.product.specs ? Object.entries(this.product.specs).map(([key, val]) => `
                      <tr>
                        <th scope="row">${key}</th>
                        <td>${val}</td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <th>Material</th>
                        <td>Premium Engineered Components</td>
                      </tr>
                      <tr>
                        <th>Compatibility</th>
                        <td>Universal standard compliant</td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>

              <!-- Shipping Tab -->
              <div class="tab-pane" id="tab-shipping">
                <div class="shipping-info-grid">
                  <div class="shipping-card">
                    <h4>Standard Domestic Shipping</h4>
                    <p>Delivered within 3 to 5 business days via FedEx / UPS tracked service.</p>
                  </div>
                  <div class="shipping-card">
                    <h4>Express Overnight Shipping</h4>
                    <p>Order before 2 PM local time for guaranteed next-business-day delivery.</p>
                  </div>
                  <div class="shipping-card">
                    <h4>30-Day Return Guarantee</h4>
                    <p>If you're not completely satisfied, return items in original condition for a 100% refund.</p>
                  </div>
                </div>
              </div>

              <!-- Reviews Tab -->
              <div class="tab-pane" id="tab-reviews">
                <div class="reviews-list">
                  <div class="review-item">
                    <div class="review-header">
                      <div class="reviewer-meta">
                        <strong>Alex M.</strong>
                        <span class="review-badge-verified">${icons.check} Verified Purchase</span>
                      </div>
                      ${renderStars(5)}
                    </div>
                    <p class="review-body">
                      Exceeded my highest expectations! The build quality, speed, and packaging are outstanding. Highly recommended.
                    </p>
                    <span class="review-date">Reviewed 2 weeks ago</span>
                  </div>

                  <div class="review-item">
                    <div class="review-header">
                      <div class="reviewer-meta">
                        <strong>Sarah K.</strong>
                        <span class="review-badge-verified">${icons.check} Verified Purchase</span>
                      </div>
                      ${renderStars(4.8)}
                    </div>
                    <p class="review-body">
                      Impressed by the seamless performance and aesthetic appeal. Would definitely buy again from NovaCommerce.
                    </p>
                    <span class="review-date">Reviewed 1 month ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Related Products Section -->
        ${this.relatedProducts.length > 0 ? `
          <section class="section section-related">
            <div class="container">
              <div class="section-header">
                <div>
                  <span class="section-tag">You May Also Like</span>
                  <h2 class="section-title">Related Products</h2>
                </div>
              </div>

              <div class="products-grid" id="related-products-container">
                ${this.relatedProducts.map(p => renderProductCard(p, 'grid')).join('')}
              </div>
            </div>
          </section>
        ` : ''}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Gallery Thumbnails
    const mainImg = document.getElementById('main-product-img');
    document.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const newSrc = btn.getAttribute('data-src');
        if (mainImg && newSrc) {
          mainImg.style.opacity = '0.5';
          setTimeout(() => {
            mainImg.src = newSrc;
            mainImg.style.opacity = '1';
          }, 150);
        }
      });
    });

    // Quantity Stepper
    const qtyInput = document.getElementById('detail-qty-input');
    const btnMinus = document.getElementById('btn-qty-minus');
    const btnPlus = document.getElementById('btn-qty-plus');

    btnMinus?.addEventListener('click', () => {
      if (this.selectedQuantity > 1) {
        this.selectedQuantity--;
        if (qtyInput) qtyInput.value = this.selectedQuantity;
      }
    });

    btnPlus?.addEventListener('click', () => {
      const max = this.product.stockCount || 99;
      if (this.selectedQuantity < max) {
        this.selectedQuantity++;
        if (qtyInput) qtyInput.value = this.selectedQuantity;
      }
    });

    // Add to Cart button
    const btnAddCart = document.getElementById('btn-detail-add-cart');
    btnAddCart?.addEventListener('click', () => {
      store.addToCart(this.product, this.selectedQuantity);
      btnAddCart.classList.add('btn-clicked');
      setTimeout(() => btnAddCart.classList.remove('btn-clicked'), 400);
    });

    // Buy Now button
    const btnBuyNow = document.getElementById('btn-detail-buy-now');
    btnBuyNow?.addEventListener('click', () => {
      store.addToCart(this.product, this.selectedQuantity);
      window.location.hash = '#/checkout';
    });

    // Wishlist Toggle button
    const btnWishlist = document.getElementById('btn-detail-wishlist');
    btnWishlist?.addEventListener('click', () => {
      const isNowWishlisted = store.toggleWishlist(this.product);
      btnWishlist.classList.toggle('active', isNowWishlisted);
      btnWishlist.innerHTML = isNowWishlisted ? icons.heartFilled : icons.heart;
    });

    // Tabs navigation
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${target}`)?.classList.add('active');
      });
    });

    // Related products actions
    const relatedContainer = document.getElementById('related-products-container');
    relatedContainer?.addEventListener('click', (e) => handleProductCardAction(e, this.relatedProducts));
  }
}
