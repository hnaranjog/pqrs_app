// Este script se carga después de que todos los componentes HTML han sido inyectados en el DOM por loader.js

// --- LÓGICA PARA SIDEBAR IZQUIERDO Y CONTENIDO PRINCIPAL ---
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const sidebarLeft = document.getElementById('sidebar-left');
const mainContainer = document.getElementById('main-container');
const profileBtn = document.getElementById('profile-btn-utp');
let isSidebarPinned = false;

const toggleMenuIcon = () => {
  if (sidebarToggleBtn && sidebarLeft) {
    const isSidebarActive = sidebarLeft.classList.contains('active');
    sidebarToggleBtn.setAttribute('aria-label', isSidebarActive ? 'Cerrar menú principal' : 'Abrir menú principal');
  }
};

const updateMainContainerShift = () => {
    // El menú de accesibilidad es un offcanvas, por lo que no empuja el contenido.
    // Solo nos preocupamos por el menú izquierdo.
    if (mainContainer && sidebarLeft) {
        if (sidebarLeft.classList.contains('active')) {
            mainContainer.classList.add('shifted-left');
        } else {
            mainContainer.classList.remove('shifted-left');
        }
    }
};

if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', (event) => {
        if (sidebarLeft) {
            isSidebarPinned = !sidebarLeft.classList.contains('active'); // Pin if opening, unpin if closing
            sidebarLeft.classList.toggle('active');
            event.stopPropagation(); // Evita que el clic se propague al main-container
            updateMainContainerShift();
            toggleMenuIcon();
        }
    });
}

// Expand sidebar on hover, collapse on leave if not pinned
if (sidebarLeft) {
    sidebarLeft.addEventListener('mouseenter', () => {
        if (!sidebarLeft.classList.contains('active')) {
            sidebarLeft.classList.add('active');
            updateMainContainerShift();
            toggleMenuIcon();
        }
    });

    sidebarLeft.addEventListener('mouseleave', () => {
        if (sidebarLeft.classList.contains('active') && !isSidebarPinned) {
            sidebarLeft.classList.remove('active');
            updateMainContainerShift();
            toggleMenuIcon();
        }
    });
}

// Ocultar sidebar izquierda al hacer clic en el contenido principal
if (mainContainer) {
    mainContainer.addEventListener('click', () => {
        if (sidebarLeft && sidebarLeft.classList.contains('active')) {
            isSidebarPinned = false; // Always unpin when clicking outside
            sidebarLeft.classList.remove('active');
            updateMainContainerShift();
            toggleMenuIcon();
        }
    });
}

// --- LÓGICA PARA EL WIDGET DEL ASESOR ---
const asesorToggleBtn = document.getElementById('asesor-toggle-btn');
const asesorWidget = asesorToggleBtn ? asesorToggleBtn.closest('.asesor-widget-utp') : null;

if (asesorToggleBtn && asesorWidget) {
    asesorToggleBtn.addEventListener('click', () => {
        asesorWidget.classList.toggle('active');
        const isExpanded = asesorWidget.classList.contains('active');
        asesorToggleBtn.setAttribute('aria-expanded', isExpanded);
        asesorToggleBtn.setAttribute('aria-label', isExpanded ? 'Cerrar menú de ayuda' : 'Abrir menú de ayuda');
    });
}


