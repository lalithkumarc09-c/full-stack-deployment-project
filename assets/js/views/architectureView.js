/**
 * Project Architecture & Technical Walkthrough View Controller
 * Route: #/architecture
 * Visualizes the modular component tree, client-side routing engine,
 * reactive state flow, asset optimization strategies, and live deployment configuration.
 */
import { icons } from '../utils/icons.js';

export class ArchitectureView {
  constructor() {
    this.container = document.getElementById('main-content');
  }

  render() {
    document.title = 'System Architecture & Technical Documentation | NovaCommerce';

    this.container.innerHTML = `
      <div class="architecture-view-wrapper">
        <!-- Hero Header -->
        <div class="arch-hero">
          <div class="container">
            <nav class="breadcrumbs" aria-label="Breadcrumb">
              <a href="#/">Home</a>
              <span class="breadcrumb-separator">${icons.chevronRight}</span>
              <span class="breadcrumb-current">Capstone System Architecture</span>
            </nav>

            <div class="arch-hero-content">
              <span class="badge badge-accent">Web Development Capstone Project</span>
              <h1 class="arch-hero-title">Full-Stack Deployment & Project Architecture</h1>
              <p class="arch-hero-subtitle">
                A comprehensive breakdown of the modular frontend architecture, custom client-side router,
                reactive state management, asset optimization pipeline, and production cloud hosting.
              </p>
            </div>
          </div>
        </div>

        <div class="container arch-main-body">
          <!-- Navigation Pills -->
          <div class="arch-nav-pills">
            <a href="#/architecture#overview" class="arch-pill active">Architecture Overview</a>
            <a href="#/architecture#routing" class="arch-pill">Client-Side Router</a>
            <a href="#/architecture#state" class="arch-pill">State & Store Flow</a>
            <a href="#/architecture#optimization" class="arch-pill">Asset Optimization</a>
            <a href="#/architecture#deployment" class="arch-pill">Cloud Deployment</a>
          </div>

          <!-- Section 1: Modular Frontend Architecture -->
          <section id="overview" class="arch-section-card">
            <div class="section-card-header">
              <div class="arch-badge-icon">${icons.layers}</div>
              <div>
                <h2>1. Modular Frontend Application Architecture</h2>
                <p>Component-based separation of concerns with unidirectional reactive data flow.</p>
              </div>
            </div>

            <div class="arch-grid-2">
              <div class="arch-block">
                <h3>Architectural Principles</h3>
                <ul class="arch-feature-list">
                  <li>
                    <strong>Separation of Concerns:</strong> Clear distinction between routing (Router), state persistence (Store), data retrieval (ProductAPI), views (View Controllers), and atomic UI units (Components).
                  </li>
                  <li>
                    <strong>Native ES6+ Modules:</strong> High-performance browser-native ES Modules (<code>import</code> / <code>export</code>) eliminating heavy runtime overhead while maintaining clean module boundaries.
                  </li>
                  <li>
                    <strong>Loose Coupling:</strong> Views communicate state mutations exclusively through reactive store events (Pub/Sub pattern), ensuring components remain reusable and independently testable.
                  </li>
                  <li>
                    <strong>Defensive Data Layer:</strong> The API layer features asynchronous JSON parsing with graceful offline fallbacks and error handling.
                  </li>
                </ul>
              </div>

              <div class="arch-block">
                <h3>Directory & Module Hierarchy</h3>
                <pre class="code-tree"><code>ecommerce-capstone/
├── index.html               # Semantic HTML5 Root & Meta Tags
├── 404.html                 # Fallback SPA routing handler
├── vercel.json              # Vercel Production Rewrites & Headers
├── netlify.toml             # Netlify SPA Redirects & Headers
├── _redirects               # Netlify Edge SPA Rewrite Rule
├── assets/
│   ├── css/
│   │   ├── main.css         # Modern Design Tokens & Glassmorphism
│   │   └── main.min.css     # Production Minified Stylesheet
│   ├── js/
│   │   ├── app.js           # Bootstrapper & Lifecycle Controller
│   │   ├── router.js        # Dynamic Client-Side Hash Router
│   │   ├── store.js         # Reactive State Store (Cart/Wishlist)
│   │   ├── api.js           # REST Data Service & Cache Layer
│   │   ├── views/           # Modular View Controllers
│   │   │   ├── homeView.js
│   │   │   ├── catalogView.js
│   │   │   ├── productView.js
│   │   │   ├── cartView.js
│   │   │   ├── wishlistView.js
│   │   │   ├── checkoutView.js
│   │   │   └── architectureView.js
│   │   ├── components/      # Reusable UI Components
│   │   │   ├── navbar.js
│   │   │   ├── footer.js
│   │   │   ├── productCard.js
│   │   │   └── toast.js
│   │   └── utils/
│   │       ├── helpers.js
│   │       └── icons.js
│   └── data/
│       └── products.json    # Structured REST Catalog Payload</code></pre>
              </div>
            </div>
          </section>

          <!-- Section 2: Client-Side Routing -->
          <section id="routing" class="arch-section-card">
            <div class="section-card-header">
              <div class="arch-badge-icon">${icons.globe}</div>
              <div>
                <h2>2. Client-Side Routing for Seamless Navigation</h2>
                <p>Instantaneous page transitions with dynamic URL parameter extraction and zero page reloads.</p>
              </div>
            </div>

            <div class="arch-grid-2">
              <div class="arch-block">
                <h3>Routing Engine Implementation</h3>
                <p>
                  NovaCommerce uses a custom hash-based Single Page Application (SPA) routing engine. The router monitors <code>hashchange</code> and <code>DOMContentLoaded</code> browser events:
                </p>
                <div class="route-table-wrapper">
                  <table class="route-table">
                    <thead>
                      <tr>
                        <th>Route Pattern</th>
                        <th>View Controller</th>
                        <th>Dynamic Parameters</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>#/</code> or <code>#/home</code></td>
                        <td><code>HomeView</code></td>
                        <td>None</td>
                      </tr>
                      <tr>
                        <td><code>#/products</code></td>
                        <td><code>CatalogView</code></td>
                        <td>Query: <code>category, q, page</code></td>
                      </tr>
                      <tr>
                        <td><code>#/product/:id</code></td>
                        <td><code>ProductView</code></td>
                        <td>Param: <code>id</code> (Extracted via Regex)</td>
                      </tr>
                      <tr>
                        <td><code>#/cart</code></td>
                        <td><code>CartView</code></td>
                        <td>None</td>
                      </tr>
                      <tr>
                        <td><code>#/wishlist</code></td>
                        <td><code>WishlistView</code></td>
                        <td>None</td>
                      </tr>
                      <tr>
                        <td><code>#/checkout</code></td>
                        <td><code>CheckoutView</code></td>
                        <td>None</td>
                      </tr>
                      <tr>
                        <td><code>#/architecture</code></td>
                        <td><code>ArchitectureView</code></td>
                        <td>Anchor hash navigation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="arch-block">
                <h3>Regex Route Matching Mechanism</h3>
                <pre class="code-snippet"><code>// Dynamic Route Registration & Parameter Extraction
addRoute(pattern, ViewClass) {
  // Convert /product/:id -> /product/([^/]+)
  const paramNames = [];
  const regexPattern = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  
  this.routes.push({
    regex: new RegExp('^' + regexPattern + '$'),
    paramNames,
    ViewClass
  });
}</code></pre>
                <div class="callout callout-info">
                  <strong>Static Host Resilience:</strong> By utilizing hash-based routing paired with fallback <code>_redirects</code> and <code>vercel.json</code> rewrites, the application guarantees 100% deep-link functionality across any cloud host without 404 errors.
                </div>
              </div>
            </div>
          </section>

          <!-- Section 3: Reactive State Management -->
          <section id="state" class="arch-section-card">
            <div class="section-card-header">
              <div class="arch-badge-icon">${icons.zap}</div>
              <div>
                <h2>3. Reactive State Management & Persistence</h2>
                <p>Centralized Pub/Sub store synchronizing UI components with browser storage.</p>
              </div>
            </div>

            <div class="arch-state-flow">
              <div class="flow-step">
                <span class="flow-step-num">Step 1</span>
                <strong>User Action</strong>
                <span>e.g., Click "Add to Cart" or Toggle Theme</span>
              </div>
              <div class="flow-arrow">${icons.chevronRight}</div>
              <div class="flow-step">
                <span class="flow-step-num">Step 2</span>
                <strong>Store Mutation</strong>
                <span><code>store.addToCart(product, qty)</code></span>
              </div>
              <div class="flow-arrow">${icons.chevronRight}</div>
              <div class="flow-step">
                <span class="flow-step-num">Step 3</span>
                <strong>Storage Sync</strong>
                <span>Persist to <code>localStorage</code></span>
              </div>
              <div class="flow-arrow">${icons.chevronRight}</div>
              <div class="flow-step">
                <span class="flow-step-num">Step 4</span>
                <strong>Event Dispatch</strong>
                <span><code>store.emit('cart:updated')</code></span>
              </div>
              <div class="flow-arrow">${icons.chevronRight}</div>
              <div class="flow-step">
                <span class="flow-step-num">Step 5</span>
                <strong>UI Reaction</strong>
                <span>Navbar Badge updates + Toast appears</span>
              </div>
            </div>
          </section>

          <!-- Section 4: Asset & Performance Optimization -->
          <section id="optimization" class="arch-section-card">
            <div class="section-card-header">
              <div class="arch-badge-icon">${icons.sparkles}</div>
              <div>
                <h2>4. Digital Asset & Performance Optimization</h2>
                <p>Engineered for perfect Lighthouse scores, sub-second First Contentful Paint (FCP), and zero CLS.</p>
              </div>
            </div>

            <div class="arch-grid-3">
              <div class="optimization-card">
                <div class="opt-icon">${icons.zap}</div>
                <h4>Responsive Image Pipeline</h4>
                <p>
                  All catalog media is delivered through an optimized CDN with automated WebP format negotiation, quality compression (<code>q=80</code>), and strict responsive dimensions.
                </p>
                <div class="opt-pill"><code>loading="lazy" decoding="async"</code></div>
              </div>

              <div class="optimization-card">
                <div class="opt-icon">${icons.code}</div>
                <h4>Zero Layout Shift (CLS = 0)</h4>
                <p>
                  Images feature explicit <code>width</code>, <code>height</code>, and CSS <code>aspect-ratio: 1 / 1</code> properties, reserving browser layout space prior to asset arrival.
                </p>
                <div class="opt-pill">CLS Score: 0.000</div>
              </div>

              <div class="optimization-card">
                <div class="opt-icon">${icons.layers}</div>
                <h4>Inline Vector SVGs</h4>
                <p>
                  Zero external web font dependencies (FontAwesome/Material). Inline vectors eliminate render-blocking CSS requests and ensure pixel-perfect fidelity on Retina displays.
                </p>
                <div class="opt-pill">0 Font Network Latency</div>
              </div>
            </div>
          </section>

          <!-- Section 5: Cloud Deployment -->
          <section id="deployment" class="arch-section-card">
            <div class="section-card-header">
              <div class="arch-badge-icon">${icons.truck}</div>
              <div>
                <h2>5. Live Production Cloud Deployment</h2>
                <p>Instantaneous global deployment configurations prepared for Vercel, Netlify, and Render.</p>
              </div>
            </div>

            <div class="deployment-options-grid">
              <!-- Option 1: Netlify -->
              <div class="deploy-platform-card">
                <div class="platform-header">
                  <h4>Option 1: Netlify Drop / CLI</h4>
                  <span class="badge badge-accent">10 Seconds • Zero CLI</span>
                </div>
                <p>The fastest live public deployment without installing CLI tools:</p>
                <ol class="deploy-steps">
                  <li>Visit <a href="https://app.netlify.com/drop" target="_blank" rel="noopener">app.netlify.com/drop</a> in your browser.</li>
                  <li>Drag & drop the <code>ecommerce-capstone</code> folder directly into the browser window.</li>
                  <li>Netlify automatically deploys your live site with an immediate public <code>.netlify.app</code> URL!</li>
                </ol>
                <div class="platform-config-tag">Configured via <code>netlify.toml</code> & <code>_redirects</code></div>
              </div>

              <!-- Option 2: Vercel -->
              <div class="deploy-platform-card">
                <div class="platform-header">
                  <h4>Option 2: Vercel</h4>
                  <span class="badge badge-primary">Vercel CLI / Git</span>
                </div>
                <p>Deploy directly via Vercel GitHub integration or CLI:</p>
                <pre class="code-snippet"><code># Run in project folder
npx vercel --prod</code></pre>
                <p>Or import repository directly into Vercel Dashboard for instant deployment with public <code>.vercel.app</code> URL.</p>
                <div class="platform-config-tag">Configured via <code>vercel.json</code></div>
              </div>

              <!-- Option 3: GitHub Pages -->
              <div class="deploy-platform-card">
                <div class="platform-header">
                  <h4>Option 3: GitHub Pages</h4>
                  <span class="badge badge-outline">Continuous Deployment</span>
                </div>
                <p>Push to GitHub to deploy instantly:</p>
                <pre class="code-snippet"><code>git add .
git commit -m "Deploy capstone project"
git push origin master</code></pre>
                <p>Enable GitHub Pages in repository Settings &gt; Pages &gt; Deploy from Branch (root).</p>
                <div class="platform-config-tag">Automated via <code>.github/workflows/deploy.yml</code></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }
}
