import { AuditLogsTable } from "@/components/superadmin/audit-logs-table";
import { SuperAdminAPI } from "@/lib/api";

export default async function AuditLogsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const action = typeof searchParams.action === "string" ? searchParams.action : undefined;
  const userId = typeof searchParams.userId === "string" ? searchParams.userId : undefined;

  // Fetch logs
  // Note: In a real scenario, we'd handle errors here.
  const data = await SuperAdminAPI.getAuditLogs(page, limit, {
    action,
    userId,
  }).catch(() => ({
    logs: [],
    page: 1,
    pages: 1,
    total: 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track and monitor system activities and changes.
        </p>
      </div>
      <AuditLogsTable
        logs={data.logs}
        page={data.page}
        totalPages={data.pages}
      />
    </div>
  );
}