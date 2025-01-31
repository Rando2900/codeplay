//Este archivo es el de guardar los proyectos en la base de datos
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    html: { type: String },
    css: { type: String },
    js: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 }, // 🔥 Nuevo campo para los likes
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});


const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
