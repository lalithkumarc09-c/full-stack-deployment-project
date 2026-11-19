/**
 * Application Bootstrap Entry Point
 * Mounts Global UI components (Navbar, Footer, Toast Notifications)
 * and configures Client-Side Routing table.
 */
import { Navbar } from './components/navbar.js';
import { Footer } from './components/footer.js';
import { ToastManager } from './components/toast.js';
import { Router } from './router.js';

// Views
import { HomeView } from './views/homeView.js';
import { CatalogView } from './views/catalogView.js';
import { ProductView } from './views/productView.js';
import { CartView } from './views/cartView.js';
import { WishlistView } from './views/wishlistView.js';
import { CheckoutView } from './views/checkoutView.js';
import { ArchitectureView } from './views/architectureView.js';

class Application {
  constructor() {
    this.navbar = null;
    this.footer = null;
    this.toast = null;
    this.router = null;
  }

  init() {
    // 1. Initialize Global UI Services
    this.toast = new ToastManager();
    this.navbar = new Navbar();
    this.footer = new Footer();

    // 2. Configure Client-Side SPA Router
    this.router = new Router(this.navbar);

    // Register dynamic routes
    this.router.addRoute('', HomeView);
    this.router.addRoute('home', HomeView);
    this.router.addRoute('products', CatalogView);
    this.router.addRoute('product/:id', ProductView);
    this.router.addRoute('cart', CartView);
    this.router.addRoute('wishlist', WishlistView);
    this.router.addRoute('checkout', CheckoutView);
    this.router.addRoute('architecture', ArchitectureView);

    // 3. Trigger initial routing
    this.router.handleRouting();

    console.info('🚀 NovaCommerce Capstone Application initialized successfully.');
  }
}

// Bootstrap when DOM is ready
const app = new Application();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
