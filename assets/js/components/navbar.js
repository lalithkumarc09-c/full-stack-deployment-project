/**
 * Dynamic Navbar Component
 * Features real-time cart/wishlist counters, global search bar,
 * theme toggle, and mobile responsive navigation drawer.
 */
import { icons } from '../utils/icons.js';
import { store } from '../store.js';

export class Navbar {
  constructor() {
    this.container = document.getElementById('navbar-mount');
    this.isMobileMenuOpen = false;
    this.render();
    this.bindEvents();
  }

  render() {
    const currentTheme = store.state.theme;
    const cartCount = store.getCartCount();
    const wishlistCount = store.getWishlistCount();

    this.container.innerHTML = `
      <header class="site-header">
        <!-- Top Announcement Bar -->
        <div class="announcement-bar">
          <div class="container announcement-inner">
            <span class="announcement-text">
              <span class="sparkle-icon">${icons.sparkles}</span>
              Free Express Shipping on Orders Over $100 | Use Code <strong>WELCOME10</strong> for 10% Off
            </span>
            <div class="announcement-links">
              <a href="#/architecture" class="announcement-pill">
                ${icons.layers} Capstone Architecture
              </a>
            </div>
          </div>
        </div>

        <!-- Main Header Nav -->
        <div class="main-header">
          <div class="container header-inner">
            <!-- Brand Logo -->
            <a href="#/" class="brand-logo" aria-label="NovaCommerce Home">
              <span class="brand-icon">${icons.sparkles}</span>
              <span class="brand-name">Nova<strong>Commerce</strong></span>
            </a>

            <!-- Search Bar -->
            <div class="header-search">
              <form id="global-search-form" class="search-form" role="search">
                <input 
                  type="search" 
                  id="global-search-input" 
                  placeholder="Search over thousands of premium products..." 
                  autocomplete="off"
                  aria-label="Search products"
                />
                <button type="submit" class="search-submit" aria-label="Submit search">
                  ${icons.search}
                </button>
              </form>
            </div>

            <!-- Primary Nav Links (Desktop) -->
            <nav class="nav-links desktop-nav" aria-label="Primary Navigation">
              <a href="#/" class="nav-link" data-route="">Home</a>
              <a href="#/products" class="nav-link" data-route="products">Products</a>
              <a href="#/architecture" class="nav-link nav-highlight" data-route="architecture">
                ${icons.layers} Architecture
              </a>
            </nav>

            <!-- Actions (Theme, Wishlist, Cart) -->
            <div class="header-actions">
              <!-- Theme Toggle -->
              <button 
                type="button" 
                id="btn-theme-toggle" 
                class="icon-btn theme-toggle-btn" 
                title="Toggle Dark/Light Mode"
                aria-label="Toggle Dark/Light Mode"
              >
                ${currentTheme === 'dark' ? icons.sun : icons.moon}
              </button>

              <!-- Wishlist Link -->
              <a href="#/wishlist" class="icon-btn wishlist-btn" title="Saved Wishlist" aria-label="Wishlist">
                ${icons.heart}
                <span id="nav-wishlist-badge" class="badge-counter ${wishlistCount > 0 ? 'visible' : ''}">
                  ${wishlistCount}
                </span>
              </a>

              <!-- Cart Link -->
              <a href="#/cart" class="icon-btn cart-btn" title="Shopping Cart" aria-label="Cart">
                ${icons.cart}
                <span id="nav-cart-badge" class="badge-counter ${cartCount > 0 ? 'visible' : ''}">
                  ${cartCount}
                </span>
              </a>

              <!-- Mobile Hamburger Button -->
              <button 
                type="button" 
                id="btn-mobile-menu" 
                class="icon-btn mobile-menu-toggle" 
                aria-label="Open Mobile Menu"
                aria-expanded="false"
              >
                ${icons.menu}
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Drawer Menu -->
        <div id="mobile-nav-drawer" class="mobile-nav-drawer" aria-hidden="true">
          <div class="mobile-nav-overlay" id="mobile-nav-overlay"></div>
          <div class="mobile-nav-content">
            <div class="mobile-nav-header">
              <span class="brand-name">Nova<strong>Commerce</strong></span>
              <button type="button" id="btn-close-mobile-nav" class="icon-btn" aria-label="Close Navigation">
                ${icons.x}
              </button>
            </div>
            
            <form id="mobile-search-form" class="mobile-search-form">
              <input type="search" id="mobile-search-input" placeholder="Search products..." />
              <button type="submit">${icons.search}</button>
            </form>

            <nav class="mobile-links">
              <a href="#/" class="mobile-nav-link" data-route="">Home</a>
              <a href="#/products" class="mobile-nav-link" data-route="products">Browse Catalog</a>
              <a href="#/cart" class="mobile-nav-link" data-route="cart">My Cart (${cartCount})</a>
              <a href="#/wishlist" class="mobile-nav-link" data-route="wishlist">Wishlist (${wishlistCount})</a>
              <a href="#/architecture" class="mobile-nav-link nav-highlight" data-route="architecture">
                System Architecture & Deployment Docs
              </a>
            </nav>
          </div>
        </div>
      </header>
    `;
  }

