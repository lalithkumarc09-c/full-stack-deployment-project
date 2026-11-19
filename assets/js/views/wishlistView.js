/**
 * Wishlist View Controller
 * Route: #/wishlist
 * Manages customer saved favorite products, with quick "Move to Cart"
 * and "Add All to Cart" functionality.
 */
import { store } from '../store.js';
import { renderProductCard, handleProductCardAction } from '../components/productCard.js';
import { icons } from '../utils/icons.js';

export class WishlistView {
  constructor() {
    this.container = document.getElementById('main-content');
  }

  render() {
    document.title = 'My Wishlist | NovaCommerce';

    const wishlist = store.getWishlist();

    if (wishlist.length === 0) {
      this.renderEmpty();
      return;
    }

    this.container.innerHTML = `
      <div class="wishlist-view-wrapper">
        <div class="container">
          <!-- Breadcrumb -->
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="#/">Home</a>
            <span class="breadcrumb-separator">${icons.chevronRight}</span>
            <span class="breadcrumb-current">My Wishlist</span>
          </nav>

          <div class="wishlist-header-row">
            <div>
              <h1 class="page-title">Saved Wishlist</h1>
              <p class="page-subtitle">You have ${wishlist.length} saved item${wishlist.length === 1 ? '' : 's'}</p>
            </div>

            <div class="wishlist-actions-right">
              <button type="button" class="btn btn-primary" id="btn-move-all-cart">
                <span class="btn-icon">${icons.cart}</span>
                <span>Move All to Cart</span>
              </button>
            </div>
          </div>

          <!-- Wishlist Products Grid -->
          <div class="products-grid" id="wishlist-products-container">
            ${wishlist.map(product => renderProductCard(product, 'grid')).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents(wishlist);
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="container empty-wishlist-wrapper">
        <div class="empty-cart-card fade-in-up">
          <div class="empty-cart-icon text-accent">${icons.heart}</div>
          <h1 class="empty-cart-title">Your Wishlist is Empty</h1>
          <p class="empty-cart-subtext">
            Tap the heart icon on any product to save your favorites for later!
          </p>
          <div class="empty-cart-actions">
            <a href="#/products" class="btn btn-primary btn-lg">
              <span>Explore Products</span>
              <span class="btn-icon">${icons.chevronRight}</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(wishlist) {
    const container = document.getElementById('wishlist-products-container');
    container?.addEventListener('click', (e) => {
      handleProductCardAction(e, wishlist);
      // If an item was unwishlisted, re-render
      setTimeout(() => {
        this.render();
      }, 100);
    });

    const moveAllBtn = document.getElementById('btn-move-all-cart');
    moveAllBtn?.addEventListener('click', () => {
      wishlist.forEach(p => store.addToCart(p, 1));
      store.emit('toast:show', {
        type: 'success',
        title: 'All Items Added',
        message: `All ${wishlist.length} wishlist items were added to your cart!`
      });
      window.location.hash = '#/cart';
    });
  }
}
