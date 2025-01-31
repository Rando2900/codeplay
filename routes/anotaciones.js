const express = require('express');
const router = express.Router();
const Anotacion = require('../models/Anotacion');
const User = require('../models/User'); // Importa el modelo de usuario

// Guardar una nueva anotación con el usuario autenticado
router.post('/', async (req, res) => {
    console.log (req.session)
    try {
        // ✅ Depuración: Verificar si la sesión tiene un usuario activo
        console.log('Usuario en sesión:', req.session.userId);

        if (!req.session.userId) {
            return res.status(401).send('No has iniciado sesión');
        }

        const { language, code } = req.body;
        if (!language || !code) {
            return res.status(400).send('Faltan datos requeridos');
        }

        const nuevaAnotacion = new Anotacion({
            language,
            code,
            user:req.session.userId
            //user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } 
        });

        await nuevaAnotacion.save();
        res.status(201).send('Anotación guardada con éxito');
    } catch (error) {
        console.error('Error al guardar la anotación:', error.message);
        res.status(500).send('Error al guardar la anotación');
    }
});
module.exports = router;

