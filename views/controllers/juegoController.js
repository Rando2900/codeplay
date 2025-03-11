const mongoose = require('mongoose');
const Juego = require('../models/Juego');

exports.createJuego = async (req, res) => {
    try {
        console.log("📌Raw data received in the backend:", req.body); // <-- Verificar qué llega exactamente

        const { nombre, descripcion, html, css, javascript, usuario } = req.body;

        if (!usuario) {
            console.error("❌ ERROR: User not received in the backend.");
            return res.status(400).json({ error: 'User not authenticated' });
        }

        const usuarioId = new mongoose.Types.ObjectId(usuario);

        const nuevoJuego = new Juego({ nombre, descripcion, html, css, javascript, usuario: usuarioId });

        await nuevoJuego.save();
        console.log("✅ Successfully saved game:", nuevoJuego);
        res.status(201).json({ message: 'Successfully saved game', juego: nuevoJuego });
    } catch (error) {
        console.error("❌ Error saving game:", error);
        res.status(500).json({ error: 'Error saving game', detalle: error.message });
    }
};


exports.getJuegos = async (req, res) => {
    try {
        const juegos = await Juego.find();
        res.json(juegos);
    } catch (error) {
        res.status(500).json({ error: 'Error getting games' });
    }
};

