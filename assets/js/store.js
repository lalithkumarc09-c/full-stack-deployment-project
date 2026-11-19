/**
 * Centralized Reactive State Management Store
 * Manages Cart, Wishlist, Active Filters, Theme, and global event dispatching.
 * Automatically synchronizes state with browser localStorage.
 */

class Store {
  constructor() {
    this.STORAGE_KEYS = {
      CART: 'novastore_cart_v1',
      WISHLIST: 'novastore_wishlist_v1',
      THEME: 'novastore_theme_v1'
    };

    this.subscribers = new Map();

    // Initial state loaded from localStorage with fallbacks
    this.state = {
      cart: this.loadFromStorage(this.STORAGE_KEYS.CART, []),
      wishlist: this.loadFromStorage(this.STORAGE_KEYS.WISHLIST, []),
      theme: this.loadFromStorage(this.STORAGE_KEYS.THEME, this.getSystemThemePreference()),
      appliedCoupon: null,
      filters: {
        category: 'All',
        searchQuery: '',
        minPrice: 0,
        maxPrice: 500,
        minRating: 0,
        inStockOnly: false,
        sortBy: 'featured'
      }
    };

    this.initTheme();
  }

  loadFromStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Could not read ${key} from localStorage:`, e);
      return fallback;
    }
  }

  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Could not persist ${key} to localStorage:`, e);
    }
  }

  getSystemThemePreference() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', this.state.theme);
  }

  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.saveToStorage(this.STORAGE_KEYS.THEME, this.state.theme);
    this.initTheme();
    this.emit('theme:change', this.state.theme);
  }

  // --- Pub/Sub Mechanism ---
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const set = this.subscribers.get(event);
      if (set) set.delete(callback);
    };
  }

  emit(event, payload) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(cb => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`Error in store subscriber for ${event}:`, err);
        }
      });
    }
  }

  // --- Cart Operations ---
  getCart() {
    return this.state.cart;
  }

  getCartCount() {
    return this.state.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartSubtotal() {
    return this.state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  addToCart(product, quantity = 1) {
    const existingIndex = this.state.cart.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += quantity;
    } else {
      this.state.cart.push({
        product,
        quantity,
        addedAt: new Date().toISOString()
      });
    }

    this.saveToStorage(this.STORAGE_KEYS.CART, this.state.cart);
    this.emit('cart:updated', this.state.cart);
    this.emit('toast:show', {
      type: 'success',
      title: 'Added to Cart',
      message: `${product.title} (x${quantity}) was added to your cart.`
    });
  }

  updateCartQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const item = this.state.cart.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveToStorage(this.STORAGE_KEYS.CART, this.state.cart);
      this.emit('cart:updated', this.state.cart);
    }
  }

  removeFromCart(productId) {
    const removedItem = this.state.cart.find(i => i.product.id === productId);
    this.state.cart = this.state.cart.filter(item => item.product.id !== productId);
    this.saveToStorage(this.STORAGE_KEYS.CART, this.state.cart);
    this.emit('cart:updated', this.state.cart);

    if (removedItem) {
      this.emit('toast:show', {
        type: 'info',
        title: 'Removed from Cart',
        message: `${removedItem.product.title} removed.`
      });
    }
  }

  clearCart() {
    this.state.cart = [];
    this.state.appliedCoupon = null;
    this.saveToStorage(this.STORAGE_KEYS.CART, []);
    this.emit('cart:updated', []);
  }

  applyCoupon(couponObj) {
    this.state.appliedCoupon = couponObj;
    this.emit('cart:couponApplied', couponObj);
    this.emit('toast:show', {
      type: 'success',
      title: 'Coupon Applied!',
      message: `${couponObj.label} activated successfully.`
    });
  }

  removeCoupon() {
    this.state.appliedCoupon = null;
    this.emit('cart:couponApplied', null);
  }

  getAppliedCoupon() {
    return this.state.appliedCoupon;
  }

  // --- Wishlist Operations ---
  getWishlist() {
    return this.state.wishlist;
  }

  isInWishlist(productId) {
    return this.state.wishlist.some(item => item.id === productId);
  }

  toggleWishlist(product) {
    const exists = this.isInWishlist(product.id);
    if (exists) {
      this.state.wishlist = this.state.wishlist.filter(item => item.id !== product.id);
      this.emit('toast:show', {
        type: 'info',
        title: 'Removed from Wishlist',
        message: `${product.title} removed from saved items.`
      });
    } else {
      this.state.wishlist.push(product);
      this.emit('toast:show', {
        type: 'success',
        title: 'Added to Wishlist',
        message: `${product.title} saved to your favorites.`
      });
    }

    this.saveToStorage(this.STORAGE_KEYS.WISHLIST, this.state.wishlist);
    this.emit('wishlist:updated', this.state.wishlist);
    return !exists;
  }

  getWishlistCount() {
    return this.state.wishlist.length;
  }

  // --- Filter State ---
  getFilters() {
    return { ...this.state.filters };
  }

  setFilters(partialFilters) {
    this.state.filters = { ...this.state.filters, ...partialFilters };
    this.emit('filters:updated', this.state.filters);
  }

  resetFilters() {
    this.state.filters = {
      category: 'All',
      searchQuery: '',
      minPrice: 0,
      maxPrice: 500,
      minRating: 0,
      inStockOnly: false,
      sortBy: 'featured'
    };
    this.emit('filters:updated', this.state.filters);
  }
}

export const store = new Store();
