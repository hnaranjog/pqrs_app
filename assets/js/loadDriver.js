// Este archivo se encarga de toda la funcionalidad del tour guiado con Driver.js.

/**
 * Carga los assets de Driver.js y configura los tours para las páginas correspondientes.
 */
function setupGuidedTours() {
    // 1. Cargar el CSS de Driver.js
    const driverCSS = document.createElement('link');
    driverCSS.rel = 'stylesheet';
    driverCSS.href = 'https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.css';
    document.head.appendChild(driverCSS);

    // 2. Cargar el script de Driver.js y configurar la lógica en su callback 'onload'
    const driverScript = document.createElement('script');
    driverScript.src = 'https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.js.iife.js';
    driverScript.onload = () => {
        // Este código se ejecuta solo después de que driver.js se ha cargado completamente.

        // Detecta y normaliza la API de Driver.js (v2 IIFE, v2 ESM global, o v1 legacy)
        const getDriver = (options) => {
            const g = window;
            if (g.driver && g.driver.js && typeof g.driver.js.driver === 'function') {
                return g.driver.js.driver(options);
            }
            // driver.js v2 (algunas builds exponen window.driver como función)
            if (typeof g.driver === 'function') {
                return g.driver(options);
            }
            // driver.js v1 (exponía class window.Driver que requiere new + defineSteps + start)
            if (typeof g.Driver === 'function') {
                const instance = new g.Driver(options || {});
                return {
                    drive() {
                        if (options && Array.isArray(options.steps)) {
                            if (typeof instance.defineSteps === 'function') {
                                instance.defineSteps(options.steps);
                            }
                        }
                        if (typeof instance.start === 'function') {
                            instance.start();
                        }
                    }
                };
            }
            console.error('Driver.js no se encontró en el contexto global. Verifica la URL/CDN cargada.');
            return null;
        };

        // --- Lógica para el Tour Guiado en la página de inicio ---
        if (window.location.pathname.includes('/app/home.html')) {
            // El botón ahora está dentro del widget del asesor.
            const asesorWidget = document.querySelector('.asesor-widget-utp');
            const startTourBtn = asesorWidget ? asesorWidget.querySelector('#start-tour-btn') : null;

            if (startTourBtn && asesorWidget) {
                startTourBtn.addEventListener('click', () => {
                    const driverObj = getDriver({
                        showProgress: true,
                        animate: true,
                        steps: [
                            { element: '#home-title', popover: { title: 'Bienvenido al Sistema PQRS', description: 'Desde aquí puedes gestionar todas tus peticiones, quejas, reclamos y sugerencias.' } },
                            { element: '#info-links', popover: { title: 'Información Útil', description: 'Antes de radicar, te recomendamos consultar estas secciones para resolver dudas comunes.' } },
                            { element: '#action-buttons', popover: { title: 'Acciones Principales', description: 'Usa estos botones para crear una nueva solicitud o consultar una existente.' } },
                            { element: asesorWidget, popover: { title: 'Menú de Ayuda', description: 'Desde aquí puedes acceder a ayudas rápidas o iniciar este tour nuevamente.' } },
                            { element: '#info-alert', popover: { title: '¡Importante!', description: 'Recuerda no duplicar tus solicitudes para agilizar el proceso de respuesta.' } },
                            { popover: { title: '¡Todo Listo!', description: 'Ya conoces lo principal. ¡Adelante!' } }
                        ]
                    });
                    if (driverObj && typeof driverObj.drive === 'function') {
                        driverObj.drive();
                    }
                });
            }
        } else {
            // Si no estamos en la página de inicio, ocultamos el botón del tour.
            const tourButtonInWidget = document.querySelector('.asesor-widget-utp #start-tour-btn');
            if (tourButtonInWidget) {
                tourButtonInWidget.style.display = 'none';
            }
        }
    };
    document.body.appendChild(driverScript);
}

// Iniciar la configuración de los tours.
setupGuidedTours();
