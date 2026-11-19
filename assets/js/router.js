/**
 * Single Page Application (SPA) Client-Side Router
 * Supports dynamic path parameters (e.g., /product/:id),
 * query string parsing, history navigation, scroll restoration,
 * and active navigation highlighting.
 */

export class Router {
  constructor(navbarInstance) {
    this.routes = [];
    this.navbar = navbarInstance;
    this.currentView = null;
    this.init();
  }

  addRoute(path, ViewClass) {
    const paramNames = [];
    // Convert e.g. "product/:id" to regex "^product/([^/]+)$"
    const cleanPath = path.replace(/^\//, '').replace(/\/$/, '');
    
    let regexString;
    if (cleanPath === '') {
      regexString = '^$';
    } else {
      regexString = '^' + cleanPath.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/?#]+)';
      }) + '$';
    }

    this.routes.push({
      path: cleanPath,
      regex: new RegExp(regexString),
      paramNames,
      ViewClass
    });
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('DOMContentLoaded', () => this.handleRouting());
  }

  parseHash() {
    const rawHash = window.location.hash || '#/';
    const cleanHash = rawHash.replace(/^#\/?/, '');
    const [pathPart, queryPart] = cleanHash.split('?');
    
    // Parse query string into key-value map
    const query = {};
    if (queryPart) {
      const pairs = queryPart.split('&');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (k) {
          query[decodeURIComponent(k)] = v ? decodeURIComponent(v) : true;
        }
      }
    }

    return {
      path: (pathPart || '').replace(/^\//, '').replace(/\/$/, ''),
      query,
      rawHash
    };
  }

  async handleRouting() {
    const { path, query, rawHash } = this.parseHash();

    // Notify navbar to highlight active route
    if (this.navbar && typeof this.navbar.updateActiveRoute === 'function') {
      this.navbar.updateActiveRoute(path);
    }

    // Match route
    let matched = null;
    let params = {};

    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        matched = route;
        // Extract parameter values
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        break;
      }
    }

    // Fallback: if no match found, route to home or catalog
    if (!matched) {
      console.warn(`No route matched for: ${path}. Defaulting to catalog.`);
      window.location.hash = '#/products';
      return;
    }

    // Instantiate and execute view controller
    try {
      this.currentView = new matched.ViewClass(params, query);
      await this.currentView.render();
      // Scroll to top on navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error rendering view:', err);
      const container = document.getElementById('main-content');
      if (container) {
        container.innerHTML = `
          <div class="container not-found-view">
            <h2>Error Rendering Page</h2>
            <p>An unexpected error occurred while loading this view.</p>
            <a href="#/" class="btn btn-primary">Return Home</a>
          </div>
        `;
      }
    }
  }
}
