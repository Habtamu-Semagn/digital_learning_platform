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
import { Edit, Trash2, Loader2, Plus } from "lucide-react";
import { SuperAdminAPI, User, UserListResponse } from "@/lib/api";
import { useRouter } from "next/navigation";

// Header Component with Create Button
function Header({ isLoading, onCreate }: { isLoading: boolean; onCreate: (data: any) => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "admin",
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsCreating(true);
            await onCreate(formData);
            setIsOpen(false);
            setFormData({ name: "", email: "", password: "", role: "admin" });
        } catch (error) {
            console.error("Failed to create admin:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2 text-xl font-semibold">
                Manage Admins
                {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Admin
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Create New Admin</DialogTitle>
                            <DialogDescription>
                                Add a new administrator to the system.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter name"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Admin
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Edit User Dialog Component (Reused logic)
function EditUser({ user, onUpdate }: { user: User; onUpdate: (userId: string, data: Partial<User>) => Promise<void> }) {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        role: user.role,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await onUpdate(user._id, formData);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to update:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Admin</DialogTitle>
                        <DialogDescription>
                            Make changes to admin profile here.
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
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Main Admin List Component
export function AdminList({ data }: { data: UserListResponse }) {
    // Filter users to ensure only admins are shown (client-side fallback)
    const [users, setUsers] = useState<User[]>((data.users || []).filter(u => u.role === "admin"));
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async (userId: string) => {
        if (confirm("Are you sure you want to delete this admin?")) {
            try {
                setIsLoading(true);
                await SuperAdminAPI.deleteUser(userId);
                setUsers(users.filter(user => user._id !== userId));
                router.refresh();
            } catch (error) {
                console.error("Failed to delete admin:", error);
                alert("Failed to delete admin");
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

            if (updatedData.role && updatedData.role !== currentUser.role) {
                await SuperAdminAPI.updateUserRole(userId, updatedData.role);
            }

            const { role, ...otherData } = updatedData;
            if (Object.keys(otherData).length > 0) {
                // @ts-ignore - institution type mismatch is handled by not including it in updates here
                await SuperAdminAPI.updateUser(userId, otherData as any);
            }

            setUsers(users.map(user =>
                user._id === userId ? { ...user, ...updatedData } : user
            ));
            router.refresh();
        } catch (error) {
            console.error("Failed to update admin:", error);
            alert("Failed to update admin");
            throw error; // Re-throw to handle in dialog
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAdmin = async (data: any) => {
        try {
            setIsLoading(true);
            const newUser = await SuperAdminAPI.createAdmin(data);
            setUsers([newUser, ...users]);
            router.refresh();
        } catch (error) {
            console.error("Failed to create admin:", error);
            alert("Failed to create admin");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4">
            <Header isLoading={isLoading} onCreate={handleCreateAdmin} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead colSpan={4} className="text-center text-lg font-bold">
                                All Admins ({users.length})
                            </TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead className="font-bold">Name</TableHead>
                            <TableHead className="font-bold">Email</TableHead>
                            <TableHead className="font-bold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user._id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
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
                                    No admins found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
