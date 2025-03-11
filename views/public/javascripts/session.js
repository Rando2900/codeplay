document.addEventListener('DOMContentLoaded', () => {
    const userMenu = document.getElementById('userMenu'); // Obtén el contenedor de los botones

    fetch('/users/session', { method: 'GET', credentials: 'same-origin' })
        .then(response => response.json())
        .then(data => {
            if (!data.loggedIn) {
                // Si no hay usuario logueado, aseguramos que se muestren los botones de login
                userMenu.innerHTML = `
                    <a href="/login"><button>Login</button></a>
                    <a href="/registro"><button>Register</button></a>
                `;
            } else {
                // Si hay usuario logueado, mostramos el menú de perfil
                userMenu.innerHTML = `
                    <div class="profile-menu">
                        <a href="/perfil" style="text-decoration: none; color: inherit; cursor: pointer;">
                            <span>Hi, ${data.username}</span>
                        </a>
                        <button onclick="logout()">Sign Out</button>
                    </div>
                `;
            }
        })
        .catch(err => console.error('Error verificando la sesión:', err));
});

function logout() {
    fetch('/users/logout', { method: 'POST', credentials: 'same-origin' })
        .then(() => {
            window.location.reload(); // Recargar la página después de cerrar sesión
        })
        .catch(err => console.error('Error cerrando sesión:', err));
}
