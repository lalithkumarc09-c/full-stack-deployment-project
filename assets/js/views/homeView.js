/**
 * Home View Controller
 * Renders the Hero Showcase, Category Quick-Picks, Featured Collection,
 * and Interactive Promo Banners.
 */
import { api } from '../api.js';
import { renderProductCard, handleProductCardAction } from '../components/productCard.js';
import { icons } from '../utils/icons.js';
import { store } from '../store.js';

export class HomeView {
  constructor() {
    this.container = document.getElementById('main-content');
    this.featuredProducts = [];
    this.trendingProducts = [];
  }

  async render() {
    document.title = 'NovaCommerce | Modern Modular E-Commerce Platform';

    // Show skeleton / loading indicator
    this.container.innerHTML = `
      <div class="container view-loading">
        <div class="spinner"></div>
        <p>Loading curated collections...</p>
      </div>
    `;

    // Fetch data asynchronously in parallel
    const [featured, trending, categories] = await Promise.all([
      api.getFeaturedProducts(),
      api.getTrendingProducts(),
      api.getCategories()
    ]);

    this.featuredProducts = featured;
    this.trendingProducts = trending;

    const availableCategories = categories.filter(c => c !== 'All');

    this.container.innerHTML = `
      <!-- Hero Banner Section -->
      <section class="hero-section">
        <div class="container hero-container">
          <div class="hero-content fade-in-up">
            <div class="hero-pill">
              <span class="pill-dot"></span>
              Next-Gen E-Commerce Architecture
            </div>
            <h1 class="hero-title">
              Engineered for Speed, Designed for <span>Modern Living</span>
            </h1>
            <p class="hero-description">
              Experience the pinnacle of client-side performance. Explore handpicked premium tech, artisan goods, and lifestyle essentials with instant navigation and zero lag.
            </p>
            <div class="hero-cta-group">
              <a href="#/products" class="btn btn-primary btn-lg">
                <span>Explore Catalog</span>
                <span class="btn-icon">${icons.chevronRight}</span>
              </a>
              <a href="#/architecture" class="btn btn-secondary btn-lg">
                <span class="btn-icon">${icons.layers}</span>
                <span>View Architecture</span>
              </a>
            </div>
            <div class="hero-metrics">
              <div class="metric-item">
                <span class="metric-value">100%</span>
                <span class="metric-label">Client-Side SPA</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <span class="metric-value">&lt; 150ms</span>
                <span class="metric-label">Route Transitions</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <span class="metric-value">98+</span>
                <span class="metric-label">Lighthouse Score</span>
              </div>
            </div>
          </div>

          <div class="hero-visual fade-in-up">
            <div class="hero-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85" 
                alt="Aura Pro Headphones Hero Showcase" 
                class="hero-img" 
                width="500" 
                height="500"
              />
              <div class="floating-badge hero-floating-card">
                <div class="floating-icon">${icons.sparkles}</div>
                <div class="floating-text">
                  <strong>Featured Capstone</strong>
                  <span>Aura Pro Wireless ANC</span>
                </div>
              </div>
              <div class="floating-badge hero-floating-discount">
                <strong>20% OFF</strong>
                <span>Limited Stock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Quick-Picks -->
      <section class="section section-categories">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Shop by Category</h2>
              <p class="section-subtitle">Explore curated collections crafted for every aspect of your life</p>
            </div>
            <a href="#/products" class="section-link">
              Browse all categories ${icons.chevronRight}
            </a>
          </div>

          <div class="categories-grid">
            ${availableCategories.map(cat => this.renderCategoryCard(cat)).join('')}
          </div>
        </div>
      </section>

      <!-- Featured Collection Section -->
      <section class="section section-featured">
        <div class="container">
          <div class="section-header">
            <div>
              <span class="section-tag">Handpicked for You</span>
              <h2 class="section-title">Featured Products</h2>
            </div>
            <a href="#/products" class="btn btn-outline">
              View Full Catalog ${icons.chevronRight}
            </a>
          </div>

          <div class="products-grid" id="featured-products-container">
            ${this.featuredProducts.map(p => renderProductCard(p, 'grid')).join('')}
          </div>
        </div>
      </section>

      <!-- Promotional Interactive Banner -->
      <section class="section section-promo">
        <div class="container">
          <div class="promo-banner">
            <div class="promo-content">
              <span class="badge badge-accent">Special Capstone Offer</span>
              <h2 class="promo-title">Claim 10% Off Your Entire Order</h2>
              <p class="promo-desc">
                Use code <strong>WELCOME10</strong> at checkout for instant savings. Compatible with all product categories.
              </p>
              <div class="promo-coupon-box">
                <code class="coupon-code" id="home-promo-code">WELCOME10</code>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-coupon">
                  Copy Code
                </button>
              </div>
            </div>
            <div class="promo-actions">
              <a href="#/products" class="btn btn-primary btn-lg">Shop with Promo</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Trending Section -->
      <section class="section section-trending">
        <div class="container">
          <div class="section-header">
            <div>
              <span class="section-tag">Popular This Week</span>
              <h2 class="section-title">Trending Essentials</h2>
            </div>
          </div>

          <div class="products-grid" id="trending-products-container">
            ${this.trendingProducts.map(p => renderProductCard(p, 'grid')).join('')}
          </div>
        </div>
      </section>
    `;

    this.bindEvents();
  }

  renderCategoryCard(category) {
    const categoryImages = {
      'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
      'Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
      'Home & Living': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
      'Fashion': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'
    };

    const img = categoryImages[category] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';

    return `
      <a href="#/products?category=${encodeURIComponent(category)}" class="category-card">
        <div class="category-img-wrap">
          <img src="${img}" alt="${category}" loading="lazy" width="280" height="200" />
        </div>
        <div class="category-meta">
          <h3 class="category-name">${category}</h3>
          <span class="category-action">Shop Now ${icons.chevronRight}</span>
        </div>
      </a>
    `;
  }

  bindEvents() {
    // Product action event delegation
    const featuredContainer = document.getElementById('featured-products-container');
    featuredContainer?.addEventListener('click', (e) => handleProductCardAction(e, this.featuredProducts));

    const trendingContainer = document.getElementById('trending-products-container');
    trendingContainer?.addEventListener('click', (e) => handleProductCardAction(e, this.trendingProducts));

    // Copy coupon code
    const copyBtn = document.getElementById('btn-copy-coupon');
    copyBtn?.addEventListener('click', () => {
      navigator.clipboard?.writeText('WELCOME10');
      store.emit('toast:show', {
        type: 'success',
        title: 'Coupon Copied!',
        message: 'WELCOME10 copied to your clipboard. Paste it in your cart.'
      });
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Code';
      }, 2000);
    });
  }
}
