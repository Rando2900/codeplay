const User = require('../models/User');

const getUsers = async () => {
  const users = await User.find();
  return users;
};

const registerUser = async (usuario, contraseña) => {
  console.log(usuario, contraseña);
  const user = new User({
    usuario : usuario,
    contraseña : contraseña
  });
  return user;
};

const loginUser = async (username, password) => {
  console.log(username, password);
  return await User.findOne({ username, password });
};


module.exports = {
    getUsers,
    registerUser,
    loginUser
};
