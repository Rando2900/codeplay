var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const mongoose = require('mongoose'); // Import mongoose
const Proyecto = require('./models/Project'); // Modelo para los proyectos
const session = require('express-session');
const MongoStore = require('connect-mongo');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/@emmetio/codemirror-plugin/dist')));
app.use(express.urlencoded({ extended: true }));

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://CODEPLAY:1234@cluster0.ieneu.mongodb.net/codeplay';

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectado a MongoDB en la nube'))
  .catch(err => {
      console.error('❌ Error conectando a MongoDB:', err.message);
      process.exit(1);
  });

// Middleware de sesión
app.use(session({
  secret: 'mi_secreto_seguro', // Cambia esto por algo seguro
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
      mongoUrl: mongoUri,
      ttl: 14 * 24 * 60 * 60 // Tiempo de vida de la sesión (14 días)
  }),
} ));

// pagina principal
app.get('/', (req, res) => res.render('index', { title: 'Inicio' }));
app.get('/registro', (req, res) => res.render('registro', { title: 'Registro' }));
app.get('/login', (req, res) => res.render('login', { title: 'Iniciar Sesión' }));
app.get('/perfil', (req, res) => res.render('perfil', { title: 'Perfil' }));
app.get('/perfil_usuario', (req, res) => res.render('perfil_usuario', { title: 'Perfil de Usuario' }));
app.get('/editarperfil', (req, res) => res.render('editarperfil', { title: 'Editar Perfil' }));
app.get('/proyecto', (req, res) => res.render('proyecto', { title: 'Proyecto' }));
app.get('/juegos', (req, res) => res.render('juegos', { title: 'Juegos' }));
app.get('/editarjuegos', (req, res) => res.render('editarjuegos', { title: 'Editor de Juegos' }));
app.get('/comunidad', (req, res) => res.render('comunidad', { title: 'Comunidad' }));
app.get('/terminos_condiciones', (req, res) => res.render('terminos_condiciones', { title: 'Términos y Condiciones' }));
app.get('/politica_privacidad', (req, res) => res.render('politica_privacidad', { title: 'Política de Privacidad' }));
app.get('/formulario', (req, res) => res.render('formulario', { title: 'Formulario' }));
app.get('/buscador', (req, res) => res.render('buscador', { title: 'Buscador' }));
app.get('/anotaciones', (req, res) => res.render('anotaciones', { title: 'Anotaciones' }));
app.get('/editarProyecto', (req, res) => res.render('editarProyecto', { title: 'Editar Proyecto' }));
app.get('/editarJuego', (req, res) => res.render('editarJuego', { title: 'Editar Juego' }));



app.use((req, res, next) => {
  res.locals.user = req.session.user || null; 
  next();
});


// 📌 Rutas de API
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

app.get('/editarAnotacion', (req, res) => {
  res.render('editaranotaciones', { title: 'Editar Anotación' });
});



const userControllers = require('./controllers/userControllers');
app.post('/users/register', userControllers.registerUser);
app.post('/users/login', userControllers.loginUser);
app.get('/users/session', userControllers.checkSession);
app.post('/users/logout', userControllers.logoutUser);

const juegosRoutes = require('./routes/juegos');
app.use('/api/juegos', juegosRoutes);

const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);
app.use('/api', projectRoutes); // Monta las rutas bajo "/api"

const anotacionesRoutes = require('./routes/anotaciones');
app.use('/api/anotaciones', anotacionesRoutes);

// Ruta para mostrar un proyecto específico
app.get('/project', async (req, res) => {
  const projectId = req.query.id; // Obtener el ID del proyecto desde la URL

  if (!projectId) {
      return res.status(400).send('ID del proyecto no proporcionado');
  }

  try {
    const response = await fetch(`https://code-play.es/api/projects/${projectId}`);
      if (!response.ok) {
          throw new Error('No se pudo obtener el proyecto');
      }
      const project = await response.json();
      res.render('project', { title: 'Proyecto', project });
  } catch (error) {
      res.status(500).send('Error al cargar el proyecto');
  }
});

// Ruta para mostrar un juego específico
app.get('/juego', async (req, res) => {
  const juegoId = req.query.id; // Obtener el ID del juego desde la URL

  if (!juegoId) {
      return res.status(400).send('ID del juego no proporcionado');
  }

  try {
      const response = await fetch(`http://localhost:3000/api/juegos/${juegoId}`);
      if (!response.ok) {
          throw new Error('No se pudo obtener el juego');
      }
      const juego = await response.json();
      res.render('juego', { title: 'Juego', juego });
  } catch (error) {
      res.status(500).send('Error al cargar el juego');
  }
});

// Middleware de error 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada' });
});

// Iniciar el servidor
module.exports = app;