async function buscarProyecto() {
    const query = document.getElementById('seeker').value;
    
    if (query.length < 2) {
        document.getElementById('results').innerHTML = "";
        return;
    }

    const response = await fetch(`/api/proyectos/buscar?query=${query}`);
    const proyectos = await response.json();

    let html = "";
    if (proyectos.length === 0) {
        html = "<p>No projects found</p>";
    } else {
        proyectos.forEach(proyecto => {
            html += `
                <div class="project">
                    <h3>${proyecto.nombre}</h3>
                    <p>Created by: ${proyecto.creador}</p>
                    <a href="/proyecto/${proyecto._id}">See Project</a>
                </div>
            `;
        });
    }
    
    document.getElementById('resultados').innerHTML = html;
}
