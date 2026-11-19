/**
 * Toast Notification System
 * Listens to store 'toast:show' events and renders elegant floating alerts.
 */
import { icons } from '../utils/icons.js';
import { store } from '../store.js';

export class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }

    store.subscribe('toast:show', (toastData) => this.show(toastData));
  }

  show({ type = 'info', title = '', message = '', duration = 3500 }) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;

    const iconMap = {
      success: icons.check,
      info: icons.sparkles,
      warning: icons.shield,
      error: icons.x
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type] || icons.sparkles}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">${icons.x}</button>
      <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    setTimeout(() => {
      this.dismiss(toast);
    }, duration);
  }

  dismiss(toast) {
    if (!toast || toast.classList.contains('dismissing')) return;
    toast.classList.add('dismissing');
    toast.addEventListener('animationend', () => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    });
  }
}
