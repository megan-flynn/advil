document.getElementById('embedded-form').addEventListener(
  'formComplete',
  function(event) {
    if (String(event.detail.submitLabel).toUpperCase() === 'CANCEL') {
      window.parent.postMessage('form-cancelled', '*');
    } else {
      window.parent.postMessage('form-submitted', '*');
    }
  },
  false
);

document.getElementById('embedded-form').addEventListener(
  'dismiss',
  function(event) {
    window.parent.postMessage('form-cancelled', '*');
  },
  false
);

/* global ResizeObserver */
const ro = new ResizeObserver(entries => {
  entries.forEach(entry => {
    window.parent.postMessage(
      `embed-resize: ${entry.contentRect.width} x ${entry.contentRect.height}`,
      '*'
    );
  });
});
ro.observe(document.querySelector('appian-action, appian-task'));
