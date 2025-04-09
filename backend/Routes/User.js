const express = require("express");
const routes = express.Router();
const { UserSignup, UserLogin, updatelocation, sendsms, userdetails } = require("../Controllers/User");
const { Report } = require("../Controllers/Reports")

routes.post("/signup", UserSignup);
routes.post("/login", UserLogin);
routes.post("/report", Report);
routes.get("/details/:id", userdetails);
routes.put("/updateLocation/:id", updatelocation);
routes.post("/sendsms", sendsms);


module.exports = routes;
