const mongoose = require('mongoose');

const anotacionSchema = new mongoose.Schema({
    language: { type: String, required: true },
    code: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Guarda la referencia del usuario
});

module.exports = mongoose.model('Anotacion', anotacionSchema);
