const express = require("express");
require("dotenv").config();
const connectToMongo = require("./db");
const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use("/api/auth", require("./routes/auth"));
connectToMongo();
app.get("/", (req, res) => {
  res.json("hello bhai");
});
app.listen(PORT, (req, res) => {
  console.log(`listening at port ${PORT}`);
});
