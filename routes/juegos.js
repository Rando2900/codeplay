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
    console.log("📌 Datos crudos recibidos en el backend:", req.body); // <-- Verifica qué llega exactamente

    const { nombre, descripcion, html, css, javascript, usuario } = req.body;

    if (!usuario) {
      console.error("❌ ERROR: Usuario no recibido en el backend.");
      return res.status(400).json({ error: 'Usuario no autenticado' });
    }

    // 🔥 Convertimos usuario a ObjectId para que coincida con el esquema
    const usuarioId = new mongoose.Types.ObjectId(usuario);

    const nuevoJuego = new Juego({ nombre, descripcion, html, css, javascript, usuario: usuarioId });

    await nuevoJuego.save();
    console.log("✅ Juego guardado correctamente:", nuevoJuego);
    res.status(201).json({ message: 'Juego guardado correctamente', juego: nuevoJuego });
  } catch (error) {
    console.error("❌ Error al guardar el juego en MongoDB:", error);
    res.status(500).json({ error: 'Error al guardar el juego', detalle: error.message });
  }
});

// Obtener juegos creados por un usuario específico
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const juegos = await Juego.find({ usuario: userId });
    res.json(juegos);
  } catch (error) {
    console.error('Error al obtener juegos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener juegos' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de juego inválido' });
    }

    // 🔥 Convertimos el ID a ObjectId antes de buscar en la base de datos
    const objectId = new mongoose.Types.ObjectId(id);

    const juego = await Juego.findByIdAndDelete(objectId);

    if (!juego) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    res.json({ message: 'Juego eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el juego:', error);
    res.status(500).json({ error: 'Error al eliminar el juego' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, html, css, javascript } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de juego inválido' });
  }

  try {
      const updatedJuego = await Juego.findByIdAndUpdate(
          id,
          { nombre, descripcion, html, css, javascript },
          { new: true }
      );

      if (!updatedJuego) {
          return res.status(404).json({ error: 'Juego no encontrado' });
      }

      res.json({ message: 'Juego actualizado correctamente', juego: updatedJuego });
  } catch (error) {
      console.error('❌ Error al actualizar el juego:', error);
      res.status(500).json({ error: 'Error al actualizar el juego' });
  }
});


module.exports = router;
