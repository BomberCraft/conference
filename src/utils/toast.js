export const showToast = (message, duration = 'short', position = 'bottom') => new Promise((resolve, reject) => {
  window.plugins.toast.hide((event) => {
    window.plugins.toast.showWithOptions({
      message,
      duration,
      position,
    });
  });
});
