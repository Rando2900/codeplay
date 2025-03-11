const mongoose = require('mongoose'); // ✅ Asegura que mongoose está importado
const userServices = require('../services/userService');
const bcrypt = require('bcryptjs'); // Importar bcrypt
const User = require('../models/User'); // Importar el modelo User
const getUsers = async (req, res) => {
  const users = await userServices.getUsers();
  console.log(users);
  res.status(200).send(users);
};


const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Please complete all fields.' });
        }

        const existingUser = await User.findOne({ usuario: username });
        if (existingUser) {
            return res.status(400).json({ message: 'The username is already in use.' });
        }

        const salt = await bcrypt.genSalt(10);    
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            usuario: username,
            contraseña: hashedPassword
        });

        await newUser.save();

        // ✅ Redirigir al login tras registro exitoso
        res.status(200).json({ message: 'User registered successfully.', redirect: '/login' });

    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'There was an error in registration.' });
    }
};




// 🔹 Inicio de sesión
const loginUser = async (req, res) => {
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
        return res.status(400).send('Username and password are required.');
    }

    try {
        const user = await User.findOne({ usuario });

        if (!user) {
            return res.status(401).send('Incorrect credentials.');
        }

        // Verificar la contraseña cifrada
        const isMatch = await bcrypt.compare(contraseña, user.contraseña);
        if (!isMatch) {
            return res.status(401).send('Incorrect credentials.');
        }

        req.session.userId = user._id; // Guardamos solo el ID del usuario en la sesión
        req.session.username = user.usuario;

        res.status(200).json({ message: 'Successful login', redirect: '/' });

    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Internal Server Error.');
    }
};



// 🔹 Verificar sesión
const checkSession = (req, res) => {
    console.log('🔍 Verificando sesión:', req.session); // Debugging en servidor
    const userId = req.session.userId;
    const username = req.session.username; // Obtener el nombre de usuario

    if (userId) {
        res.status(200).json({ loggedIn: true, userId, username });
    } else {
        res.status(200).json({ loggedIn: false });
    }
};

const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out.');
        }
        res.clearCookie('loggedInUser'); // Limpia la cookie
        res.status(200).send('Session closed successfully.');
    });
};


// Envio proyecto

const Proyecto = require('../models/Project');

const publicarProyecto = async (req, res) => {
    const { usuario, html, css, js } = req.body;

    try {
        const nuevoProyecto = new Proyecto({ usuario, html, css, js });
        await nuevoProyecto.save();
        res.status(200).json({ mensaje: 'Successfully published project' });
    } catch (error) {
        console.error('Error publishing project:', error);
        res.status(500).json({ error: 'Internal error saving project' });
    }
}

const verificarCookie = (req, res) => {
    const miCookie = req.signedCookies.mi_cookie; // Accede a cookies firmadas
    if (!miCookie) {
        return res.status(400).send('Invalid or missing cookie');
    }
    res.status(200).send(`Valid cookie: ${miCookie}`);
};

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        // Verificar si el ID es válido en MongoDB
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getUsersByQuery = async (req, res) => {
    console.log("getUsersByQuery");
    try {
        const query = req.query.query; // Obtener el término de búsqueda
        if (!query || typeof query !== "string") {
            return res.status(400).json({ error: 'Invalid search query' });
        }

        // 📌 Buscar usuarios por su nombre de usuario, asegurando que NO se trate como un ID
        const users = await User.find({ usuario: { $regex: query, $options: 'i' } });

        res.json(users.length ? users : []);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { usuario, contraseña } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // 🔹 Verificar si el nuevo nombre de usuario ya está en uso
        if (usuario && usuario !== user.usuario) {
            const usuarioExistente = await User.findOne({ usuario });
            if (usuarioExistente) {
                return res.status(400).json({ error: 'The username is already in use.' });
            }
            user.usuario = usuario; // ✅ Actualizar el nombre de usuario si no está en uso
        }
        if (contraseña) {
            const salt = await bcrypt.genSalt(10);
            user.contraseña = await bcrypt.hash(contraseña, salt);
        }

        await user.save();

        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Error logging out:', err);
                return res.status(500).json({ error: 'Error logging out.' });
            }

            res.clearCookie('loggedInUser');
            res.status(200).json({ message: 'Profile updated successfully.', redirect: '/' });
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




// 📌 Asegurarse de exportarla correctamente
module.exports = {
    getUsers,
    registerUser,
    loginUser,
    checkSession,
    publicarProyecto,
    updateProfile,
    logoutUser,
    verificarCookie,
    getUserById,
    getUsersByQuery // 🔹 Asegurar que está aquí
};