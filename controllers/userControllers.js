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



// 🔹 Inicio de sesión
const loginUser = async (req, res) => {
    try {
        console.log('🔍 Datos recibidos:', req.body);

        let { usuario, contraseña } = req.body;

        // Verifica que usuario y contraseña sean strings
        if (typeof usuario !== 'string' || typeof contraseña !== 'string') {
            console.error('❌ Error: usuario o contraseña no son strings.');
            return res.status(400).send('Datos de inicio de sesión inválidos.');
        }

        usuario = usuario.trim();
        contraseña = contraseña.trim();

        if (!usuario || !contraseña) {
            console.error('❌ Error: usuario o contraseña vacíos.');
            return res.status(400).send('El nombre de usuario y la contraseña son obligatorios.');
        }

        const user = await User.findOne({ usuario });

        if (!user) {
            console.error('❌ Usuario no encontrado');
            return res.status(401).send('Credenciales incorrectas.');
        }

        if (user.contraseña !== contraseña) {
            console.error('❌ Contraseña incorrecta');
            return res.status(401).send('Credenciales incorrectas.');
        }

        req.session.userId = user._id;
        req.session.username = user.usuario;

        console.log('✅ Login exitoso:', req.session);

        res.status(200).json({ message: 'Login exitoso', redirect: 'index.html' });
    } catch (err) {
        console.error('❌ Error en loginUser:', err);
        res.status(500).send('Error interno del servidor.');
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
        console.log("🔍 Datos de sesión antes de actualizar:", req.session);
        const userId = req.session.userId;
        const { username, password } = req.body;

        if (!userId) {
            console.error("❌ No hay userId en la sesión");
            return res.status(401).json({ error: 'No autorizado' });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error("❌ Usuario no encontrado en la BD");
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        console.log("🛠️ Actualizando usuario...");
        user.usuario = username || user.usuario;
        user.contraseña = password || user.contraseña; // 🔴 Guardar en texto plano (NO SEGURO)

        await user.save();
        console.log("✅ Usuario actualizado correctamente:", user);

        // 🔴 Cierra la sesión después de actualizar
        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Error al cerrar sesión:', err);
                return res.status(500).json({ error: 'Error al cerrar sesión' });
            }
            res.clearCookie('connect.sid'); // Borra la cookie de sesión
            res.status(200).json({ message: 'Perfil actualizado y sesión cerrada', redirect: 'login.html' });
        });

    } catch (error) {
        console.error('❌ Error en updateProfile:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const verificarCookie = (req, res) => {
    const miCookie = req.signedCookies.mi_cookie; // Accede a cookies firmadas
    if (!miCookie) {
        return res.status(400).send('Cookie inválida o ausente');
    }
    res.status(200).send(`Cookie válida: ${miCookie}`);
};

module.exports = {
    getUsers,
    registerUser,
    loginUser,
    checkSession,
    publicarProyecto,
    updateProfile,
    logoutUser,
    verificarCookie
};
