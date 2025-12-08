import { UserList } from "@/components/superadmin/user-list";
import { SuperAdminAPI } from "@/lib/api";

export default async function InstructorsPage() {
    const data = await SuperAdminAPI.getInstructors();
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Instructors</h1>
                <p className="text-muted-foreground">
                    Manage all instructors on the platform.
                </p>
            </div>
            <UserList data={data} />
        </div>
    );
}