// --- WIDGET DE ACCESIBILIDAD (Lógica unificada de accesibilidad.js) ---
(
  function() {
  // VARIABLES GLOBALES
  const body = document.documentElement;
  const minZoom = 100;
  const maxZoom = 200;
  const step = 20;

  const anchoBarra = 750;
  const altoBarra = 10;
  const mitadAncho = anchoBarra / 2;
  const mitadAlto = altoBarra / 2;
  let reglaX = 0;
  let reglaY = 0;
  let mouseObjetivoX = null;
  let mouseObjetivoY = null;
  let animacionRegla = null;
  let y = window.innerHeight / 2;
  let spotlightActive = false;
  let indiceModo = 0;

  const modosVisuales = ['', 'modo-lectura', 'alto-contraste'];
  const nombresModos = {
    '': 'Modo Lectura',
    'modo-lectura': 'Alto Contraste',
    'alto-contraste': 'Restablecer Contraste'
  };

  let lectorActivo = false;

  // Variables globales para presentaciÃ³n visual
  let indicePresentacion = 0;
  const estadosPresentacion = ["", "80", "50"];
  const nombresPresentacion = {
    "": "Presentación ancha",
    "80": "Presentación estrecha",
    "50": "Restablecer presentación"
  };

  // ESTILOS
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = '/assets/css/accesibilidad.css';
  document.head.appendChild(cssLink);

  // OVERLAY SPOTLIGHT
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.style.maskImage = 'none';
  overlay.style.display = 'none';
  document.body.appendChild(overlay);

  // --- ESTILOS PARA BOTONES DEL WIDGET ---
  const widgetStyles = document.createElement('style');
  widgetStyles.textContent = `
    /* Ancho del widget de accesibilidad */
    #accessibilityCanvas {
      --bs-offcanvas-width: 320px;
    }

    /* Rediseño de los botones del widget de accesibilidad */
    #accessibilityCanvas .offcanvas-body .btn-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem; /* Espacio entre botones */
    }

    #accessibilityCanvas .btn-accesibilidad {
        background-color: #003D6D;
        color: white;
        border: none;
        padding: 1rem;
        width: 100%;
        margin-bottom: 0; /* El gap del contenedor se encarga del espaciado */
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        flex-direction: row; /* Asegura la alineación horizontal del icono y el texto */
        justify-content: flex-start; /* Alinear contenido a la izquierda */
        gap: 0.75rem; /* Espacio entre el icono y el texto */
        transition: background-color 0.2s ease-in-out;
        text-align: left;
    }

    #accessibilityCanvas .btn-accesibilidad:hover {
        background-color: #005293; /* Azul más claro para hover */
    }

    /* Estilo para botones activos */
    #accessibilityCanvas .btn-accesibilidad.activo {
        background-color: #005293;
        box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.2);
    }

    /* Estilo especial para el botón de restablecer */
    #accessibilityCanvas .btn-accesibilidad.btn-reset {
        background-color: #e6f4ff; /* Fondo azul muy claro */
        color: #003D6D; /* Texto azul oscuro */
        border: 1px solid #003D6D;
    }
  `;
  document.head.appendChild(widgetStyles);

  // FUNCIONES GENERALES
  function getZoom() {
    const zoomStr = body.style.zoom || "100%";
    return parseInt(zoomStr) / 100;
  }

  function aplicarZoom(nuevoZoom) {
    const zoom = Math.max(minZoom, Math.min(maxZoom, nuevoZoom));
    body.style.zoom = zoom + "%";
    if (document.body.classList.contains("regla-lectura-activo")) {
      actualizarPosicionRegla();
    }
  }

  function aumentarZoom() {
    aplicarZoom(getZoom() * 100 + step);
  }

  function disminuirZoom() {
    aplicarZoom(getZoom() * 100 - step);
  }

  function actualizarPosicionRegla(e) {
    if (e) {
      mouseObjetivoX = e.clientX;
      mouseObjetivoY = e.clientY;
    }

    if (!animacionRegla) {
      animacionRegla = requestAnimationFrame(moverReglaSuave);
    }
  }

  function moverReglaSuave() {
    const barra = document.getElementById("reglaLectura");
    if (barra && mouseObjetivoX !== null && mouseObjetivoY !== null) {
      const zoom = getZoom();
      const destinoX = (mouseObjetivoX / zoom) - mitadAncho;
      const destinoY = (mouseObjetivoY / zoom) - mitadAlto - 10;

      // InterpolaciÃ³n: acercamos el valor actual al destino
      const velocidad = 0.4; // Puedes ajustar este valor (0.1 = muy lento, 0.5 = rÃ¡pido)
      reglaX += (destinoX - reglaX) * velocidad;
      reglaY += (destinoY - reglaY) * velocidad;

      barra.style.left = `${reglaX}px`;
      barra.style.top = `${reglaY}px`;

      animacionRegla = requestAnimationFrame(moverReglaSuave);
    } else {
      animacionRegla = null;
    }
  }

  function cambiarModoVisual(btn) {
    indiceModo = (indiceModo + 1) % modosVisuales.length;
    const nuevoModo = modosVisuales[indiceModo];

    // Remover todos los modos de contraste
    document.body.classList.remove('modo-lectura', 'alto-contraste');
    
    // Agregar el nuevo modo solo si no es vacÃ­o
    if (nuevoModo) {
      document.body.classList.add(nuevoModo);
    }
    document.getElementById('modo-actual').textContent = nombresModos[nuevoModo];

    document.querySelectorAll('.btn-modo').forEach(b => b.classList.remove('activo'));
    // Solo agregar clase activo si hay un modo aplicado (no en posiciÃ³n 0)
    if (nuevoModo && btn) {
      btn.classList.add('activo');
    }

    // Anunciar el estado solo si el lector estÃ¡ activo
    if (lectorActivo) {
      let mensaje;
      if (nuevoModo === 'modo-lectura') {
        mensaje = 'Modo lectura activado';
      } else if (nuevoModo === 'alto-contraste') {
        mensaje = 'Alto contraste activado';
      } else {
        mensaje = 'Contraste restablecido';
      }
      activarLectorPantalla(mensaje);
    }
  }

  function toggleEspaciadoTexto(button) {
    document.body.classList.toggle('espaciadoTexto');
    if (button) {
      const isActive = document.body.classList.contains('espaciadoTexto');
      button.classList.toggle('activo', isActive);
      // Anunciar el estado solo si el lector estÃ¡ activo
      if (lectorActivo) {
        activarLectorPantalla('Espaciado de texto ' + (isActive ? 'activado' : 'desactivado'));
      }
    }
  }

  function irA(label) {
    const el = document.querySelector(label);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function toggleMarcarEnlaces(button) {
    document.body.classList.toggle('marcar-enlaces');
    if (button) {
      const isActive = document.body.classList.contains('marcar-enlaces');
      button.classList.toggle('activo', isActive);
      // Anunciar el estado solo si el lector estÃ¡ activo
      if (lectorActivo) {
        activarLectorPantalla('Marcar enlaces ' + (isActive ? 'activado' : 'desactivado'));
      }
    }
  }

  function toggleMarcarTitulos(button) {
    document.body.classList.toggle("marcar-titulos");
    const boton = button || document.querySelector('[onclick*="toggleMarcarTitulos"]');
    if (boton) {
      const isActive = document.body.classList.contains('marcar-titulos');
      boton.classList.toggle('activo', isActive);
      // Anunciar el estado solo si el lector estÃ¡ activo
      if (lectorActivo) {
        activarLectorPantalla('Marcar tÃ­tulos ' + (isActive ? 'activado' : 'desactivado'));
      }
    }
  }

  function desactivarAccesibilidad() {
    if (lectorActivo) {
      detenerLectorPantalla();
      activarLectorPantalla('Desactivando todas las funcionalidades de accesibilidad');
    }
    lectorActivo = false;
    document.body.classList.remove(
      'modo-lectura', 'alto-contraste', 'zoom-activo', 'regla-lectura-activo', 'marcar-enlaces', 'marcar-titulos', 
      'espaciadoTexto', 'lector-activo'
    );
    document.querySelector('html').style.zoom = '100%';

    const regla = document.getElementById('reglaLectura');
    if (regla) regla.remove();

    overlay.style.display = 'none';
    spotlightActive = false;

    // Remover clase activo de todos los botones
    document.querySelectorAll('.btn-accesibilidad').forEach(btn => {
      btn.classList.remove('activo');
    });

    const textoModo = document.getElementById('modo-actual');
    if (textoModo) textoModo.textContent = 'Modo Lectura';

    indiceModo = 0;
  }

  function getSpotlightSize() {
    if (window.innerWidth >= 375 && window.innerWidth < 768) return 100;
    if (window.innerWidth >= 768 && window.innerWidth < 1024) return 150;
    return 200;
  }

  function updateMask() {
    const SPOTLIGHT_SIZE = getSpotlightSize();
    const HALF_SPOTLIGHT = SPOTLIGHT_SIZE / 2;
    const zoom = getZoom();
    const yZoom = y / zoom;

    overlay.style.maskImage = `linear-gradient(to bottom, 
      #000 0%, 
      #000 ${yZoom - HALF_SPOTLIGHT}px,
      transparent ${yZoom - HALF_SPOTLIGHT}px,
      transparent ${yZoom + HALF_SPOTLIGHT}px,
      #000 ${yZoom + HALF_SPOTLIGHT}px,
      #000 100%)`;
    overlay.style.webkitMaskImage = overlay.style.maskImage;
  }

  function toggleSpotlight(button) {
    spotlightActive = !spotlightActive;
    overlay.style.display = spotlightActive ? 'block' : 'none';
    if (spotlightActive) updateMask();
    if (button) button.classList.toggle('activo', spotlightActive);

    // Anunciar el estado solo si el lector estÃ¡ activo
    if (lectorActivo) {
      activarLectorPantalla('Enfoque de lectura ' + (spotlightActive ? 'activado' : 'desactivado'));
    }
  }

  function toggleModoLectorPantalla(btn) {
    lectorActivo = !lectorActivo;
    if (btn) btn.classList.toggle('activo', lectorActivo);
    document.body.classList.toggle('lector-activo', lectorActivo);

    activarLectorPantalla('Lector de pantalla ' + (lectorActivo ? 'activado' : 'desactivado'));
  }

  function toggleReglaLectura(button) {
    const existente = document.getElementById("reglaLectura");

    if (existente) {
      existente.remove();
      document.body.classList.remove("regla-lectura-activo");
      if (button) button.classList.remove("activo");
      document.removeEventListener('mousemove', actualizarPosicionRegla);
    } else {
      const div = document.createElement("div");
      div.id = "reglaLectura";
      div.className = "regla-lectura";
      document.body.appendChild(div);
      document.body.classList.add("regla-lectura-activo");
      if (button) button.classList.add("activo");

      // Muy importante: aseguramos que la barra estÃ© centrada en el mouse
      document.addEventListener('mousemove', actualizarPosicionRegla);
    }
    
    // Anunciar el estado solo si el lector estÃ¡ activo
    if (lectorActivo) {
      const isActive = document.body.classList.contains('regla-lectura-activo');
      activarLectorPantalla('GuÃ­a de lectura ' + (isActive ? 'activada' : 'desactivada'));
    }
  }

  // Cambiar presentaciÃ³n visual (3 estados: por defecto, 80ch, 50ch)
  function cambiarPresentacionVisual(button) {
    indicePresentacion = (indicePresentacion + 1) % estadosPresentacion.length;
    const nuevoEstado = estadosPresentacion[indicePresentacion];
    const contenedores = document.querySelectorAll('.post-content');
    contenedores.forEach(contenedor => {
      if (nuevoEstado) {
        contenedor.setAttribute('data-ancho-presentacion', nuevoEstado);
      } else {
        contenedor.removeAttribute('data-ancho-presentacion');
      }
      console.log('Contenedor:', contenedor, 'Nuevo estado:', nuevoEstado);
    });

    // Actualizar botÃ³n activo y texto
    document.querySelectorAll('.btn-presentacion').forEach(b => {
      b.classList.remove('activo');
      // Cambiar el texto del span dentro del botÃ³n
      const span = b.querySelector('span');
      if (span) {
        span.textContent = nombresPresentacion[nuevoEstado];
      }
    });
    if (nuevoEstado && button) {
      button.classList.add('activo');
    }

    // Anunciar el estado solo si el lector está activo
    if (lectorActivo) {
      activarLectorPantalla(nombresPresentacion[nuevoEstado]);
    }
  }

  // INICIALIZACIÓN
    document.addEventListener('mousemove', (e) => {
      if (!spotlightActive) return;
      y = e.clientY;
      updateMask();
    });

    function iniciarLectorPantalla() {
    const texto = document.body.innerText; // Lee todo el texto visible
    activarLectorPantalla(texto);
  }
  
  function activarLectorPantalla(texto) {
    detenerLectorPantalla(); // Detiene si ya está leyendo
    if ('speechSynthesis' in window && texto) {
      const mensaje = new SpeechSynthesisUtterance();
      mensaje.text = texto;
      mensaje.lang = 'es-ES';
      mensaje.rate = 1;
      mensaje.pitch = 1;
      mensaje.volume = 1;

      mensaje.onerror = e => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.error("Error en lector de pantalla:", e);
        }
      };

      window.speechSynthesis.speak(mensaje);
    }
  }
  
  function detenerLectorPantalla() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function toggleLectorPantalla() {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        detenerLectorPantalla();
      } else {
        iniciarLectorPantalla();
      }
    }
  }

  // --- CREACIÓN DEL WIDGET Y EVENTOS ---
  // Como loader.js ya espera a que el DOM esté listo, podemos ejecutar esto directamente.
  const wrapper = document.createElement('div');
  wrapper.id = 'accesibilidad-widget';
  wrapper.innerHTML = `
    <div class="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="accessibilityCanvas" aria-labelledby="accessibilityCanvasLabel">
      <div class="offcanvas-header">
        <h3 class="offcanvas-title" id="accessibilityCanvasLabel">Opciones de Accesibilidad</h3>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
      </div>
      <div class="offcanvas-body">
        <div class="alert alert-primary mt-2" role="alert">
          Usa <strong>Ctrl +</strong> para acercar, <strong>Ctrl -</strong> para alejar, <strong>Ctrl 0</strong> para restablecer.
        </div>
        <div class="btn-group mb-3 botones-toggle" role="group">
          <button class="btn-accesibilidad btn-modo" onclick="cambiarModoVisual(this)"><i class="bi bi-circle-half"></i><span id="modo-actual">Modo Lectura</span></button>
          <button class="btn-accesibilidad" onclick="toggleEspaciadoTexto(this)"><i class="bi bi-type"></i><span>Espaciado Texto</span></button>
          <button class="btn-accesibilidad" onclick="toggleMarcarEnlaces(this)"><i class="bi bi-type-underline"></i><span>Marcar Enlaces</span></button>
          <button class="btn-accesibilidad" onclick="toggleMarcarTitulos(this)"><i class="bi bi-type-bold"></i><span>Marcar Títulos</span></button>
          <button class="btn-accesibilidad btn-no-responsive" onclick="toggleReglaLectura(this)"><i class="bi bi-hr"></i><span>Guía de lectura</span></button>
          <button class="btn-accesibilidad btn-no-responsive" onclick="toggleSpotlight(this)"><i class="bi bi-lightbulb"></i><span>Enfoque de Lectura</span></button>
          <button class="btn-accesibilidad btn-no-responsive" onclick="toggleModoLectorPantalla(this)"><i class="bi bi-soundwave"></i><span>Lector de Pantalla</span></button>
          <button class="btn-accesibilidad btn-reset" onclick="desactivarAccesibilidad()"><i class="bi bi-x-circle"></i><span>Restablecer</span></button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const offcanvasElement = document.getElementById('accessibilityCanvas');
  // Asegurarse de que la librería de Bootstrap esté cargada
  if (typeof bootstrap !== 'undefined') {
    bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
  }

  // Listener global para lectura de elementos al hacer clic si el modo lector está activo
  document.addEventListener('click', function(e) {
    if (!lectorActivo) return;
    
    // Ignorar clics dentro del propio widget de accesibilidad
    if (e.target.closest('#accessibilityCanvas')) return;

    const elemento = e.target;
    let textoALeer = elemento.getAttribute('aria-label') || (elemento.tagName === 'IMG' ? elemento.alt : elemento.innerText);

    if (textoALeer && textoALeer.trim()) {
        activarLectorPantalla(textoALeer.trim());
    }
  });

  // --- EXPORTAR FUNCIONES A WINDOW ---
  // Esto es necesario para que los atributos `onclick` en el HTML del widget funcionen.
  window.irA = irA;
  window.cambiarModoVisual = cambiarModoVisual;
  window.toggleEspaciadoTexto = toggleEspaciadoTexto;
  window.toggleMarcarEnlaces = toggleMarcarEnlaces;
  window.toggleMarcarTitulos = toggleMarcarTitulos;
  window.toggleReglaLectura = toggleReglaLectura;
  window.toggleSpotlight = toggleSpotlight;
  window.toggleModoLectorPantalla = toggleModoLectorPantalla;
  window.desactivarAccesibilidad = desactivarAccesibilidad;
  window.actualizarPosicionRegla = actualizarPosicionRegla;
  window.iniciarLectorPantalla = iniciarLectorPantalla;
  window.toggleLectorPantalla = toggleLectorPantalla;
  window.cambiarPresentacionVisual = cambiarPresentacionVisual;

    document.addEventListener('focusin', function(e) {
      if (!lectorActivo) return;
      const elemento = e.target;
  
      // Ignorar el foco dentro del widget de accesibilidad
      if (elemento.closest('#accessibilityCanvas')) return;
  
      const textoALeer = elemento.getAttribute('aria-label') || (elemento.tagName === 'IMG' ? elemento.alt : elemento.innerText);
      
      if (textoALeer && textoALeer.trim()) {
        activarLectorPantalla(textoALeer.trim());
      }
    });
  
  })();
