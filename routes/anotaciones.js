const express = require('express');
const router = express.Router();
const Anotacion = require('../models/Anotacion');
const User = require('../models/User'); // Importa el modelo de usuario

// ✅ Guardar una nueva anotación con título, lenguaje, código y usuario autenticado
router.post('/', async (req, res) => {
    try {
        console.log('Usuario en sesión:', req.session.userId);

        if (!req.session.userId) {
            return res.status(401).send('No has iniciado sesión');
        }

        const { title, language, code } = req.body;

        if (!title || !language || !code) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }

        const nuevaAnotacion = new Anotacion({
            title,   // ✅ Ahora guarda el título
            language,
            code,
            user: req.session.userId,
            createdAt: new Date()
        });

        await nuevaAnotacion.save();
        res.status(201).json({ message: "Anotación guardada exitosamente." });
    } catch (error) {
        console.error('Error al guardar la anotación:', error.message);
        res.status(500).json({ error: "Error al guardar la anotación." });
    }
});

// ✅ Obtener todas las anotaciones de un usuario autenticado
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const anotaciones = await Anotacion.find({ user: userId }).sort({ createdAt: -1 });

        res.json(anotaciones);
    } catch (error) {
        console.error('Error al obtener las anotaciones:', error);
        res.status(500).json({ error: "Error al obtener anotaciones." });
    }
});

module.exports = router;
