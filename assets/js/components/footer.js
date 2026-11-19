/**
 * Global Footer Component
 * Renders trust badges, categorized navigation links, newsletter signup, and project metadata.
 */
import { icons } from '../utils/icons.js';
import { store } from '../store.js';

export class Footer {
  constructor() {
    this.container = document.getElementById('footer-mount');
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <footer class="site-footer">
        <!-- Trust / Benefits Grid -->
        <div class="footer-benefits">
          <div class="container benefits-grid">
            <div class="benefit-card">
              <div class="benefit-icon">${icons.truck}</div>
              <div class="benefit-text">
                <h4>Free Fast Delivery</h4>
                <p>On all domestic orders over $100</p>
              </div>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">${icons.shield}</div>
              <div class="benefit-text">
                <h4>2-Year Warranty</h4>
                <p>Comprehensive manufacturer guarantee</p>
              </div>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">${icons.rotateCcw}</div>
              <div class="benefit-text">
                <h4>30-Day Easy Returns</h4>
                <p>Hassle-free refunds & exchanges</p>
              </div>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">${icons.lock}</div>
              <div class="benefit-text">
                <h4>Encrypted Checkout</h4>
                <p>256-bit SSL secured payments</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Footer Links & Newsletter -->
        <div class="footer-main">
          <div class="container footer-grid">
            <div class="footer-col brand-col">
              <div class="footer-brand">
                <span class="brand-icon">${icons.sparkles}</span>
                <span class="brand-name">Nova<strong>Commerce</strong></span>
              </div>
              <p class="footer-bio">
                A modern, high-performance modular e-commerce web platform engineered for seamless client-side routing, optimized digital assets, and production cloud deployment.
              </p>
              <div class="deployment-badge">
                <span class="status-indicator"></span>
                <span>Production Ready • Vercel / Netlify / Render</span>
              </div>
            </div>

            <div class="footer-col">
              <h5 class="footer-heading">Catalog Navigation</h5>
              <ul class="footer-links">
                <li><a href="#/products">All Products</a></li>
                <li><a href="#/products?category=Electronics">Electronics & Audio</a></li>
                <li><a href="#/products?category=Fashion">Fashion & Apparel</a></li>
                <li><a href="#/products?category=Home%20%26%20Living">Home & Living</a></li>
                <li><a href="#/products?category=Accessories">Accessories</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h5 class="footer-heading">Capstone & System</h5>
              <ul class="footer-links">
                <li><a href="#/architecture">Architecture Overview</a></li>
                <li><a href="#/architecture#routing">Client-Side Routing</a></li>
                <li><a href="#/architecture#state">State Management</a></li>
                <li><a href="#/architecture#performance">Asset Optimization</a></li>
                <li><a href="#/architecture#deployment">CI/CD & Hosting</a></li>
              </ul>
            </div>

            <div class="footer-col newsletter-col">
              <h5 class="footer-heading">Stay in the Loop</h5>
              <p class="footer-subtext">Subscribe to receive exclusive deals, new collection alerts, and 10% off your next order.</p>
              <form id="footer-newsletter-form" class="newsletter-form">
                <input 
                  type="email" 
                  id="newsletter-email" 
                  placeholder="Enter your email address" 
                  required 
                  aria-label="Email address for newsletter"
                />
                <button type="submit" class="btn btn-primary">Join</button>
              </form>
            </div>
          </div>
        </div>

        <!-- Sub-footer Bottom Bar -->
        <div class="footer-bottom">
          <div class="container footer-bottom-inner">
            <p class="copyright-text">
              &copy; ${new Date().getFullYear()} NovaCommerce Capstone Project. Engineered for Academic & Production Web Deployment.
            </p>
            <div class="bottom-badges">
              <span class="badge-tag">ES6+ Modules</span>
              <span class="badge-tag">Client-Side SPA</span>
              <span class="badge-tag">Zero Bundler Friction</span>
              <span class="badge-tag">Lighthouse 95+</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  bindEvents() {
    const form = document.getElementById('footer-newsletter-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newsletter-email');
      const email = input?.value;
      if (email) {
        store.emit('toast:show', {
          type: 'success',
          title: 'Subscribed!',
          message: `Thank you for joining NovaCommerce VIP! Use promo code WELCOME10.`
        });
        form.reset();
      }
    });
  }
}
