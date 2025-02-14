    var express = require('express');
    var router = express.Router();
    const userControllers = require('../controllers/userControllers');

    /* GET users listing. */
    router.get('/',userControllers.getUsers);

    router.post('/register', userControllers.registerUser);

    router.post('/login', userControllers.loginUser);

    router.post('/updateProfile', userControllers.updateProfile);

    router.get('/verificar-cookie', userControllers.verificarCookie);

    module.exports = router;

