const mongoose = require('mongoose');

const juegoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  html: { type: String, required: true },
  css: { type: String, required: true },
  javascript: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Nuevo campo
});

module.exports = mongoose.model('Juego', juegoSchema);
