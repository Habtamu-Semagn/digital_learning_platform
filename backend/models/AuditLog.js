import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ["create", "update", "delete", "login", "view", "export"],
    },
    resourceType: {
        type: String,
        required: true,
    },
    resourceId: {
        type: String,
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceType: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
