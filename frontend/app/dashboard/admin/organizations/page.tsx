
import { InstitutionList } from "@/components/admin/organisation-list";
import { AdminAPI } from "@/lib/api";

export default async function Organisations() {
    const data = await AdminAPI.getInstitutions();
    console.log("organisation data: ", data);
    return <div>
        <InstitutionList data={data} role="institution" />
    </div>
}


