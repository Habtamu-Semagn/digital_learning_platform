const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/digital_learning_platform")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  console.log("Welcome to the Digital Learning Platform API");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
