
import { UserList } from "@/components/superadmin/user-list";
import { SuperAdminAPI } from "@/lib/api";

export default async function Users() {
  const data = await SuperAdminAPI.getAllUsers();
  return <div>
    <UserList data={data} />
  </div>
}


