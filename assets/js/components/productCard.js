/**
 * Modular Product Card Component
 * Renders consistent, accessible, and high-performance product cards across all views.
 */
import { formatCurrency, renderStars } from '../utils/helpers.js';
import { icons } from '../utils/icons.js';
import { store } from '../store.js';

export function renderProductCard(product, viewMode = 'grid') {
  const isWishlisted = store.isInWishlist(product.id);
  const discountBadge = product.discount ? `<span class="badge badge-discount">-${product.discount}%</span>` : '';
  const specialBadge = product.badge ? `<span class="badge badge-accent">${product.badge}</span>` : '';

  return `
    <article class="product-card product-card-${viewMode} fade-in-up" data-id="${product.id}">
      <div class="card-media">
        <a href="#/product/${product.id}" class="card-image-link" aria-label="${product.title}">
          <img 
            src="${product.image}" 
            alt="${product.title}" 
            loading="lazy" 
            decoding="async" 
            class="card-img" 
            width="320" 
            height="320"
          />
        </a>
        <div class="card-badges">
          ${discountBadge}
          ${specialBadge}
        </div>
        <button 
          type="button" 
          class="btn-wishlist ${isWishlisted ? 'active' : ''}" 
          data-action="toggle-wishlist" 
          data-id="${product.id}"
          title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
          aria-label="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
        >
          ${isWishlisted ? icons.heartFilled : icons.heart}
        </button>
      </div>

      <div class="card-content">
        <div class="card-meta">
          <span class="card-category">${product.category}</span>
          ${renderStars(product.rating, product.reviewsCount)}
        </div>

        <h3 class="card-title">
          <a href="#/product/${product.id}" class="card-title-link">${product.title}</a>
        </h3>

        <p class="card-description">${product.description}</p>

        <div class="card-footer">
          <div class="card-pricing">
            <span class="price-current">${formatCurrency(product.price)}</span>
            ${product.originalPrice ? `<span class="price-original">${formatCurrency(product.originalPrice)}</span>` : ''}
          </div>

          <button 
            type="button" 
            class="btn btn-primary btn-add-cart" 
            data-action="add-to-cart" 
            data-id="${product.id}"
            aria-label="Add ${product.title} to cart"
          >
            <span class="btn-icon">${icons.cart}</span>
            <span class="btn-text">Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Event delegation helper for product card interactions
 */
export function handleProductCardAction(e, productsList) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.getAttribute('data-action');
  const id = parseInt(target.getAttribute('data-id'), 10);
  const product = productsList.find(p => p.id === id);

  if (!product) return;

  if (action === 'add-to-cart') {
    e.preventDefault();
    store.addToCart(product, 1);
    
    // Quick micro-interaction animation
    target.classList.add('btn-clicked');
    setTimeout(() => target.classList.remove('btn-clicked'), 400);
  } else if (action === 'toggle-wishlist') {
    e.preventDefault();
    const isNowWishlisted = store.toggleWishlist(product);
    target.classList.toggle('active', isNowWishlisted);
    target.innerHTML = isNowWishlisted ? icons.heartFilled : icons.heart;
    target.setAttribute('title', isNowWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist');
  }
}
