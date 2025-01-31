const express = require('express');
const { createProject, getProjects, getProjectById, getUserProjects } = require('../controllers/projectController');
const router = express.Router();
const Project = require('../models/Project');

// Ruta para crear un proyecto
router.post('/', createProject);

// Ruta para obtener todos los proyectos
router.get('/', getProjects);

// Ruta para obtener un proyecto por ID
router.get('/:id', getProjectById);

// Ruta para obtener los proyectos de un usuario específico
router.get('/user/:id/projects', getUserProjects);

//Ruta para los megustas
router.post('/:id/like', async (req, res) => {
    try {
        const userId = req.session.userId; // ID del usuario autenticado
        if (!userId) {
            return res.status(401).json({ error: 'Debes estar autenticado para dar like.' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        const userIndex = project.likedBy.indexOf(userId);

        if (userIndex === -1) {
            // Si el usuario NO ha dado like, se añade
            project.likes += 1;
            project.likedBy.push(userId);
        } else {
            // Si el usuario ya dio like, se quita
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


module.exports = router;
