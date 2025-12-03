(() => {
    /**
     * Asynchronously loads multiple HTML component files and injects their content
     * into a single placeholder element.
     * @param {string} selector - The CSS selector for the placeholder element.
     * @param {string[]} urls - An array of URLs for the HTML content to load.
     * @returns {Promise<boolean>} - True if components were loaded, false otherwise.
     */
    const loadDynamicComponents = async (selector, urls) => {
        const placeholder = document.querySelector(selector);
        if (!placeholder) {
            return false; // Placeholder not found on this page.
        }

        try {
            const responses = await Promise.all(urls.map(url => fetch(url)));
            const htmlContents = await Promise.all(responses.map(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status} for ${res.url}`);
                }
                return res.text();
            }));
            
            placeholder.innerHTML = htmlContents.join('');
            return true; // Components loaded successfully.
        } catch (error) {
            console.error('Could not load dynamic components:', error);
            return false;
        }
    };

    /**
     * Sets up event listeners for radio buttons to enable a target button and
     * set the correct modal target based on the user's selection.
     * @param {string} radioGroupName - The 'name' attribute of the radio buttons.
     * @param {string} buttonId - The ID of the button to enable/configure.
     * @param {boolean} [useId=false] - If true, uses the radio button's ID instead of its value for the modal target.
     */
    const setupModalTriggers = (radioGroupName, buttonId, useId = false) => {
        const radios = document.querySelectorAll(`input[name="${radioGroupName}"]`);
        const targetBtn = document.getElementById(buttonId);

        if (!radios.length || !targetBtn) {
            return; // Required elements not found.
        }

        radios.forEach(radio => {
            radio.addEventListener('change', (event) => {
                const selectedRadio = event.target;
                const selectedValue = useId ? selectedRadio.id : selectedRadio.value;
                
                // Determinar el modal target. Para SQR, todos usan 'sugerenciaModal'.
                let modalTarget = `#${selectedValue}Modal`;
                if (radioGroupName === 'form-pqr') {
                    modalTarget = '#sugerenciaModal'; // Unificamos los 3 a un solo modal.
                    // Guardamos el título y el tipo en el botón para usarlo después.
                    targetBtn.dataset.modalTitle = selectedRadio.dataset.modalTitle || 'Formulario de Sugerencias';
                    targetBtn.dataset.formType = selectedRadio.value;
                }

                targetBtn.disabled = false; // Enable the button
                targetBtn.setAttribute('data-bs-target', modalTarget);
            });
        });
    };

    // --- Main Execution ---
    // On pages like radicar.html, we expect placeholders for modals.
    const modalFiles = [
        '/app/forms/sugerencias.html',
        '/app/forms/peticiones.html',
        '/app/forms/denuncias.html',
        '/app/forms/consultas.html'
    ];

    loadDynamicComponents('#modal-placeholder', modalFiles)
        .then(loaded => {
            if (loaded) {
                // Setup triggers for SQR, Derecho de Petición, and Denuncias sections
                setupModalTriggers('form-pqr', 'btn-sqr-utp');
                setupModalTriggers('form-dp', 'btn-dp-utp');
                setupModalTriggers('form-denuncia', 'btn-denuncia-utp');
            }
        });

    loadDynamicComponents('#modal-request-placeholder', modalFiles)
        .then(loaded => {
            if (loaded) {
                // On 'consultar.html', setup triggers using the radio button's ID.
                setupModalTriggers('form-request-dp', 'btn-consultar-utp', true);
            }
        });

    // --- Quill Editor Initialization on Modal Show ---
    // This ensures the editor is initialized only when it becomes visible.
    document.addEventListener('show.bs.modal', function (event) {
        const modal = event.target;
        const triggerButton = event.relatedTarget; // El botón que abrió el modal

        // Cambiar el título del modal de SQR dinámicamente
        if (modal.id === 'sugerenciaModal' && triggerButton && triggerButton.dataset.modalTitle) {
            const modalTitle = modal.querySelector('.modal-title');
            modalTitle.textContent = triggerButton.dataset.modalTitle;
        }

        // Using setTimeout to ensure the modal is fully in the process of showing
        setTimeout(() => {
            // Find any element within the modal that needs to be a Quill editor
            const editorContainer = modal.querySelector('[data-target-input]');
            if (editorContainer && editorContainer.id && typeof initializeQuillEditor === 'function') {
                initializeQuillEditor(`#${editorContainer.id}`);
            }

            // Attempt to render reCAPTCHA if it's in the modal
            if (modal.querySelector('#recaptcha-container')) {
                renderRecaptcha();
            }
        }, 10); // A small delay can help with timing issues.
    });

    let recaptchaRendered = false; // Flag to prevent re-rendering
    /**
     * Renderiza el widget de reCAPTCHA explícitamente.
     * Esta función es llamada por onloadCallback cuando la API de Google está lista.
     */
    const renderRecaptcha = () => {
        const recaptchaContainer = document.getElementById('recaptcha-container');
        // Render only if the container exists, grecaptcha is loaded, and it hasn't been rendered yet.
        if (recaptchaContainer && typeof grecaptcha !== 'undefined' && !recaptchaRendered) {
            grecaptcha.render('recaptcha-container', {
                'sitekey' : '6LdjBiAUAAAAANeEvzVKio2R-NfoJDb--dorX_u6'
            });
            recaptchaRendered = true; // Mark as rendered
        }
    };

    /**
     * Callback global que se ejecuta cuando el script de reCAPTCHA ha cargado.
     * Se adjunta al objeto window para ser accesible globalmente.
     */
    window.onloadCallback = function() {
        renderRecaptcha();
    };

        /**
     * Configura la lógica para mostrar/ocultar campos adicionales en el formulario de sugerencias
     * basado en la selección del tipo de identificación.
     */
    const setupSugerenciasFormLogic = () => {
        const requesterIdTypeSelect = document.getElementById('requester-id-type');
        const requesterExtraFields = document.getElementById('requester-extra-fields');

        if (requesterIdTypeSelect && requesterExtraFields) {
            requesterIdTypeSelect.addEventListener('change', function() {
                const fieldsToToggle = requesterExtraFields.querySelectorAll('input, select');
                
                // Si se selecciona cualquier opción que no sea la de por defecto ("")
                if (this.value) {
                    // Mostrar los campos extra
                    requesterExtraFields.classList.remove('d-none');
                    // Hacerlos requeridos
                    fieldsToToggle.forEach(field => field.required = true);
                } else {
                    // Ocultar los campos si se vuelve a la opción "Seleccione..."
                    requesterExtraFields.classList.add('d-none');
                    // Quitar el atributo 'required' para que no se validen
                    fieldsToToggle.forEach(field => field.required = false);
                }
            });
        }
    };

    /**
     * Configura la lógica para mostrar los nombres de los archivos seleccionados en un campo de tipo 'file' múltiple.
     */
    const setupFileUploadDisplay = () => {
        const fileInput = document.getElementById('requester-file');
        const fileListContainer = document.getElementById('file-list-container');
        const fileList = document.getElementById('file-list');

        if (fileInput && fileListContainer && fileList) {
            // Almacenará los archivos seleccionados
            let selectedFiles = new DataTransfer();

            fileInput.addEventListener('change', function() {
                // Añadir nuevos archivos a nuestra lista
                for (const file of this.files) {
                    selectedFiles.items.add(file);
                }
                // Actualizar el input y la UI
                updateFileInputAndUI();
            });

            function updateFileInputAndUI() {
                // Sincronizar el input de archivo con nuestra lista de archivos
                fileInput.files = selectedFiles.files;

                // Limpiar la lista visual
                fileList.innerHTML = '';

                if (selectedFiles.items.length > 0) {
                    fileListContainer.classList.remove('d-none');

                    // Crear un elemento de lista para cada archivo
                    for (let i = 0; i < selectedFiles.items.length; i++) {
                        const file = selectedFiles.items[i].getAsFile();
                        const listItem = document.createElement('li');
                        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                        listItem.innerHTML = `
                            <span class="file-name-text">${file.name}</span>
                            <button type="button" class="btn-close remove-file-btn" data-index="${i}" aria-label="Quitar archivo"></button>
                        `;
                        fileList.appendChild(listItem);
                    }

                    // Añadir listeners a los nuevos botones de quitar
                    document.querySelectorAll('.remove-file-btn').forEach(button => {
                        button.addEventListener('click', function() {
                            const indexToRemove = parseInt(this.getAttribute('data-index'));
                            const newFiles = new DataTransfer();
                            for (let i = 0; i < selectedFiles.items.length; i++) {
                                if (i !== indexToRemove) {
                                    newFiles.items.add(selectedFiles.items[i].getAsFile());
                                }
                            }
                            selectedFiles = newFiles; // Reemplazar con la nueva lista
                            updateFileInputAndUI(); // Actualizar todo de nuevo
                        });
                    });
                } else {
                    fileListContainer.classList.add('d-none');
                }
            }
        }
    };
    // --- Inicialización de lógica de formularios después de que se cargan los modales ---
    // Usamos un observador para detectar cuándo se añaden los modales al DOM.
    const modalObserver = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Una vez que los modales están en el DOM, podemos adjuntar los listeners.
                // Verificamos si el formulario de sugerencias ya existe.
                if (document.getElementById('sugerencia-form')) {
                    setupSugerenciasFormLogic();
                    setupFileUploadDisplay();
                    // Desconectamos el observador para no seguir escuchando cambios innecesarios.
                    observer.disconnect();
                    break; // Salimos del bucle una vez que encontramos lo que buscábamos.
                }
            }
        }
    });

    // Empezamos a observar el placeholder de los modales para cuando se inyecte el contenido.
    const modalPlaceholder = document.getElementById('modal-placeholder');
    if (modalPlaceholder) {
        modalObserver.observe(modalPlaceholder, { childList: true, subtree: true });
    }
})();
