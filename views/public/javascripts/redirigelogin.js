document.addEventListener('DOMContentLoaded', () => {
      // Verificar si la cookie de sesión existe
      fetch('/users/session', { method: 'GET', credentials: 'same-origin' })
          .then(response => response.json())
          .then(data => {
              if (!data.loggedIn) {
                  // Redirige al login si no está logueado
                  window.location.href = 'login';
              }
          })
          .catch(error => console.error('Error al verificar la sesión:', error));
  });

