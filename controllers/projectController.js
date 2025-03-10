const mongoose = require('mongoose');
const Project = require('../models/Project');

// Obtener todos los proyectos (opcionalmente filtrando por userId)
const getProjects = async (req, res) => {
    try {
        // Solo traer proyectos públicos
        const projects = await Project.find({ visibility: 'public' }).populate('userId', 'usuario');

        console.log('🟢 Proyectos públicos obtenidos:', projects); // Agregar log para depuración

        res.json(projects);
    } catch (error) {
        console.error('❌ Error al obtener proyectos:', error);
        res.status(500).json({ error: 'Error al obtener proyectos' });
    }
};




// Obtener los proyectos de un usuario específico
const getUserProjects = async (req, res) => {  
    try {
        const userId = req.params.id;
        const requestingUserId = req.session.userId; // Usuario autenticado

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        let query = { userId: new mongoose.Types.ObjectId(userId) };

        // ✅ Si el usuario autenticado NO es el dueño del perfil, solo mostramos proyectos públicos
        if (requestingUserId && String(requestingUserId) !== String(userId)) {
            query.visibility = 'public';
        }

        const projects = await Project.find(query).populate('userId', 'username');
        console.log("✅ Proyectos filtrados:", projects);
        res.status(200).json(projects);
    } catch (err) {
        console.error('❌ Error al obtener proyectos del usuario:', err);
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
        console.log('📌 Recibida solicitud para crear proyecto:', req.body.title); // ✅ Ver si se llama dos veces

        const { title, html, css, js, visibility } = req.body;

        if (!title) {
            return res.status(400).json({ error: "El título es obligatorio" });
        }

        const userId = req.session.userId;
        if (!userId) {
            return res.status(403).json({ error: "No estás autorizado para realizar esta acción." });
        }

        const project = new Project({
            title,
            html,
            css,
            js,
            visibility: visibility || 'public',
            userId,
        });

        await project.save();
        console.log('✅ Proyecto guardado:', project._id);

        res.status(200).json({ message: "Proyecto guardado con éxito.", project });
    } catch (err) {
        console.error('❌ Error al guardar el proyecto:', err);
        res.status(500).json({ error: "Error interno al guardar el proyecto." });
    }
};

// Obtener proyectos filtrados por nombre
const getProjectsByQuery = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ error: "No se proporcionó un término de búsqueda." });
        }

        // 🔒 Buscar solo proyectos públicos que coincidan con el término de búsqueda
        const proyectos = await Project.find({
            title: { $regex: query, $options: "i" },
            visibility: 'public' // 🔒 Excluir proyectos privados
        });

        res.json(proyectos);
    } catch (error) {
        console.error("Error al obtener proyectos:", error);
        res.status(500).json({ error: "Error al obtener proyectos." });
    }
};



const updateProject = async (req, res) => {
    try {
        const { title, html, css, js, visibility } = req.body;
        const projectId = req.params.id;
        const userId = req.session.userId; // Usuario autenticado

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "ID de proyecto inválido" });
        }

        // Verificar si el usuario es el dueño del proyecto
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Proyecto no encontrado" });
        }

        if (String(project.userId) !== String(userId)) {
            return res.status(403).json({ error: "No tienes permisos para editar este proyecto" });
        }

        // Actualizar los datos del proyecto
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { title, html, css, js, visibility },
            { new: true }
        );

        console.log(`✅ Proyecto actualizado: ${updatedProject.title} - Nueva Visibilidad: ${updatedProject.visibility}`);

        res.json({ message: "Proyecto actualizado con éxito", project: updatedProject });
    } catch (err) {
        console.error("❌ Error al actualizar proyecto:", err);
        res.status(500).json({ error: "Error al actualizar el proyecto" });
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

