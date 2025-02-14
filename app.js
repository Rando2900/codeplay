var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('mi_clave_secreta_firmada'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/@emmetio/codemirror-plugin/dist')));

// 🔹 Conexión a MongoDB
mongoose.connect('mongodb+srv://CODEPLAY:1234@cluster0.ieneu.mongodb.net/codeplay')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// 🔹 Configuración de sesión segura
app.use(session({
  secret: 'mi_secreto_seguro',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://CODEPLAY:1234@cluster0.ieneu.mongodb.net/codeplay',
    collectionName: 'sessions'
  }),
  cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true, // Bloquea acceso desde JS
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 // Expira en 1 día
  }
}));

// 🔹 Middleware para verificar cookies alteradas
app.use((req, res, next) => {
  if (req.signedCookies.loggedInUser) {
      console.log("✅ Cookie firmada válida:", req.signedCookies.loggedInUser);
  } else if (req.cookies.loggedInUser) {
      console.warn("⚠ Cookie sin firmar detectada. Posible manipulación.");
      res.clearCookie('loggedInUser');  // Borra la cookie modificada
      return res.status(401).send('No autorizado: cookie alterada');
  }
  next();
});

// 🔹 Middleware para verificar autenticación (excluyendo login y registro)
app.use((req, res, next) => {
  const rutasPermitidas = ['/users/login', '/users/register'];
  if (!req.session.userId && !rutasPermitidas.includes(req.path)) {
      return res.status(401).send('No autorizado');
  }
  next();
});

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