require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const UserRoutes = require("./Routes/User");
const app = express();
const port = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log(" MongoDB Connected"))
    .catch(err => {
        console.error(" MongoDB Connection Failed:", err);
        process.exit(1);
    });

app.get("/", (req, res) => {
    res.send("Hello, world!");
});

app.use("/user", UserRoutes);

app.listen(port, () => {
    console.log(`🚀 Server is running on port http://localhost:${port}`);
});
