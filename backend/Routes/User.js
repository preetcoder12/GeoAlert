const express = require("express");
const routes = express.Router();
const { UserSignup, UserLogin } = require("../Controllers/User");
const {Report} = require("../Controllers/Reports")

routes.post("/signup", UserSignup);
routes.post("/login", UserLogin);
routes.post("/report", Report);

module.exports = routes;