  bindEvents() {
    // Theme toggle
    const themeBtn = document.getElementById('btn-theme-toggle');
    themeBtn?.addEventListener('click', () => {
      store.toggleTheme();
    });

    store.subscribe('theme:change', (newTheme) => {
      if (themeBtn) {
        themeBtn.innerHTML = newTheme === 'dark' ? icons.sun : icons.moon;
      }
    });

    // Cart Badge Updates
    store.subscribe('cart:updated', () => {
      const badge = document.getElementById('nav-cart-badge');
      const count = store.getCartCount();
      if (badge) {
        badge.textContent = count;
        badge.classList.toggle('visible', count > 0);
        // Pulse badge
        badge.classList.add('pulse');
        setTimeout(() => badge.classList.remove('pulse'), 400);
      }
    });

    // Wishlist Badge Updates
    store.subscribe('wishlist:updated', () => {
      const badge = document.getElementById('nav-wishlist-badge');
      const count = store.getWishlistCount();
      if (badge) {
        badge.textContent = count;
        badge.classList.toggle('visible', count > 0);
        badge.classList.add('pulse');
        setTimeout(() => badge.classList.remove('pulse'), 400);
      }
    });

    // Desktop Search Submission
    const searchForm = document.getElementById('global-search-form');
    searchForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('global-search-input');
      const query = (input?.value || '').trim();
      if (query) {
        store.setFilters({ searchQuery: query });
        window.location.hash = `#/products?q=${encodeURIComponent(query)}`;
      } else {
        window.location.hash = '#/products';
      }
    });

    // Mobile Search Submission
    const mobileForm = document.getElementById('mobile-search-form');
    mobileForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('mobile-search-input');
      const query = (input?.value || '').trim();
      this.closeMobileMenu();
      if (query) {
        store.setFilters({ searchQuery: query });
        window.location.hash = `#/products?q=${encodeURIComponent(query)}`;
      } else {
        window.location.hash = '#/products';
      }
    });

    // Mobile Drawer Open / Close
    const menuBtn = document.getElementById('btn-mobile-menu');
    const closeBtn = document.getElementById('btn-close-mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');

    menuBtn?.addEventListener('click', () => this.openMobileMenu());
    closeBtn?.addEventListener('click', () => this.closeMobileMenu());
    overlay?.addEventListener('click', () => this.closeMobileMenu());

    // Close on mobile link clicks
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });
  }

  openMobileMenu() {
    const drawer = document.getElementById('mobile-nav-drawer');
    drawer?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu() {
    const drawer = document.getElementById('mobile-nav-drawer');
    drawer?.classList.remove('active');
    document.body.style.overflow = '';
  }

  updateActiveRoute(route) {
    const cleanRoute = (route || '').replace(/^#\/?/, '').split('?')[0].split('/')[0];
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const target = link.getAttribute('data-route');
      if (target === cleanRoute || (cleanRoute === '' && target === '')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
