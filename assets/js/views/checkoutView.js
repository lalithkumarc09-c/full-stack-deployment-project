/**
 * Checkout View Controller
 * Route: #/checkout
 * Implements full order checkout pipeline: address validation, payment processing simulation,
 * and comprehensive order confirmation receipt with printable invoice.
 */
import { store } from '../store.js';
import { formatCurrency } from '../utils/helpers.js';
import { icons } from '../utils/icons.js';

export class CheckoutView {
  constructor() {
    this.container = document.getElementById('main-content');
    this.currentStep = 1; // 1: Shipping, 2: Payment, 3: Completed
    this.shippingThreshold = 100;
    this.taxRate = 0.08;
    this.completedOrder = null;
  }

  render() {
    document.title = 'Secure Checkout | NovaCommerce';

    const cart = store.getCart();

    if (cart.length === 0 && !this.completedOrder) {
      window.location.hash = '#/cart';
      return;
    }

    if (this.completedOrder) {
      this.renderOrderConfirmation();
      return;
    }

    this.renderCheckoutForm(cart);
  }

  renderCheckoutForm(cart) {
    const subtotal = store.getCartSubtotal();
    const appliedCoupon = store.getAppliedCoupon();
    const isFreeShipping = subtotal >= this.shippingThreshold || (appliedCoupon && appliedCoupon.code === 'FREESHIP');
    const shippingCost = isFreeShipping ? 0 : 15;
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const tax = (subtotal - discount) * this.taxRate;
    const total = Math.max(0, subtotal - discount + shippingCost + tax);

    this.container.innerHTML = `
      <div class="checkout-view-wrapper">
        <div class="container">
          <!-- Breadcrumb -->
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="#/">Home</a>
            <span class="breadcrumb-separator">${icons.chevronRight}</span>
            <a href="#/cart">Cart</a>
            <span class="breadcrumb-separator">${icons.chevronRight}</span>
            <span class="breadcrumb-current">Checkout</span>
          </nav>

          <div class="checkout-header-row">
            <h1 class="page-title">Secure Checkout</h1>
            <div class="secure-badge-pill">
              ${icons.lock} 256-Bit SSL Encrypted
            </div>
          </div>

          <div class="checkout-layout-grid">
            <!-- Left Column: Checkout Steps Form -->
            <div class="checkout-form-column">
              <form id="checkout-form" class="checkout-form" novalidate>
                <!-- Step 1: Contact & Shipping -->
                <div class="checkout-section-card">
                  <div class="section-card-header">
                    <span class="step-num">1</span>
                    <h3>Shipping Address</h3>
                  </div>

                  <div class="form-row-2">
                    <div class="form-field">
                      <label for="ship-fname">First Name *</label>
                      <input type="text" id="ship-fname" required placeholder="Jane" value="Lalith" />
                    </div>
                    <div class="form-field">
                      <label for="ship-lname">Last Name *</label>
                      <input type="text" id="ship-lname" required placeholder="Doe" value="Kumar" />
                    </div>
                  </div>

                  <div class="form-row-2">
                    <div class="form-field">
                      <label for="ship-email">Email Address *</label>
                      <input type="email" id="ship-email" required placeholder="jane@example.com" value="customer@example.com" />
                    </div>
                    <div class="form-field">
                      <label for="ship-phone">Phone Number *</label>
                      <input type="tel" id="ship-phone" required placeholder="+1 (555) 000-0000" value="+1 (555) 234-5678" />
                    </div>
                  </div>

                  <div class="form-field">
                    <label for="ship-address">Street Address *</label>
                    <input type="text" id="ship-address" required placeholder="123 Tech Boulevard, Suite 400" value="742 Evergreen Terrace" />
                  </div>

                  <div class="form-row-3">
                    <div class="form-field">
                      <label for="ship-city">City *</label>
                      <input type="text" id="ship-city" required placeholder="San Francisco" value="Seattle" />
                    </div>
                    <div class="form-field">
                      <label for="ship-state">State / Province *</label>
                      <input type="text" id="ship-state" required placeholder="CA" value="WA" />
                    </div>
                    <div class="form-field">
                      <label for="ship-zip">ZIP / Postal *</label>
                      <input type="text" id="ship-zip" required placeholder="94107" value="98101" />
                    </div>
                  </div>
                </div>

                <!-- Step 2: Shipping Method -->
                <div class="checkout-section-card">
                  <div class="section-card-header">
                    <span class="step-num">2</span>
                    <h3>Delivery Method</h3>
                  </div>

                  <div class="shipping-methods-list">
                    <label class="shipping-method-option active">
                      <input type="radio" name="shipping-method" value="standard" checked />
                      <div class="method-details">
                        <span class="method-name">FedEx Standard Tracked Delivery (3-5 Business Days)</span>
                        <span class="method-desc">Reliable ground shipping with doorstep signature</span>
                      </div>
                      <span class="method-price">${isFreeShipping ? 'FREE' : '$15.00'}</span>
                    </label>

                    <label class="shipping-method-option">
                      <input type="radio" name="shipping-method" value="express" />
                      <div class="method-details">
                        <span class="method-name">UPS Express Priority (1-2 Business Days)</span>
                        <span class="method-desc">Next flight out priority with live satellite tracking</span>
                      </div>
                      <span class="method-price">$25.00</span>
                    </label>
                  </div>
                </div>

                <!-- Step 3: Payment Method -->
                <div class="checkout-section-card">
                  <div class="section-card-header">
                    <span class="step-num">3</span>
                    <h3>Payment Information</h3>
                  </div>

                  <div class="payment-tabs-selector">
                    <button type="button" class="pay-tab active" data-tab="card">${icons.lock} Credit / Debit Card</button>
                    <button type="button" class="pay-tab" data-tab="paypal">PayPal</button>
                    <button type="button" class="pay-tab" data-tab="cod">Cash on Delivery</button>
                  </div>

                  <div class="pay-pane active" id="pane-card">
                    <div class="form-field">
                      <label for="card-num">Card Number *</label>
                      <div class="card-input-wrapper">
                        <input type="text" id="card-num" required placeholder="4111 2222 3333 4444" maxlength="19" value="4532 •••• •••• 8892" />
                        <span class="card-type-icon">${icons.shield}</span>
                      </div>
                    </div>

                    <div class="form-row-2">
                      <div class="form-field">
                        <label for="card-expiry">Expiration (MM/YY) *</label>
                        <input type="text" id="card-expiry" required placeholder="08/28" maxlength="5" value="12/28" />
                      </div>
                      <div class="form-field">
                        <label for="card-cvv">Security Code (CVV) *</label>
                        <input type="password" id="card-cvv" required placeholder="123" maxlength="4" value="884" />
                      </div>
                    </div>

                    <div class="form-field">
                      <label for="card-name">Cardholder Name *</label>
                      <input type="text" id="card-name" required placeholder="Jane Doe" value="Lalith Kumar" />
                    </div>
                  </div>

                  <div class="pay-pane" id="pane-paypal">
                    <div class="paypal-callout">
                      <p>You will be securely redirected to PayPal to complete your purchase after clicking Place Order.</p>
                    </div>
                  </div>

                  <div class="pay-pane" id="pane-cod">
                    <div class="paypal-callout">
                      <p>Pay with cash or contactless card when your package is delivered to your doorstep.</p>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary btn-block btn-lg btn-place-order" id="btn-place-order">
                  <span class="btn-icon">${icons.check}</span>
                  <span>Place Order • ${formatCurrency(total)}</span>
                </button>
              </form>
            </div>

            <!-- Right Column: Order Review Summary -->
            <div class="checkout-summary-column">
              <div class="summary-card">
                <h3 class="summary-title">Review Order (${cart.reduce((s, i) => s + i.quantity, 0)} items)</h3>

                <div class="checkout-items-preview">
                  ${cart.map(i => `
                    <div class="preview-item">
                      <div class="preview-thumb-wrap">
                        <img src="${i.product.image}" alt="${i.product.title}" width="54" height="54" />
                        <span class="preview-badge">${i.quantity}</span>
                      </div>
                      <div class="preview-meta">
                        <span class="preview-title">${i.product.title}</span>
                        <span class="preview-cat">${i.product.category}</span>
                      </div>
                      <span class="preview-price">${formatCurrency(i.product.price * i.quantity)}</span>
                    </div>
                  `).join('')}
                </div>

                <div class="summary-line">
                  <span>Subtotal</span>
                  <span class="summary-val">${formatCurrency(subtotal)}</span>
                </div>

                ${appliedCoupon ? `
                  <div class="summary-line">
                    <span class="text-success">${appliedCoupon.label}</span>
                    <span class="summary-val text-success">-${formatCurrency(discount)}</span>
                  </div>
                ` : ''}

                <div class="summary-line">
                  <span>Shipping</span>
                  <span class="summary-val ${isFreeShipping ? 'text-success' : ''}">
                    ${isFreeShipping ? 'FREE' : formatCurrency(shippingCost)}
                  </span>
                </div>

                <div class="summary-line">
                  <span>Sales Tax (8%)</span>
                  <span class="summary-val">${formatCurrency(tax)}</span>
                </div>

                <div class="summary-divider"></div>

                <div class="summary-line summary-total-line">
                  <span>Grand Total</span>
                  <span class="summary-total-val text-primary">${formatCurrency(total)}</span>
                </div>

                <div class="checkout-money-back-banner">
                  <span class="money-back-icon">${icons.shield}</span>
                  <div class="money-back-text">
                    <strong>30-Day Money Back Guarantee</strong>
                    <p>Free returns if not 100% satisfied.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(cart, { subtotal, discount, shippingCost, tax, total });
  }

  renderOrderConfirmation() {
    const o = this.completedOrder;

    this.container.innerHTML = `
      <div class="order-confirmation-wrapper">
        <div class="container confirmation-inner fade-in-up">
          <div class="confirmation-hero-badge">
            <div class="check-circle">${icons.check}</div>
            <h1 class="confirmation-title">Thank You For Your Order!</h1>
            <p class="confirmation-subtitle">
              Your order <strong>#${o.orderId}</strong> has been received and is being prepared for fulfillment.
            </p>
          </div>

          <!-- Order Receipt Card -->
          <div class="receipt-card printable" id="order-receipt">
            <div class="receipt-header">
              <div class="receipt-brand">
                <span class="brand-icon">${icons.sparkles}</span>
                <span class="brand-name">Nova<strong>Commerce</strong></span>
              </div>
              <div class="receipt-meta">
                <div><strong>Order ID:</strong> #${o.orderId}</div>
                <div><strong>Order Date:</strong> ${o.orderDate}</div>
                <div><strong>Payment:</strong> ${o.paymentMethod} (Authorized)</div>
                <div><strong>Estimated Delivery:</strong> ${o.deliveryDate}</div>
              </div>
            </div>

            <div class="receipt-addresses-grid">
              <div class="receipt-address-box">
                <h4>Shipping To</h4>
                <p><strong>${o.customer.name}</strong></p>
                <p>${o.customer.address}</p>
                <p>${o.customer.city}, ${o.customer.state} ${o.customer.zip}</p>
                <p>${o.customer.email} • ${o.customer.phone}</p>
              </div>
              <div class="receipt-address-box">
                <h4>Fulfillment Details</h4>
                <p><strong>Courier:</strong> FedEx Express Priority</p>
                <p><strong>Status:</strong> Order Placed & Confirmed</p>
                <p><strong>Tracking:</strong> FEDX-98234-NC (Active shortly)</p>
              </div>
            </div>

            <table class="receipt-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${o.items.map(item => `
                  <tr>
                    <td>
                      <div class="table-item-cell">
                        <img src="${item.product.image}" alt="${item.product.title}" width="42" height="42" />
                        <div>
                          <strong>${item.product.title}</strong>
                          <span class="text-muted block text-xs">${item.product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.product.price)}</td>
                    <td class="text-right">${formatCurrency(item.product.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right">Subtotal:</td>
                  <td class="text-right">${formatCurrency(o.subtotal)}</td>
                </tr>
                ${o.discount > 0 ? `
                  <tr>
                    <td colspan="3" class="text-right text-success">Promotional Discount:</td>
                    <td class="text-right text-success">-${formatCurrency(o.discount)}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td colspan="3" class="text-right">Shipping:</td>
                  <td class="text-right">${o.shippingCost === 0 ? 'FREE' : formatCurrency(o.shippingCost)}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right">Sales Tax (8%):</td>
                  <td class="text-right">${formatCurrency(o.tax)}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" class="text-right"><strong>Grand Total:</strong></td>
                  <td class="text-right"><strong>${formatCurrency(o.total)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="confirmation-actions">
            <button type="button" class="btn btn-outline" id="btn-print-receipt">
              <span>Print Receipt</span>
            </button>
            <a href="#/products" class="btn btn-primary btn-lg">
              <span>Continue Shopping</span>
              <span class="btn-icon">${icons.chevronRight}</span>
            </a>
            <a href="#/architecture" class="btn btn-secondary btn-lg">
              <span>View System Architecture</span>
            </a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-print-receipt')?.addEventListener('click', () => {
      window.print();
    });
  }

  bindEvents(cart, financialSummary) {
    // Payment tab toggles
    document.querySelectorAll('.pay-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.pay-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`pane-${target}`)?.classList.add('active');
      });
    });

    // Checkout submission
    const form = document.getElementById('checkout-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = document.getElementById('btn-place-order');
      if (btn) {
        btn.innerHTML = `<span class="spinner spinner-sm"></span> Authorizing Payment...`;
        btn.setAttribute('disabled', 'true');
      }

      // Gather customer data
      const fname = document.getElementById('ship-fname')?.value || 'Guest';
      const lname = document.getElementById('ship-lname')?.value || 'User';
      const email = document.getElementById('ship-email')?.value || 'user@example.com';
      const phone = document.getElementById('ship-phone')?.value || '';
      const address = document.getElementById('ship-address')?.value || 'Main St';
      const city = document.getElementById('ship-city')?.value || 'City';
      const state = document.getElementById('ship-state')?.value || 'State';
      const zip = document.getElementById('ship-zip')?.value || '00000';

      const orderId = 'NC-' + Math.floor(100000 + Math.random() * 900000);
      const delivery = new Date();
      delivery.setDate(delivery.getDate() + 3);

      setTimeout(() => {
        this.completedOrder = {
          orderId,
          orderDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          deliveryDate: delivery.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          paymentMethod: 'Credit Card (Visa •••• 8892)',
          customer: {
            name: `${fname} ${lname}`,
            email,
            phone,
            address,
            city,
            state,
            zip
          },
          items: [...cart],
          ...financialSummary
        };

        // Clear cart in store
        store.clearCart();

        store.emit('toast:show', {
          type: 'success',
          title: 'Order Placed!',
          message: `Order #${orderId} was placed successfully!`
        });

        this.render();
      }, 900);
    });
  }
}
