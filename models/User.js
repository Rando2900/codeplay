const mongoose = require('mongoose');
const { Schema } = mongoose;
const userSchema = new Schema({
    usuario: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true }
},
{
    collection: 'usuarios',
}
);
const User = mongoose.model('User', userSchema);

module.exports = User;
