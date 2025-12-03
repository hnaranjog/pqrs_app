/**
 * Initializes a Quill rich text editor on a given container element.
 * This function is designed to be called when the editor's container becomes visible,
 * for example, when a modal is shown.
 *
 * @param {string} containerSelector - The CSS selector for the div that will become the editor.
 * @param {object} [options={}] - Optional Quill configuration options.
 * @returns {Quill|null} The Quill instance or null if the container is not found or already initialized.
 */
function initializeQuillEditor(containerSelector, options = {}) {
  const container = document.querySelector(containerSelector);

  // Don't initialize if the container doesn't exist or already has a Quill instance.
  if (!container || container.quill) {
    return container ? container.quill : null;
  }

  const defaults = {
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        ['link'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ],
    },
    placeholder: 'Registre los detalles de su solicitud aquí...',
    theme: 'snow'
  };

  const config = { ...defaults, ...options };
  const quill = new Quill(container, config);

  // Link to a hidden input for form submission if a target is specified
  const form = container.closest('form');
  const targetInputId = container.dataset.targetInput;

  if (form && targetInputId) {
    const targetInput = form.querySelector(`#${targetInputId}`);
    if (targetInput) {
      quill.on('text-change', () => {
        targetInput.value = quill.getLength() > 1 ? quill.root.innerHTML : '';
      });
    }
  }

  container.quill = quill; // Attach the instance to the element to prevent re-initialization
  return quill;
}