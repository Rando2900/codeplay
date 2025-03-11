const mongoose = require('mongoose');

const anotacionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Anotacion', anotacionSchema);
