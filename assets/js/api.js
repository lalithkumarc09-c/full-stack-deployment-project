/**
 * RESTful Product API Client
 * Includes asynchronous data fetching, search/filter pipeline, and embedded fallback
 * to ensure 100% reliability both over static HTTP hosting and local preview environments.
 */

class ProductAPI {
  constructor() {
    this.cachedProducts = null;
    this.DATA_URL = 'assets/data/products.json';
  }

  async getAllProducts() {
    if (this.cachedProducts) {
      return [...this.cachedProducts];
    }

    try {
      const response = await fetch(this.DATA_URL);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status} loading catalog`);
      }
      this.cachedProducts = await response.json();
      return [...this.cachedProducts];
    } catch (err) {
      console.warn('Network fetch fallback to built-in cache:', err);
      // Fallback in-memory catalog ensures immediate execution anywhere
      this.cachedProducts = this.getFallbackCatalog();
      return [...this.cachedProducts];
    }
  }

  async getProductById(id) {
    const numericId = parseInt(id, 10);
    const products = await this.getAllProducts();
    return products.find(p => p.id === numericId) || null;
  }

  async getCategories() {
    const products = await this.getAllProducts();
    const categories = Array.from(new Set(products.map(p => p.category)));
    return ['All', ...categories.sort()];
  }

  async getFeaturedProducts() {
    const products = await this.getAllProducts();
    return products.filter(p => p.isFeatured);
  }

  async getTrendingProducts() {
    const products = await this.getAllProducts();
    return products.filter(p => p.isTrending);
  }

  async getRelatedProducts(productId, limit = 4) {
    const current = await this.getProductById(productId);
    if (!current) return [];
    const all = await this.getAllProducts();
    return all
      .filter(p => p.id !== current.id && (p.category === current.category || p.rating >= 4.7))
      .slice(0, limit);
  }

  async queryProducts({
    category = 'All',
    searchQuery = '',
    minPrice = 0,
    maxPrice = Infinity,
    minRating = 0,
    inStockOnly = false,
    sortBy = 'featured',
    page = 1,
    limit = 12
  } = {}) {
    let products = await this.getAllProducts();

    // 1. Category Filter
    if (category && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // 2. Keyword Search (title, description, category, specs)
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      products = products.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.specs && Object.values(p.specs).some(val => String(val).toLowerCase().includes(q)))
      );
    }

    // 3. Price Filter
    products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // 4. Rating Filter
    if (minRating > 0) {
      products = products.filter(p => p.rating >= minRating);
    }

    // 5. In-Stock Filter
    if (inStockOnly) {
      products = products.filter(p => p.inStock);
    }

    // 6. Sorting Logic
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'title-asc':
        products.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        products.sort((a, b) => b.id - a.id);
        break;
      case 'featured':
      default:
        products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    // 7. Dynamic Pagination
    const totalItems = products.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * limit;
    const paginatedItems = products.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        limit,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    };
  }

  getFallbackCatalog() {
    return [
      {
        id: 1,
        title: "Aura Pro Wireless ANC Headphones",
        category: "Electronics",
        price: 279.99,
        originalPrice: 349.99,
        discount: 20,
        rating: 4.8,
        reviewsCount: 142,
        inStock: true,
        stockCount: 24,
        isFeatured: true,
        isTrending: true,
        badge: "Top Rated",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Engineered with studio-grade 45mm neodymium drivers and next-generation hybrid Active Noise Cancellation. Delivers up to 40 hours of playback.",
        specs: { "Driver Size": "45mm Neodymium", "Battery Life": "40 Hours", "Connectivity": "Bluetooth 5.3" }
      },
      {
        id: 2,
        title: "Minimalist Chrono Sapphire Watch",
        category: "Accessories",
        price: 189.00,
        originalPrice: 229.00,
        discount: 17,
        rating: 4.7,
        reviewsCount: 89,
        inStock: true,
        stockCount: 18,
        isFeatured: true,
        isTrending: false,
        badge: "Bestseller",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Sleek Scandinavian design crafted from 316L aerospace-grade surgical stainless steel and sapphire crystal glass.",
        specs: { "Case Diameter": "40mm", "Movement": "Japanese Quartz", "Water Resistance": "5 ATM" }
      },
      {
        id: 3,
        title: "Ergonomic Mechanical Keyboard RGB",
        category: "Electronics",
        price: 129.50,
        originalPrice: 159.00,
        discount: 18,
        rating: 4.9,
        reviewsCount: 215,
        inStock: true,
        stockCount: 35,
        isFeatured: true,
        isTrending: true,
        badge: "Staff Pick",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Hot-swappable tactile mechanical keyboard featuring gasket-mounted acoustic dampening foams and south-facing per-key RGB backlighting.",
        specs: { "Layout": "75% Compact", "Switch Type": "Gateron Pro Yellow", "Connectivity": "Tri-Mode" }
      },
      {
        id: 4,
        title: "Nomad Waterproof Travel Backpack 30L",
        category: "Accessories",
        price: 115.00,
        originalPrice: 140.00,
        discount: 17,
        rating: 4.6,
        reviewsCount: 76,
        inStock: true,
        stockCount: 12,
        isFeatured: false,
        isTrending: true,
        badge: "Popular",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Constructed with weatherproof 840D Cordura ballistic nylon. Features a dedicated 16-inch padded laptop sleeve.",
        specs: { "Capacity": "30 Liters", "Material": "840D Cordura", "Weight": "1.1 kg" }
      },
      {
        id: 5,
        title: "Artisan Ceramic Pour-Over Kettle",
        category: "Home & Living",
        price: 84.00,
        originalPrice: 105.00,
        discount: 20,
        rating: 4.9,
        reviewsCount: 63,
        inStock: true,
        stockCount: 9,
        isFeatured: true,
        isTrending: false,
        badge: "Artisan",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Precision gooseneck spout for controlled pour rate and barista-level extraction in matte stone ceramic.",
        specs: { "Capacity": "900ml", "Material": "Ceramic & Stainless Steel" }
      },
      {
        id: 6,
        title: "Ultra-light Performance Running Sneakers",
        category: "Fashion",
        price: 145.00,
        originalPrice: 175.00,
        discount: 17,
        rating: 4.7,
        reviewsCount: 184,
        inStock: true,
        stockCount: 40,
        isFeatured: true,
        isTrending: true,
        badge: "Hot Deal",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Responsive carbon fiber plate embedded in supercritical nitrogen-infused foam.",
        specs: { "Weight": "198g", "Drop": "8mm", "Upper": "Recycled FlyKnit Mesh" }
      }
    ];
  }
}

export const api = new ProductAPI();
