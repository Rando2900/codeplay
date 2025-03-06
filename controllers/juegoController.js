const Juego = require('../models/Juego');

exports.createJuego = async (req, res) => {
    try {
        const { nombre, descripcion, html, css, javascript } = req.body;

        // Crear un nuevo juego con los datos correctamente estructurados
        const nuevoJuego = new Juego({ nombre, descripcion, html, css, javascript });

        await nuevoJuego.save();
        res.status(201).json({ message: 'Juego guardado correctamente', juego: nuevoJuego });
    } catch (error) {
        console.error('Error al guardar el juego:', error);
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

