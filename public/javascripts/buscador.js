async function buscarProyecto() {
    const query = document.getElementById('buscador').value;
    
    if (query.length < 2) {
        document.getElementById('resultados').innerHTML = "";
        return;
    }

    const response = await fetch(`/api/proyectos/buscar?query=${query}`);
    const proyectos = await response.json();

    let html = "";
    if (proyectos.length === 0) {
        html = "<p>No se encontraron proyectos</p>";
    } else {
        proyectos.forEach(proyecto => {
            html += `
                <div class="proyecto">
                    <h3>${proyecto.nombre}</h3>
                    <p>Creado por: ${proyecto.creador}</p>
                    <a href="/proyecto/${proyecto._id}">Ver Proyecto</a>
                </div>
            `;
        });
    }
    
    document.getElementById('resultados').innerHTML = html;
}
