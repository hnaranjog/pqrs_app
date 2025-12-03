// This script is loaded by loader.js on specific pages like profile.html,
// after the main DOM and components are ready.

/**
 * Reads user profile data from localStorage and populates the corresponding
 * elements on the profile page.
 */
const loadProfileData = () => {
    // 1. Obtener los datos del localStorage
    const userProfileString = localStorage.getItem('userProfile');
    const user = localStorage.getItem('user'); // El nombre de usuario se guarda por separado

    if (userProfileString && user) {
        const userProfile = JSON.parse(userProfileString);

        // 2. Seleccionar los elementos del DOM
        const userElement = document.getElementById('user-utp');
        const nameElement = document.getElementById('name-user-utp');
        const emailElement = document.getElementById('email-user-utp');
        const profileImageElement = document.getElementById('profile-image-utp');

        // 3. Poblar los elementos con los datos del perfil
        if (userElement) userElement.textContent = user;
        if (nameElement) nameElement.textContent = userProfile.name || 'No disponible';
        if (emailElement) emailElement.textContent = userProfile.email || 'No disponible';
        if (profileImageElement) {
            // Si userProfile.image es nulo o una cadena vacía, usa la imagen SVG por defecto.
            profileImageElement.src = userProfile.image || '/assets/img/profile.svg';
        }
    } else {
        console.warn('No se encontraron datos de perfil o de usuario en localStorage. El usuario podría no haber iniciado sesión.');
    }
};

// Execute the function to load data into the profile page.
loadProfileData();
