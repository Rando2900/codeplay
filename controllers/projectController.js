const Project = require('../models/Project');

const createProject = async (req, res) => {
    try {
        const { title, html, css, js } = req.body;

        // Verifica si el usuario está autenticado (suponiendo que tienes el ID del usuario en la sesión)
        const userId = req.session.userId; // Obtén el ID del usuario desde la sesión
        if (!userId) {
            return res.status(403).send('No estás autorizado para realizar esta acción.');
        }

        // Crear un nuevo proyecto con el ID del usuario
        const project = new Project({
            title,
            html,
            css,
            js,
            userId, // Asociar el ID del usuario logueado
        });

        // Guardar el proyecto en la base de datos
        await project.save();

        console.log('Proyecto guardado con éxito:', project._id);
        res.status(200).send('Proyecto guardado con éxito.');
    } catch (err) {
        console.error('Error al guardar el proyecto:', err);
        res.status(500).send('Error interno al guardar el proyecto.');
    }
};

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('userId', 'usuario').sort({ likes: -1 }); // 🔥 Ordenar por likes de mayor a menor

        console.log("Proyectos con usuario ordenados por likes:", projects); // Log para verificar si ahora se muestra bien

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ error: 'Error al obtener proyectos' });
    }
};

// Obtener un proyecto por ID
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('userId', 'username');
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado.' });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error('Error al obtener el proyecto:', error);
        res.status(500).json({ error: 'Error al obtener el proyecto.' });
    }
};

const getUserProjects = async (req, res) => {
    const userId = req.params.id; // Obtén el ID del usuario de los parámetros
    try {
        const projects = await Project.find({ userId }).populate('userId', 'username'); // Busca proyectos por userId e incluye el username
        if (projects.length === 0) {
            return res.status(404).json({ message: 'No projects found for this user.' });
        }
        res.status(200).json(projects); // Devuelve los proyectos encontrados
    } catch (err) {
        console.error('Error retrieving user projects:', err);
        res.status(500).json({ error: 'Error retrieving user projects' });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    getUserProjects
};