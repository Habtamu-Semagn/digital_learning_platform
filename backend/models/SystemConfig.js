import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: "Digital Learning Platform",
    },
    siteDescription: {
        type: String,
        default: "A platform for digital learning resources.",
    },
    maintenanceMode: {
        type: Boolean,
        default: false,
    },
    allowedFileTypes: {
        type: [String],
        default: [".pdf", ".mp4", ".epub"],
    },
    maxFileSize: {
        type: Number, // in MB
        default: 100,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

// Singleton pattern: ensure only one config document exists
systemConfigSchema.statics.getConfig = async function () {
    const config = await this.findOne();
    if (config) {
        return config;
    }
    return await this.create({});
};

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);

export default SystemConfig;
