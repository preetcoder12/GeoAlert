const express = require("express");
const routes = express.Router();
const {
  AdminSignup,
  AdminLogin,
  AllUsers,
  deletespecificuser,
  Allincidents,
  specificincident,
} = require("../Controllers/Admin");

routes.post("/adminsignup", AdminSignup);
routes.post("/adminlogin", AdminLogin);
routes.get("/allusers", AllUsers);
routes.delete("/deleteuser/:id", deletespecificuser);

routes.get("/allincidents", Allincidents);
routes.get("/incident/:id", specificincident);

module.exports = routes;
