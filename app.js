var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose'); // Import mongoose
const Proyecto = require('./models/Project'); // Modelo para los proyectos
const session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/@emmetio/codemirror-plugin/dist')));

mongoose.connect('mongodb+srv://CODEPLAY:1234@cluster0.ieneu.mongodb.net/codeplay')
  .then(() => { console.log('Connected to MongoDB...') });

// Middleware de sesión
app.use(session({
  secret: 'mi_secreto_seguro', // Cambia esto por algo seguro
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: process.env.NODE_ENV === 'production', // Solo para HTTPS en producción
      httpOnly: true, // Protege contra XSS
      maxAge: 1000 * 60 * 60 * 24 // Sesión válida por 1 día
  }
}));

// pagina principal
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);
const userControllers = require('./controllers/userControllers');
app.post('/users/login', userControllers.loginUser);
app.get('/users/session', userControllers.checkSession);
app.post('/users/logout', userControllers.logoutUser);
const juegosRoutes = require('./routes/juegos');
app.use('/api/juegos', juegosRoutes);
const projectRoutes = require('./routes/projectRoutes'); // Añade esta línea
app.use('/api/projects', projectRoutes); // Y esta línea
app.use('/api', projectRoutes); // Monta las rutas bajo "/api"
const anotacionesRoutes = require('./routes/anotaciones'); // Importar las rutas
app.use('/api/anotaciones', anotacionesRoutes)

module.exports = app;