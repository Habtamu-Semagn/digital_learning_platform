import { AdminList } from "@/components/superadmin/admin-list";
import { SuperAdminAPI } from "@/lib/api";

export default async function Admins() {
  const data = await SuperAdminAPI.getAdmins();
  return <div>
    <AdminList data={data} />
  </div>
}
