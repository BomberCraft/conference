export const showToast = (message, duration = 'short', position = 'bottom') => new Promise((resolve, reject) => {
  window.plugins.toast.showWithOptions({
    message,
    duration,
    position,
  }, resolve, reject);
});
