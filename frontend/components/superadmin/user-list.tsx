"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { SuperAdminAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

// Interface definitions
interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface UserListResponse {
    users?: User[];
}

// Header Component
function Header({ isLoading, role }: { isLoading: boolean, role?: string }) {
    return (
        <div className="flex justify-center items-center p-4 text-xl font-semibold gap-2">
            Manage and view all registered {role === 'instructor' ? 'instructors' : 'users'}
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>
    );
}

// Edit User Dialog Component
function EditUser({ user, onUpdate }: { user: User; onUpdate: (userId: string, data: Partial<User>) => void }) {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        role: user.role,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(user._id, formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Make changes to user profile here. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor={`name-${user._id}`}>Name</Label>
                            <Input
                                id={`name-${user._id}`}
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`email-${user._id}`}>Email</Label>
                            <Input
                                id={`email-${user._id}`}
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`role-${user._id}`}>Role</Label>
                            <Input
                                id={`role-${user._id}`}
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                placeholder="Enter role"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button type="submit">Save changes</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Main User List Component
export function UserList({ data, role }: { data: UserListResponse, role?: string }) {
    const [users, setUsers] = useState<User[]>(data.users || []);

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    console.log('user list: ', data)
    const handleDelete = async (userId: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                setIsLoading(true);
                await SuperAdminAPI.deleteUser(userId);
                setUsers(users.filter(user => user._id !== userId));
                router.refresh();
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert("Failed to delete user");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleUpdateUser = async (userId: string, updatedData: Partial<User>) => {
        try {
            setIsLoading(true);
            const currentUser = users.find(u => u._id === userId);
            if (!currentUser) return;

            // Handle Role Update separately if it changed
            if (updatedData.role && updatedData.role !== currentUser.role) {
                await SuperAdminAPI.updateUserRole(userId, updatedData.role);
            }

            // Handle other updates
            const { role, ...otherData } = updatedData;
            if (Object.keys(otherData).length > 0) {
                await SuperAdminAPI.updateUser(userId, otherData);
            }

            // Update local state
            setUsers(users.map(user =>
                user._id === userId ? { ...user, ...updatedData } : user
            ));
            router.refresh();
        } catch (error) {
            console.error("Failed to update user:", error);
            alert("Failed to update user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4">
            <Header isLoading={isLoading} role={role} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead colSpan={4} className="text-center text-lg font-bold">
                                All {role == 'instructor' ? "Instructors" : "Users"} ({users.length})
                            </TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead className="font-bold">Name</TableHead>
                            <TableHead className="font-bold">Email</TableHead>
                            <TableHead className="font-bold">Role</TableHead>
                            <TableHead className="font-bold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user._id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${user.role.toLowerCase() === "admin"
                                                ? "bg-purple-100 text-purple-800"
                                                : user.role.toLowerCase() === "moderator"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <EditUser
                                                user={user}
                                                onUpdate={handleUpdateUser}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(user._id)}
                                                disabled={isLoading}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    No {role == 'instructor' ? "Instructors" : "Users"} found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}