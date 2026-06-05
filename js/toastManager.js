// ── Toast Manager ──
// Pixel-art style notification toasts

class ToastManager {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    Object.assign(this.container.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: '9999',
      pointerEvents: 'none'
    });
    
    // Create CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes toastSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes toastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .pixel-toast {
        background: #fff;
        border: 4px solid #1a2a3a;
        box-shadow: 4px 4px 0 rgba(26,42,58,0.5);
        padding: 12px 20px;
        font-family: 'VT323', monospace;
        font-size: 22px;
        color: #1a2a3a;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      .pixel-toast.hide {
        animation: toastSlideOut 0.3s ease-in forwards;
      }
      .toast-icon { font-size: 24px; }
      .toast-success .toast-icon { color: #2ecc71; }
      .toast-error .toast-icon { color: #e74c3c; }
      .toast-info .toast-icon { color: #3498db; }
    `;
    document.head.appendChild(style);
    
    // Defer appending to ensure body exists
    if (document.body) {
      document.body.appendChild(this.container);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body.appendChild(this.container));
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `pixel-toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  }
}

window.toastManager = new ToastManager();
