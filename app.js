const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const user = require("./api/routes/users");

const port = 8000;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", user);

app.get("/", (req, res) => {
  res.status(200).json({ Msg: "Hello" });
});

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
