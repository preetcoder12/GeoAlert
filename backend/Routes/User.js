const express = require("express");
const routes = express.Router();
const { UserSignup, UserLogin } = require("../Controllers/User");

routes.post("/signup", UserSignup);
routes.post("/login", UserLogin);

module.exports = routes;
