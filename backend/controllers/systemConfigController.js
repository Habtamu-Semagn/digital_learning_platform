import SystemConfig from "../models/SystemConfig.js";

export const getSystemConfig = async (req, res) => {
    try {
        const config = await SystemConfig.getConfig();
        res.status(200).json({
            status: "success",
            data: { config },
        });
    } catch (error) {
        console.error("Get system config error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateSystemConfig = async (req, res) => {
    try {
        const { siteName, siteDescription, maintenanceMode, allowedFileTypes, maxFileSize } = req.body;

        let config = await SystemConfig.getConfig();

        config.siteName = siteName ?? config.siteName;
        config.siteDescription = siteDescription ?? config.siteDescription;
        config.maintenanceMode = maintenanceMode ?? config.maintenanceMode;
        config.allowedFileTypes = allowedFileTypes ?? config.allowedFileTypes;
        config.maxFileSize = maxFileSize ?? config.maxFileSize;
        config.updatedBy = req.user._id;
        config.updatedAt = Date.now();

        await config.save();

        res.status(200).json({
            status: "success",
            data: { config },
        });
    } catch (error) {
        console.error("Update system config error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
