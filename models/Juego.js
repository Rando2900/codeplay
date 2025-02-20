const mongoose = require('mongoose');

const juegoSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Cambiado de "nombre" a "title"
  descripcion: { type: String }, // No requerido, para que no falle si no se envía
  html: { type: String, required: true },
  css: { type: String, required: true },
  js: { type: String, required: true } // Cambiado de "javascript" a "js"
});

module.exports = mongoose.model('Juego', juegoSchema);

