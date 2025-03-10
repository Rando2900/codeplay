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

router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Verifica que el ID sea válido (formato MongoDB)
        if (!userId || userId.length !== 24) {
            return res.status(400).json({ error: "ID de usuario inválido." });
        }

        const anotaciones = await Anotacion.find({ user: userId }).sort({ createdAt: -1 });

        if (!anotaciones || anotaciones.length === 0) {
            return res.status(404).json({ error: "No se encontraron anotaciones para este usuario." });
        }

        res.json(anotaciones);
    } catch (error) {
        console.error('❌ Error al obtener las anotaciones:', error);
        res.status(500).json({ error: "Error al obtener anotaciones." });
    }
});



// Editar anotación
router.put('/:id', async (req, res) => {
    try {
        const { title, language, code } = req.body;

        if (!title || !language || !code) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }

        const anotacionActualizada = await Anotacion.findByIdAndUpdate(
            req.params.id,
            { title, language, code },
            { new: true }
        );

        if (!anotacionActualizada) {
            return res.status(404).json({ error: "Anotación no encontrada." });
        }

        res.json({ message: "Anotación actualizada con éxito.", anotacion: anotacionActualizada });
    } catch (error) {
        console.error('❌ Error al actualizar la anotación:', error.message);
        res.status(500).json({ error: "Error al actualizar la anotación." });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const anotacionEliminada = await Anotacion.findByIdAndDelete(req.params.id);
        res.json({ message: "Anotación eliminada con éxito." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la anotación." });
    }
});
router.get('/:id', async (req, res) => {
    console.log("🟡 ID recibido en el backend:", req.params.id); // <-- NUEVO LOG

    try {
        const anotacion = await Anotacion.findById(req.params.id);

        if (!anotacion) {
            return res.status(404).json({ error: "Anotación no encontrada." });
        }

        res.json(anotacion);
    } catch (error) {
        console.error('❌ Error al obtener la anotación:', error.message);
        res.status(500).json({ error: "Error al obtener la anotación." });
    }
});




module.exports = router;
