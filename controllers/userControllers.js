const userServices = require('../services/userService');
const User = require('../models/User'); // Importar el modelo User
const getUsers = async (req, res) => {
  const users = await userServices.getUsers();
  console.log(users);
  res.status(200).send(users);
};

const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(req.body);
        console.log(req.body.password);
        console.log(username, password);

        // Intenta registrar el usuario llamando a los servicios
        const user = await userServices.registerUser(username, password);

        if (user) {
            // Guardar el nuevo usuario en la base de datos
            await user.save();
            console.log('Usuario registrado con éxito:', username);

            // Respuesta con redirección a login.html
            res.status(200).json({ redirect: 'login.html' });
        } else {
            console.error('Error al registrar el usuario.');
            res.status(500).send('Error registering new user, please try again.');
        }
    } catch (err) {
        console.error('Error interno al registrar el usuario:', err);
        res.status(500).send('Error interno al registrar el usuario.');
    }
};


const loginUser = async (req, res) => {
    const { usuario, contraseña } = req.body;

    console.log('Datos recibidos del cliente:', { usuario, contraseña });

    if (!usuario || !contraseña) {
        console.log('Faltan datos en la solicitud');
        return res.status(400).send('El nombre de usuario y la contraseña son obligatorios.');
    }

    try {
        const user = await User.findOne({ usuario }); // Busca en la base de datos
        console.log('Usuario encontrado en la base de datos:', user);

        if (!user) {
            console.log('Usuario no encontrado.');
            return res.status(401).send('Usuario no encontrado.');
        }

        if (user.contraseña !== contraseña) {
            console.log('Contraseña incorrecta.');
            return res.status(401).send('Contraseña incorrecta.');
        }

        console.log('Inicio de sesión exitoso para el usuario:', usuario);

        // Guardar el ID del usuario en la sesión
        req.session.userId = user._id;

        // Opcional: Si decides mantener la cookie, actualiza su valor si es necesario
        res.cookie('loggedInUser', usuario, { httpOnly: true });

        res.status(200).json({ message: 'Login exitoso', redirect: 'index.html', userId: user._id });
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).send('Error interno del servidor.');
    }
};


const checkSession = (req, res) => {
    const loggedInUser = req.cookies.loggedInUser;
    const userId = req.session.userId; // ID del usuario en la sesión
    if (userId) {
        res.status(200).json({ loggedIn: true, username: loggedInUser, userId });
    } else {
        res.status(200).json({ loggedIn: false });
    }
};

const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
            return res.status(500).send('Error al cerrar sesión.');
        }
        res.clearCookie('loggedInUser'); // Limpia la cookie
        res.status(200).send('Sesión cerrada con éxito.');
    });
};


// Envio proyecto

const Proyecto = require('../models/Project');

const publicarProyecto = async (req, res) => {
    const { usuario, html, css, js } = req.body;

    try {
        const nuevoProyecto = new Proyecto({ usuario, html, css, js });
        await nuevoProyecto.save();
        res.status(200).json({ mensaje: 'Proyecto publicado con éxito' });
    } catch (error) {
        console.error('Error al publicar el proyecto:', error);
        res.status(500).json({ error: 'Error interno al guardar el proyecto' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.session.userId; // Asegúrate de tener la sesión configurada correctamente
        const { username, password } = req.body;

        if (!userId) {
            return res.status(401).send('No autorizado');
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }

        user.username = username || user.username;
        user.password = password || user.password; // Asegúrate de manejar el cifrado de contraseñas aquí

        await user.save();
        res.status(200).send('Perfil actualizado exitosamente');
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).send('Error interno del servidor');
    }
};

module.exports = {
    getUsers,
    registerUser,
    loginUser,
    checkSession,
    publicarProyecto,
    updateProfile,
    logoutUser
};
