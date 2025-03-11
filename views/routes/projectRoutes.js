const express = require('express');
const { createProject, getProjects, getProjectById, getUserProjects, getProjectsByQuery, updateProject, deleteProject } = require('../controllers/projectController');
const { getUsersByQuery } = require('../controllers/userControllers');
const router = express.Router();
const Project = require('../models/Project');
const mongoose = require('mongoose');;



// Ruta de búsqueda por query
router.get('/proyectos', getProjectsByQuery);

router.get('/usuarios', getUsersByQuery);


// Ruta para crear un proyecto
router.post('/', createProject);

// Ruta para obtener todos los proyectos (permite filtrar por usuario si se pasa userId en la consulta)
router.get('/', getProjects);

// Ruta para obtener un proyecto por ID
router.get('/:id', getProjectById);

// ✅ Ruta corregida para obtener los proyectos de un usuario específico
router.get('/user/:id', getUserProjects);

router.get('/proyectos', getProjectsByQuery);

router.get('/projects/search', getProjectsByQuery);


router.get("/search", getProjectsByQuery);

// Ruta para actualizar un proyecto
router.put('/:id', updateProject);

// Ruta para eliminar un proyecto
router.delete('/:id', deleteProject);




router.get('/', async (req, res) => {
    try {
        const { userId } = req.query; // 📌 Obtener el ID del usuario desde la URL

        let query = {};
        if (userId) {
            query.userId = new mongoose.Types.ObjectId(userId); // 📌 Convertimos userId en ObjectId
        }

        const projects = await Project.find(query);
        res.json(projects);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ error: 'Error al obtener proyectos' });
    }
});



//Ruta para los megustas
router.post('/:id/like', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Debes estar autenticado para dar like.' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        const userIndex = project.likedBy.indexOf(userId);

        if (userIndex === -1) {
            project.likes += 1;
            project.likedBy.push(userId);
        } else {
            project.likes -= 1;
            project.likedBy.splice(userIndex, 1);
        }

        await project.save();
        res.json({ message: 'Like actualizado', likes: project.likes, liked: userIndex === -1 });
    } catch (error) {
        console.error('Error al dar/quitar like:', error);
        res.status(500).json({ error: 'Error al actualizar like' });
    }
});

router.post('/:id/fork', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Debes estar autenticado para forkar un proyecto.' });
        }

        const originalProject = await Project.findById(req.params.id);
        if (!originalProject) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        // Crear una copia del proyecto con el nuevo propietario
        const forkedProject = new Project({
            title: originalProject.title + ' (Fork)',
            html: originalProject.html,
            css: originalProject.css,
            js: originalProject.js,
            userId: userId, // Asignar el nuevo usuario
        });

        await forkedProject.save();

        res.json({ message: 'Proyecto forkeado con éxito', project: forkedProject });
    } catch (error) {
        console.error('Error al hacer fork del proyecto:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});



module.exports = router;
