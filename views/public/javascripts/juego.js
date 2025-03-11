async function cargarJuego() {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get('id');

  if (!gameId) {
    document.body.innerHTML = '<p>Error: No se proporcionó un ID de juego.</p>';
    console.error('No se proporcionó un ID de juego.');
    return;
  }

  try {
    const response = await fetch(`/api/juegos/${gameId}`);
    if (!response.ok) {
      throw new Error('Error al obtener el juego desde la API');
    }
    const juego = await response.json();

    // Carga el juego en el iframe
    const iframe = document.getElementById('gameFrame');
    if (!iframe) {
      console.error('El iframe con ID "gameFrame" no se encontró en el documento.');
      return;
    }

    iframe.srcdoc = `
      <html>
      <head>
        <style>${juego.css}</style>
      </head>
      <body>
        ${juego.html}
        <script>${juego.javascript}<\/script>
      </body>
      </html>`;
  } catch (error) {
    document.body.innerHTML = `<p>Error al cargar el juego. Verifica la consola para más detalles.</p>`;
    console.error('Error al cargar el juego:', error);
  }
}

cargarJuego();
