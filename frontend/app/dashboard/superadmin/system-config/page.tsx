import { SystemConfigForm } from "@/components/superadmin/system-config-form";
import { SuperAdminAPI } from "@/lib/api";

export default async function SystemConfigPage() {
  // Fetch initial config
  // In a real app, you might want to handle errors or loading states more gracefully
  const config = await SuperAdminAPI.getSystemConfig().catch(() => ({
    _id: "",
    siteName: "Digital Learning Platform",
    siteDescription: "A platform for digital learning resources.",
    maintenanceMode: false,
    allowedFileTypes: [".pdf", ".mp4", ".epub"],
    maxFileSize: 100,
    updatedAt: new Date().toISOString(),
    updatedBy: "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground">
          Manage global settings for the platform.
        </p>
      </div>
      <div className="max-w-2xl">
        <SystemConfigForm initialConfig={config} />
      </div>
    </div>
  );
}
