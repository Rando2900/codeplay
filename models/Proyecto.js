// Recoge los proyectos de la base de datos
const mongoose = require('mongoose');

const proyectoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  html: { type: String, required: true },
  css: { type: String, required: true },
  javascript: { type: String, required: true },
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Para vincularlo con el usuario
});

module.exports = mongoose.model('Proyecto', proyectoSchema);
