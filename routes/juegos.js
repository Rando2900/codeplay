const express = require('express');
const router = express.Router();
const Juego = require('../models/Juego');
const mongoose = require('mongoose');

// Ruta para obtener todos los juegos
router.get('/', async (req, res) => {
  try {
    const juegos = await Juego.find();
    res.json(juegos);
  } catch (error) {
    console.error('Error al obtener los juegos:', error);
    res.status(500).json({ error: 'Error al obtener los juegos' });
  }
});

// Ruta para obtener un juego por su ID
router.get('/:id', async (req, res) => {
  console.log('ID recibido:', req.params.id);

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const juego = await Juego.findById(req.params.id);
    if (!juego) {
      console.log('Juego no encontrado con el ID:', req.params.id);
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    res.json(juego);
  } catch (error) {
    console.error('Error al obtener el juego:', error);
    res.status(500).json({ error: 'Error al obtener el juego' });
  }
});

// 🔹 Nueva Ruta para crear un juego (POST)
router.post('/', async (req, res) => {
  try {
    const { title, html, css, js } = req.body;

    // Validación de datos
    if (!title || !html || !css || !js) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const nuevoJuego = new Juego({ title, html, css, js });
    await nuevoJuego.save();
    res.status(201).json({ message: 'Juego guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar el juego:', error);
    res.status(500).json({ error: 'Error al guardar el juego' });
  }
});

module.exports = router;
