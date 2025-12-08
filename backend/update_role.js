import mongoose from "mongoose";
import User from "./models/User.js";

mongoose.connect("mongodb://localhost:27017/digital_learning_platform")
    .then(async () => {
        console.log("Connected to MongoDB");
        // Update the user associated with the hardcoded token
        const user = await User.findOneAndUpdate(
            { email: "sol@gmail.com" },
            { role: "admin" },
            { new: true }
        );
        if (user) {
            console.log("Successfully updated user role to admin:", user.email);
        } else {
            console.log("User not found");
        }
        process.exit();
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });
