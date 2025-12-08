import mongoose from "mongoose";
import User from "./models/User.js";

mongoose.connect("mongodb://localhost:27017/digital_learning_platform")
    .then(async () => {
        console.log("Connected to MongoDB");
        const userId = "692d7d2937f816954cd90b18";
        const user = await User.findById(userId);
        if (user) {
            console.log("User found:", user.email);
            console.log("Role:", user.role);

            if (user.role !== "admin") {
                console.log("Updating role to admin...");
                user.role = "admin";
                await user.save();
                console.log("Role updated to:", user.role);
            }
        } else {
            console.log("User not found with ID:", userId);
        }
        process.exit();
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });
