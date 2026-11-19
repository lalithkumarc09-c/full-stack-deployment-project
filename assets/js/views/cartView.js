/**
 * Shopping Cart View Controller
 * Route: #/cart
 * Handles item quantity adjustments, item removal, free shipping thresholds,
 * coupon redemption (WELCOME10, NOVA20), subtotal/tax/shipping recalculation,
 * and navigation to checkout.
 */
import { store } from '../store.js';
import { formatCurrency, validateCoupon } from '../utils/helpers.js';
import { icons } from '../utils/icons.js';

export class CartView {
  constructor() {
    this.container = document.getElementById('main-content');
    this.shippingThreshold = 100;
    this.standardShippingFee = 15;
    this.taxRate = 0.08;
  }

  render() {
    document.title = 'Shopping Cart | NovaCommerce';

    const cart = store.getCart();

    if (cart.length === 0) {
      this.renderEmptyCart();
      return;
    }

    this.renderCartLayout(cart);
  }

  renderEmptyCart() {
    this.container.innerHTML = `
      <div class="container empty-cart-wrapper">
        <div class="empty-cart-card fade-in-up">
          <div class="empty-cart-icon">${icons.cart}</div>
          <h1 class="empty-cart-title">Your Shopping Cart is Empty</h1>
          <p class="empty-cart-subtext">
            Looks like you haven't added anything to your cart yet. Explore our curated catalog to find the items you love!
          </p>
          <div class="empty-cart-actions">
            <a href="#/products" class="btn btn-primary btn-lg">
              <span>Start Shopping</span>
              <span class="btn-icon">${icons.chevronRight}</span>
            </a>
            <a href="#/wishlist" class="btn btn-outline btn-lg">
              <span>View Saved Wishlist</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderCartLayout(cart) {
    const subtotal = store.getCartSubtotal();
    const appliedCoupon = store.getAppliedCoupon();

    const isFreeShipping = subtotal >= this.shippingThreshold || (appliedCoupon && appliedCoupon.code === 'FREESHIP');
    const shippingCost = isFreeShipping ? 0 : this.standardShippingFee;
    const progressPercent = Math.min(100, Math.round((subtotal / this.shippingThreshold) * 100));
    const amountNeeded = Math.max(0, this.shippingThreshold - subtotal);

    let couponDiscount = 0;
    if (appliedCoupon) {
      couponDiscount = appliedCoupon.discountAmount;
    }

    const estimatedTax = (subtotal - couponDiscount) * this.taxRate;
    const total = Math.max(0, subtotal - couponDiscount + shippingCost + estimatedTax);

    this.container.innerHTML = `
      <div class="cart-view-wrapper">
        <div class="container">
          <!-- Breadcrumb -->
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="#/">Home</a>
            <span class="breadcrumb-separator">${icons.chevronRight}</span>
            <span class="breadcrumb-current">Shopping Cart</span>
          </nav>

          <h1 class="page-title">Shopping Cart (${store.getCartCount()} items)</h1>

          <div class="cart-grid-layout">
            <!-- Items Column -->
            <div class="cart-items-column">
              <!-- Free shipping progress bar -->
              <div class="shipping-progress-banner">
                <div class="shipping-progress-header">
                  <span class="shipping-icon">${icons.truck}</span>
                  <span class="shipping-msg">
                    ${isFreeShipping 
                      ? '<strong>Congratulations!</strong> You have unlocked <strong>Free Express Shipping</strong>!' 
                      : `Add <strong>${formatCurrency(amountNeeded)}</strong> more to qualify for <strong>Free Express Shipping</strong>!`}
                  </span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                </div>
              </div>

              <!-- Cart Items List -->
              <div class="cart-items-table">
                <div class="cart-table-header">
                  <span class="col-product">Product</span>
                  <span class="col-price">Price</span>
                  <span class="col-qty">Quantity</span>
                  <span class="col-total">Subtotal</span>
                  <span class="col-action"></span>
                </div>

                <div class="cart-items-body" id="cart-items-container">
                  ${cart.map(item => this.renderCartItemRow(item)).join('')}
                </div>
              </div>

              <div class="cart-bottom-actions">
                <a href="#/products" class="btn btn-outline">
                  ${icons.chevronLeft} Continue Shopping
                </a>
                <button type="button" class="btn btn-ghost text-danger" id="btn-clear-cart">
                  ${icons.trash} Clear Cart
                </button>
              </div>
            </div>

            <!-- Order Summary Column -->
            <div class="cart-summary-column">
              <div class="summary-card">
                <h2 class="summary-title">Order Summary</h2>

                <div class="summary-line">
                  <span>Subtotal</span>
                  <span class="summary-val">${formatCurrency(subtotal)}</span>
                </div>

                <div class="summary-line">
                  <span>Shipping Estimate</span>
                  <span class="summary-val ${isFreeShipping ? 'text-success' : ''}">
                    ${isFreeShipping ? 'FREE' : formatCurrency(shippingCost)}
                  </span>
                </div>

                <div class="summary-line">
                  <span>Estimated Sales Tax (8%)</span>
                  <span class="summary-val">${formatCurrency(estimatedTax)}</span>
                </div>

                ${appliedCoupon ? `
                  <div class="summary-line coupon-line">
                    <span class="coupon-tag">
                      ${appliedCoupon.label}
                      <button type="button" class="btn-remove-coupon" id="btn-remove-coupon" title="Remove coupon">${icons.x}</button>
                    </span>
                    <span class="summary-val text-success">-${formatCurrency(couponDiscount)}</span>
                  </div>
                ` : ''}

                <div class="summary-divider"></div>

                <div class="summary-line summary-total-line">
                  <span>Estimated Total</span>
                  <span class="summary-total-val">${formatCurrency(total)}</span>
                </div>

                <!-- Coupon Entry Form -->
                <div class="coupon-box">
                  <label for="cart-coupon-input" class="coupon-label">Promotional Code</label>
                  <form id="cart-coupon-form" class="coupon-form">
                    <input 
                      type="text" 
                      id="cart-coupon-input" 
                      placeholder="e.g. WELCOME10" 
                      value="${appliedCoupon ? appliedCoupon.code : ''}"
                      ${appliedCoupon ? 'disabled' : ''}
                    />
                    <button 
                      type="submit" 
                      class="btn btn-secondary btn-sm" 
                      ${appliedCoupon ? 'disabled' : ''}
                    >
                      Apply
                    </button>
                  </form>
                  <span class="coupon-hint">Active coupons: WELCOME10 (10% off), NOVA20 (20% off)</span>
                </div>

                <!-- Checkout CTA -->
                <a href="#/checkout" class="btn btn-primary btn-block btn-lg btn-checkout">
                  <span class="btn-icon">${icons.lock}</span>
                  <span>Proceed to Checkout</span>
                </a>

                <div class="checkout-trust-row">
                  <span>${icons.shield} Guaranteed Safe Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderCartItemRow(item) {
    const p = item.product;
    const itemTotal = p.price * item.quantity;

    return `
      <div class="cart-item-row" data-id="${p.id}">
        <div class="col-product item-product-info">
          <a href="#/product/${p.id}" class="item-img-link">
            <img src="${p.image}" alt="${p.title}" class="item-thumb" width="80" height="80" />
          </a>
          <div class="item-meta">
            <span class="item-category">${p.category}</span>
            <a href="#/product/${p.id}" class="item-title">${p.title}</a>
          </div>
        </div>

        <div class="col-price item-unit-price">
          ${formatCurrency(p.price)}
        </div>

        <div class="col-qty item-qty-control">
          <div class="quantity-stepper stepper-compact">
            <button type="button" class="qty-btn" data-action="decrement" data-id="${p.id}" aria-label="Decrease quantity">
              ${icons.minus}
            </button>
            <span class="qty-display">${item.quantity}</span>
            <button type="button" class="qty-btn" data-action="increment" data-id="${p.id}" aria-label="Increase quantity">
              ${icons.plus}
            </button>
          </div>
        </div>

        <div class="col-total item-line-total">
          ${formatCurrency(itemTotal)}
        </div>

        <div class="col-action item-remove-col">
          <button 
            type="button" 
            class="icon-btn btn-trash" 
            data-action="remove" 
            data-id="${p.id}"
            title="Remove item from cart"
            aria-label="Remove ${p.title}"
          >
            ${icons.trash}
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Quantity adjustments & removal via delegation
    const itemsContainer = document.getElementById('cart-items-container');
    itemsContainer?.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.getAttribute('data-action');
      const id = parseInt(target.getAttribute('data-id'), 10);
      const cart = store.getCart();
      const item = cart.find(i => i.product.id === id);

      if (!item) return;

      if (action === 'increment') {
        store.updateCartQuantity(id, item.quantity + 1);
        this.render();
      } else if (action === 'decrement') {
        store.updateCartQuantity(id, item.quantity - 1);
        this.render();
      } else if (action === 'remove') {
        store.removeFromCart(id);
        this.render();
      }
    });

    // Clear entire cart
    const clearBtn = document.getElementById('btn-clear-cart');
    clearBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        store.clearCart();
        this.render();
      }
    });

    // Coupon form submission
    const couponForm = document.getElementById('cart-coupon-form');
    couponForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('cart-coupon-input');
      const code = input?.value;
      const subtotal = store.getCartSubtotal();

      const validation = validateCoupon(code, subtotal);
      if (!validation.valid) {
        store.emit('toast:show', {
          type: 'error',
          title: 'Coupon Error',
          message: validation.message
        });
        return;
      }

      store.applyCoupon(validation);
      this.render();
    });

    // Remove coupon
    const removeCouponBtn = document.getElementById('btn-remove-coupon');
    removeCouponBtn?.addEventListener('click', () => {
      store.removeCoupon();
      this.render();
    });
  }
}
