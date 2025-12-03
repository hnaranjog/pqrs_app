document.addEventListener('DOMContentLoaded', () => {
    const loadComponent = async (selector, url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            const placeholder = document.querySelector(selector);
            if (placeholder) {
                // Replace the placeholder with the component's content
                placeholder.outerHTML = data;
            } else {
                // This is not an error, as some pages might not need all components
                // console.warn(`Placeholder element '${selector}' not found on this page.`);
            }
        } catch (error) {
            console.error(`Could not load component from ${url}:`, error);
        }
    };

    const loadAllComponents = async () => {
        // Add favicon to all pages
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.type = 'image/svg+xml';
        faviconLink.href = '/assets/img/favicon.svg';
        document.head.appendChild(faviconLink);

        // Load Bootstrap CSS & Icons for the accessibility widget and other components
        const bootstrapCSS = document.createElement('link');
        bootstrapCSS.rel = 'stylesheet';
        bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
        document.head.appendChild(bootstrapCSS);

        const bootstrapIconsCSS = document.createElement('link');
        bootstrapIconsCSS.rel = 'stylesheet';
        bootstrapIconsCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
        document.head.appendChild(bootstrapIconsCSS);

        // Load Quill Rich Text Editor CSS
        const quillCSS = document.createElement('link');
        quillCSS.rel = 'stylesheet';
        quillCSS.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css';
        document.head.appendChild(quillCSS);

        // Load Navbar CSS first to avoid Flash of Unstyled Content (FOUC)
        const navbarCSS = document.createElement('link');
        navbarCSS.rel = 'stylesheet';
        navbarCSS.href = '/components/navigation/navbar/navbar.css';
        document.head.appendChild(navbarCSS);

        // Load Sidebar-Left CSS
        const sidebarLeftCSS = document.createElement('link');
        sidebarLeftCSS.rel = 'stylesheet';
        sidebarLeftCSS.href = '/components/sidebar/left/sidebar-left.css';
        document.head.appendChild(sidebarLeftCSS);

        // Load Asesor Widget CSS
        const asesorWidgetCSS = document.createElement('link');
        asesorWidgetCSS.rel = 'stylesheet';
        asesorWidgetCSS.href = '/components/widgets/asesor/asesor.css';
        document.head.appendChild(asesorWidgetCSS);

        // An array of all component loading promises
        const componentPromises = [
            loadComponent('nav-placeholder', '/components/navigation/navbar/navbar.html'),
            loadComponent('sidebar-left-placeholder', '/components/sidebar/left/sidebar-left.html'),
            loadComponent('footer-placeholder', '/components/footer/footer.html'),
            loadComponent('asesor-widget-placeholder', '/components/widgets/asesor/asesor.html'),
        ];

        // Wait for all of them to finish
        await Promise.all(componentPromises);

        // Load Bootstrap JS first, as other scripts (like the accessibility widget) depend on it.
        const bootstrapScript = document.createElement('script');
        bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';

        // After Bootstrap loads, load the other scripts.
        bootstrapScript.onload = () => {
            const accessibilityScript = document.createElement('script');
            accessibilityScript.src = '/assets/js/accessibility.js';
            document.body.appendChild(accessibilityScript);

            // --- NAVBAR LOGIC ---
            // This logic is placed here to ensure it runs after the navbar HTML is loaded.
            // /assets/img/user.jpg
            const testUser = {
                user: "hnaranjo",
                nameUser: "Hector Naranjo",
                email: "h.naranjo@utp.edu.co",
                image: "/assets/img/user.jpg"
            };

            const loggedInUser = localStorage.getItem('user');

            // Select all necessary elements for the profile button
            const profileDropdownToggle = document.querySelector('.profile-option-utp .dropdown-toggle');
            const profileBtnElement = document.querySelector('.profile-btn-utp');
            const profileImageElement = document.getElementById('navbar-profile-img');
            const profileNameElement = document.querySelector(".name-profile-utp");
            const notificationsItem = document.getElementById('navbar-notifications-item');

            const adminBtn = document.getElementById('admin-btn-utp');
            const profileLinkInDropdown = document.getElementById('profile-btn-utp'); // Renamed for clarity
            const sidebarAdminBtn = document.getElementById('sidebar-admin-btn');
            const sidebarInformesBtn = document.getElementById('sidebar-informes-btn');

            // --- NEW DROPDOWN BEHAVIOR ---
            // Show on hover, but only close on click anywhere on the screen.
            const profileDropdownContainer = document.querySelector('.nav-item.dropdown');
            if (profileDropdownContainer) {
                const profileDropdownMenu = profileDropdownContainer.querySelector('.dropdown-menu');

                profileDropdownContainer.addEventListener('mouseenter', () => {
                    if (profileDropdownMenu) {
                        profileDropdownMenu.classList.add('show');
                    }
                });

                document.addEventListener('click', (event) => {
                    // Close the dropdown if the click is outside the dropdown container
                    if (profileDropdownMenu && !profileDropdownContainer.contains(event.target)) {
                        profileDropdownMenu.classList.remove('show');
                    }
                });
            }

            if (loggedInUser && loggedInUser === testUser.user) {
                // --- LOGGED-IN USER (ADMIN) ---
                const userProfile = {
                    name: testUser.nameUser,
                    email: testUser.email,
                    image: testUser.image
                };
                localStorage.setItem('userProfile', JSON.stringify(userProfile));

                // 1. Style the button as a circular icon
                if (profileBtnElement) profileBtnElement.classList.add('logged-in');

                // 2. Display user image or initials
                if (profileImageElement && userProfile.image) {
                    // If there's an image, show it
                    profileImageElement.src = userProfile.image;
                    profileImageElement.style.display = 'block';
                    if (profileNameElement) profileNameElement.style.display = 'none';
                } else if (profileNameElement) {
                    // Otherwise, show initials
                    if (profileImageElement) profileImageElement.style.display = 'none';
                    const initials = testUser.nameUser.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
                    profileNameElement.textContent = initials;
                    profileNameElement.style.display = 'block';
                }

                // 3. Set up dropdown behavior
                if (profileDropdownToggle) {
                    profileDropdownToggle.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = '/app/profile.html';
                    });
                }

                // 4. Enable/Show menu options for Admin
                if (adminBtn) {
                    adminBtn.style.display = 'block';
                }
                if (profileLinkInDropdown) {
                    profileLinkInDropdown.classList.remove('disabled');
                }
                if (sidebarAdminBtn) {
                    sidebarAdminBtn.style.display = 'flex';
                }
                if (sidebarInformesBtn) {
                    sidebarInformesBtn.style.display = 'flex';
                }

            } else {
                // --- LOGGED-OUT USER / SOLICITANTE ---
                if (profileNameElement) profileNameElement.textContent = "Iniciar sesión";

                if (profileDropdownToggle) {
                    profileDropdownToggle.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = '/app/login/index.html';
                    });
                }

                // Disable/Hide menu options for Non-Admin
                if (adminBtn) {
                    adminBtn.style.display = 'none';
                }
                if (profileLinkInDropdown) {
                    profileLinkInDropdown.classList.add('disabled');
                }
                if (sidebarAdminBtn) {
                    sidebarAdminBtn.style.display = 'none';
                }
                if (sidebarInformesBtn) {
                    sidebarInformesBtn.style.display = 'none';
                }
            }

            // Show notifications only if the admin user is logged in
            if (notificationsItem) {
                notificationsItem.style.display = (loggedInUser && loggedInUser === testUser.user) ? 'list-item' : 'none';
            }

            const logoutBtn = document.getElementById('logout-btn-utp');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.clear(); // Limpia toda la información del usuario.
                    window.location.href = '/app/login/index.html'; // Redirige a la página de inicio.
                });
            }

            // Load the dedicated script for guided tours
            const driverLoaderScript = document.createElement('script');
            driverLoaderScript.src = '/assets/js/loadDriver.js';
            document.body.appendChild(driverLoaderScript);

            // Load Quill JS and our component script before forms.js, which will use them.
            const quillScript = document.createElement('script');
            quillScript.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js';
            document.body.appendChild(quillScript);

            const quillComponentScript = document.createElement('script');
            quillComponentScript.src = '/lib/quill-editor/quill-component.js';
            document.body.appendChild(quillComponentScript);

            // Load form-specific logic (e.g., for loading modals dynamically)
            const formsScript = document.createElement('script');
            formsScript.src = '/assets/js/forms.js';
            document.body.appendChild(formsScript);

            if (window.location.pathname.includes('/app/profile.html')) {
                const mainAppScript = document.createElement('script');
                mainAppScript.src = '/assets/js/main.js';
                document.body.appendChild(mainAppScript);
            }

            // --- Lógica para la página de consulta (consultar.html) ---
            if (window.location.pathname.includes('/app/consultar.html')) {
                // ... (código existente)
            }

            // --- Lógica para el panel de expansión en request.html ---
            if (window.location.pathname.includes('/app/request.html')) {
                // ... (código existente)
            }
        };

        document.body.appendChild(bootstrapScript);
    };

    loadAllComponents();
});
