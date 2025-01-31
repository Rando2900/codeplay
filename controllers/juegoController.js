const Juego = require('../models/Juego');

exports.createJuego = async (req, res) => {
    try {
        const { title, html, css, js } = req.body;
        const nuevoJuego = new Juego({ title, html, css, js });
        await nuevoJuego.save();
        res.status(201).json({ message: 'Juego guardado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el juego' });
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

