import { SuperAdminAPI } from "@/lib/api";

export default async function Users() {
  const data = await SuperAdminAPI.getUsers();
  console.log("user data on all users: ", data);
  return <div>all users</div>;
}
