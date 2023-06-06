require("dotenv").config();
const connection = require("./db");
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/user");
// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("common"));

app.use("/api/users", userRoutes);

const port = process.env.PORT || 1000;
app.listen(port, console.log(`Listening on port ${port}...`));





