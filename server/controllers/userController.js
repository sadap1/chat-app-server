const bcrypt = require("bcrypt");
const { makeAuthDao } = require('../auth-dao.js');
const jwt = require('jsonwebtoken');
const { generateTokenAndSetCookie } = require("../utils/generateToken.js");

module.exports.signup = async (req, res, next) => {
    try {
      let dao;
      const dbUrl = process.env.MONGO_URL;
      const daoResult = await makeAuthDao(dbUrl);
      if(!daoResult.status){
        console.error(daoResult.message);
      }
      dao = daoResult.dao;
      const { username, email, password } = req.body;
      const getUserId = await dao.getByUserId(username);
      if (getUserId.status === true)
        return res.json({ msg: "Username already used", status: false });
      const getResult = await dao.getByEmail(email);
      if (getResult.status === true)
        return res.json({ msg: "Email already used", status: false });
      const profilePic = `https://avatar.iran.liara.run/username?username=${username}&bold=false&length=1`;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { email, username, password: hashedPassword, profilePic};
      const u = await dao.add(user);
      const jwtSecret = process.env.JWT_SECRET;
      generateTokenAndSetCookie(username, res);
      delete u.password;
      return res.json({ status: true, u });
    } catch (ex) {
      next(ex);
    }
  };

  module.exports.signin = async (req, res, next) => {
    try {
      let dao;
      const dbUrl = process.env.MONGO_URL;
      const daoResult = await makeAuthDao(dbUrl);
      if(!daoResult.status){
        console.error(daoResult.message);
      }
      dao = daoResult.dao;
      const { username, password } = req.body;
      const getUser = await dao.getByUserId(username);
      const user = getUser.user;
      if (!getUser.status)
        return res.json({ msg: "Incorrect Username or Password", status: false });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.json({ msg: "Incorrect Username or Password", status: false });
      delete user.password;
      generateTokenAndSetCookie(username, res);
      return res.json({ status: true, user });
    } catch (ex) {
      next(ex);
    }
  };

  module.exports.getcontacts = async (req, res, next) => {
    try {
      let dao;
      const dbUrl = process.env.MONGO_URL;
      const daoResult = await makeAuthDao(dbUrl);
      if(!daoResult.status){
        console.error(daoResult.message);
      }
      dao = daoResult.dao;
      const { username, password } = req.body;
      const users =  await dao.getContacts(req.params);
      return res.json(users.cursor);
    } catch (ex) {
      next(ex);
    }
  }

  module.exports.logout = async (req, res, next) => {
    try {
      res.clearCookie("jwt");
      console.log(res);
      return res
        .clearCookie("jwt")
        .status(200)
        .json({ message: "Successfully logged out" });
    } catch (error) {
      next(error);
    }
  }