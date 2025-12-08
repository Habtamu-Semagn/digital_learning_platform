
import { UserList } from "@/components/superadmin/user-list";
import { AdminAPI } from "@/lib/api";

export default async function Instructors() {
    const data = await AdminAPI.getInstructors();
    return <div>
        <UserList data={data} role="instructor" />
    </div>
}


