import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { action, resourceType, userId, startDate, endDate } = req.query;

        const query = {};

        if (action) {
            query.action = action;
        }

        if (resourceType) {
            query.resourceType = resourceType;
        }

        if (userId) {
            query.performedBy = userId;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const logs = await AuditLog.find(query)
            .populate("performedBy", "name email role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments(query);

        res.status(200).json({
            logs,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createAuditLog = async (data) => {
    try {
        await AuditLog.create(data);
    } catch (error) {
        console.error("Create audit log error:", error);
    }
};
