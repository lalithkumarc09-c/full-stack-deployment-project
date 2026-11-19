/**
 * Helper Utilities & Formatting
 */
import { icons } from './icons.js';

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function truncateText(str, maxLength = 80) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + '...';
}

export function renderStars(rating, reviewsCount = null) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4 && rating % 1 < 0.8;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let starsHtml = '';
  for (let i = 0; i < fullStars; i++) {
    starsHtml += `<span class="star-icon star-filled">${icons.star}</span>`;
  }
  if (hasHalfStar) {
    starsHtml += `<span class="star-icon star-half">${icons.starHalf}</span>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += `<span class="star-icon star-empty">${icons.starEmpty}</span>`;
  }

  return `
    <div class="rating-stars" aria-label="Rating: ${rating} out of 5 stars">
      ${starsHtml}
      <span class="rating-value">${rating.toFixed(1)}</span>
      ${reviewsCount !== null ? `<span class="reviews-count">(${reviewsCount})</span>` : ''}
    </div>
  `;
}

export function validateCoupon(code, subtotal) {
  const normalized = (code || '').trim().toUpperCase();
  const coupons = {
    'WELCOME10': { type: 'percent', value: 10, label: '10% Welcome Discount' },
    'NOVA20': { type: 'percent', value: 20, label: '20% Mega Savings' },
    'FREESHIP': { type: 'shipping', value: 15, label: 'Free Express Shipping' },
    'CAPSTONE30': { type: 'percent', value: 30, label: '30% Capstone Reviewer Bonus' }
  };

  if (!coupons[normalized]) {
    return { valid: false, message: 'Invalid or expired coupon code. Try WELCOME10 or NOVA20' };
  }

  const promo = coupons[normalized];
  let discountAmount = 0;
  if (promo.type === 'percent') {
    discountAmount = (subtotal * promo.value) / 100;
  } else if (promo.type === 'shipping') {
    discountAmount = promo.value;
  }

  return {
    valid: true,
    code: normalized,
    label: promo.label,
    discountAmount: Math.round(discountAmount * 100) / 100
  };
}

export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}
