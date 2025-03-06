const mongoose = require('mongoose');
const Project = require('../models/Project');

// Obtener todos los proyectos (opcionalmente filtrando por userId)
const getProjects = async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.userId = new mongoose.Types.ObjectId(userId);
        }

        // ✅ Agregamos `.populate('userId', 'usuario')` para obtener el nombre del usuario
        const projects = await Project.find(query).populate('userId', 'usuario');

        res.json(projects);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ error: 'Error al obtener proyectos' });
    }
};


// Obtener los proyectos de un usuario específico
const getUserProjects = async (req, res) => {  
    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        const projects = await Project.find({ userId: new mongoose.Types.ObjectId(userId) }).populate('userId', 'username');

        if (projects.length === 0) {
            return res.status(404).json({ message: 'No hay proyectos para este usuario.' });
        }

        res.status(200).json(projects);
    } catch (err) {
        console.error('Error al obtener proyectos del usuario:', err);
        res.status(500).json({ error: 'Error al obtener proyectos del usuario' });
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

// Crear un proyecto
const createProject = async (req, res) => {
    try {
        const { nombre, descripcion, html, css, javascript } = req.body;

        // Verificar si el usuario está autenticado
        const userId = req.session.userId;
        if (!userId) {
            return res.status(403).send('No estás autorizado para realizar esta acción.');
        }

        // Crear un nuevo proyecto asociado al usuario
        const project = new Project({
            title,
            html,
            css,
            js,
            userId,
        });

        await project.save();

        console.log('Proyecto guardado con éxito:', project._id);
        res.status(200).send('Proyecto guardado con éxito.');
    } catch (err) {
        console.error('Error al guardar el proyecto:', err);
        res.status(500).send('Error interno al guardar el proyecto.');
    }
};


// Obtener proyectos filtrados por nombre
const getProjectsByQuery = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ error: "No se proporcionó un término de búsqueda." });
        }

        // Buscar proyectos que coincidan con el término de búsqueda
        const proyectos = await Project.find({ title: { $regex: query, $options: "i" } });

        res.json(proyectos);
    } catch (error) {
        console.error("Error al obtener proyectos:", error);
        res.status(500).json({ error: "Error al obtener proyectos." });
    }
};

const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        const updatedProject = await Project.findByIdAndUpdate(id, { title }, { new: true });

        if (!updatedProject) {
            return res.status(404).json({ error: "Proyecto no encontrado." });
        }

        res.json({ message: "Proyecto actualizado con éxito.", project: updatedProject });
    } catch (error) {
        console.error("Error al actualizar el proyecto:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// Eliminar un proyecto
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).json({ error: "Proyecto no encontrado." });
        }

        res.json({ message: "Proyecto eliminado con éxito." });
    } catch (error) {
        console.error("Error al eliminar el proyecto:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};


module.exports = {
    createProject,
    getProjects,
    getProjectById,
    getUserProjects,
    getProjectsByQuery,
    updateProject,
    deleteProject
};






