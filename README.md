# Sistema de Gestión de PQRS - UTP

Este repositorio contiene el prototipo de alta fidelidad (Mockup) para el Sistema de Gestión de Peticiones, Quejas, Reclamos y Sugerencias (PQRS) de la Universidad Tecnológica de Pereira.

El objetivo de este desarrollo es validar los flujos de usuario y la interfaz gráfica antes de la migración final a un framework como **Angular**.

## 🚀 Características

-   **Gestión de Solicitudes:**
    -   Registro de Sugerencias, Quejas y Reclamos.
    -   Registro de Derechos de Petición (Interés General, Particular, Información, Consulta).
    -   Registro de Denuncias por Corrupción.
-   **Consulta:** Módulo para que los usuarios consulten el estado de sus solicitudes.
-   **Panel de Administración:** Vista exclusiva para funcionarios (simulada) para gestionar las solicitudes.
-   **Autenticación Simulada:** Manejo de roles (Solicitante vs. Administrador) y persistencia básica de sesión local.
-   **Diseño Responsivo:** Adaptable a dispositivos móviles y de escritorio.

## 🛠️ Tecnologías Utilizadas

-   **HTML5 & CSS3**
-   **JavaScript (Vanilla ES6+)**: Lógica de cliente sin frameworks pesados.
-   **Bootstrap 5**: Framework CSS para el diseño y componentes UI.
-   **Componentes Dinámicos**: Sistema propio de carga de componentes (`loader.js`) para simular una SPA.

## 📦 Estructura del Proyecto

```text
/
├── app/                # Vistas principales de la aplicación
│   ├── admin/          # Vistas del panel de administración
│   ├── forms/          # Fragmentos HTML de los formularios
│   └── ...             # Páginas (home, radicar, consultar, etc.)
├── assets/             # Recursos estáticos (CSS, JS, Imágenes)
│   └── js/
│       ├── loader.js   # Orquestador de carga de componentes
│       └── forms.js    # Lógica de los formularios
├── components/         # Componentes reutilizables (Navbar, Sidebar, Footer)
└── index.html          # Punto de entrada (Redirección)
```

## 🔧 Cómo Ejecutar Localmente

Dado que el proyecto utiliza rutas absolutas y carga dinámica de módulos, es necesario ejecutarlo sobre un servidor web local.

1.  **Requisitos:** Tener instalado [Node.js](https://nodejs.org/).
2.  **Ejecutar:**
    Usa `npx` para lanzar un servidor rápido en la raíz del proyecto:

    ```bash
    npx http-server . -p 8080 -c-1
    ```

3.  **Visualizar:**
    Abre tu navegador en `http://localhost:8080`.

## 👤 Usuarios de Prueba

Para probar los diferentes roles:

-   **Administrador:**
    -   Usuario: `hnaranjo`
    -   (La autenticación es simulada, cualquier contraseña funciona si el usuario coincide).
-   **Solicitante:**
    -   No requiere inicio de sesión para radicar o consultar (público).

## 🔜 Próximos Pasos

-   Validación de UX/UI.
-   Migración de la arquitectura a **Angular**.
-   Integración con servicios Backend reales.
