document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que el formulario se envíe de la forma tradicional

    const username = document.getElementById('username').value;
    
    // 1. Al ingresar guardar la variable user, con el nombre de usuario
    localStorage.setItem('user', username);

    // Redirigir a la página de inicio para que el loader valide
    window.location.href = '/app/admin/home-adm.html';
});
