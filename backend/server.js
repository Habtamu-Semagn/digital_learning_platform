import mongoose from "mongoose";
import app from "./app.js";
// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/digital_learning_platform")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
