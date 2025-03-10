const mongoose = require('mongoose');
const Juego = require('../models/Juego');

exports.createJuego = async (req, res) => {
    try {
        console.log("📌 Datos crudos recibidos en el backend:", req.body); // <-- Verificar qué llega exactamente

        const { nombre, descripcion, html, css, javascript, usuario } = req.body;

        if (!usuario) {
            console.error("❌ ERROR: Usuario no recibido en el backend.");
            return res.status(400).json({ error: 'Usuario no autenticado' });
        }

        const usuarioId = new mongoose.Types.ObjectId(usuario);

        const nuevoJuego = new Juego({ nombre, descripcion, html, css, javascript, usuario: usuarioId });

        await nuevoJuego.save();
        console.log("✅ Juego guardado correctamente:", nuevoJuego);
        res.status(201).json({ message: 'Juego guardado correctamente', juego: nuevoJuego });
    } catch (error) {
        console.error("❌ Error al guardar el juego en MongoDB:", error);
        res.status(500).json({ error: 'Error al guardar el juego', detalle: error.message });
    }
};


exports.getJuegos = async (req, res) => {
    try {
        const juegos = await Juego.find();
        res.json(juegos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los juegos' });
    }
};

