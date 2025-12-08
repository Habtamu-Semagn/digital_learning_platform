
import { UserList } from "@/components/superadmin/user-list";
import { AdminAPI } from "@/lib/api";

export default async function Users() {
    const data = await AdminAPI.getUsers();
    return <div>
        <UserList data={data} />
    </div>
}


