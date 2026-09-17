// js/components/toast.js
export function toastStore() {
  return {
    toasts: [],
    addToast(title, message, type = 'info') {
      const id = Date.now();
      this.toasts.push({ id, title, message, type });
      setTimeout(() => {
        this.removeToast(id);
      }, 4000);
    },
    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  };
}
