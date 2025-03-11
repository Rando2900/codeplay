const mongoose = require('mongoose');
const Project = require('../models/Project');

// Obtener todos los proyectos (opcionalmente filtrando por userId)
const getProjects = async (req, res) => {
    try {
        // Solo traer proyectos públicos
        const projects = await Project.find({ visibility: 'public' }).populate('userId', 'usuario');

        console.log('🟢 Public projects obtained:', projects); // Agregar log para depuración

        res.json(projects);
    } catch (error) {
        console.error('❌ Error getting projects:', error);
        res.status(500).json({ error: 'Error getting projects' });
    }
};




// Obtener los proyectos de un usuario específico
const getUserProjects = async (req, res) => {  
    try {
        const userId = req.params.id;
        const requestingUserId = req.session.userId; // Usuario autenticado

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        let query = { userId: new mongoose.Types.ObjectId(userId) };

        // ✅ Si el usuario autenticado NO es el dueño del perfil, solo mostramos proyectos públicos
        if (requestingUserId && String(requestingUserId) !== String(userId)) {
            query.visibility = 'public';
        }

        const projects = await Project.find(query).populate('userId', 'username');
        console.log("✅ Leaked projects:", projects);
        res.status(200).json(projects);
    } catch (err) {
        console.error('❌ Error getting projects from user:', err);
        res.status(500).json({ error: 'Error getting projects from user' });
    }
};




// Obtener un proyecto por ID
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('userId', 'username');
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error('Error getting project:', error);
        res.status(500).json({ error: 'Error getting project.' });
    }
};

// Crear un proyecto
const createProject = async (req, res) => {
    try {
        console.log('📌 Request received to create project:', req.body.title); // ✅ Ver si se llama dos veces

        const { title, html, css, js, visibility } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        const userId = req.session.userId;
        if (!userId) {
            return res.status(403).json({ error: "You are not authorized to perform this action." });
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
        console.log('✅ Saved project:', project._id);

        res.status(200).json({ message: "Project saved successfully.", project });
    } catch (err) {
        console.error('❌ Error saving project:', err);
        res.status(500).json({ error: "Internal error saving project." });
    }
};

// Obtener proyectos filtrados por nombre
const getProjectsByQuery = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ error: "No search term was provided." });
        }

        // 🔒 Buscar solo proyectos públicos que coincidan con el término de búsqueda
        const proyectos = await Project.find({
            title: { $regex: query, $options: "i" },
            visibility: 'public' // 🔒 Excluir proyectos privados
        });

        res.json(proyectos);
    } catch (error) {
        console.error("Error getting projects:", error);
        res.status(500).json({ error: "Error getting projects." });
    }
};



const updateProject = async (req, res) => {
    try {
        const { title, html, css, js, visibility } = req.body;
        const projectId = req.params.id;
        const userId = req.session.userId; // Usuario autenticado

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "Invalid project ID" });
        }

        // Verificar si el usuario es el dueño del proyecto
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        if (String(project.userId) !== String(userId)) {
            return res.status(403).json({ error: "You do not have permissions to edit this project" });
        }

        // Actualizar los datos del proyecto
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { title, html, css, js, visibility },
            { new: true }
        );

        console.log(`✅ Updated project: ${updatedProject.title} - New Visibility: ${updatedProject.visibility}`);

        res.json({ message: "Project successfully updated", project: updatedProject });
    } catch (err) {
        console.error("❌ Error updating project:", err);
        res.status(500).json({ error: "Error updating project" });
    }
};


// Eliminar un proyecto
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).json({ error: "Project not found." });
        }

        res.json({ message: "Project successfully deleted." });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Error deleting project." });
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

