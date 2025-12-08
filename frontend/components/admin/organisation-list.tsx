"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Add this import
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
// Rename API import to match your actual API structure
import { AdminAPI } from "@/lib/api"; // Changed from SuperAdminAPI

// ✅ Correct interface name (camelCase)
interface Institution {
    _id: string;
    name: string;
    contactEmail: string; // Changed from email to match your interface
    website: string;
    // Add missing fields that your backend might return
    status?: string;
    type?: string;
    createdAt?: string;
}

// ✅ Correct interface name (camelCase)
interface InstitutionListResponse {
    institutions: Institution[]; // ✅ Changed from 'Institutions' to 'institutions'
    count: number;
}

// Header Component
function Header({ isLoading, role }: { isLoading: boolean; role?: string }) {
    return (
        <div className="flex justify-center items-center p-4 text-xl font-semibold gap-2">
            Manage and view all registered {role === 'instructor' ? 'instructors' : 'institutions'}
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>
    );
}

// Edit Institution Dialog Component
function EditInstitutionDialog({
    institution, // ✅ Changed from 'Institution' to 'institution' (lowercase)
    onUpdate
}: {
    institution: Institution;
    onUpdate: (institutionId: string, data: Partial<Institution>) => void
}) {
    const [formData, setFormData] = useState({
        name: institution.name,
        contactEmail: institution.contactEmail, // ✅ Changed from 'email' to 'contactEmail'
        website: institution.website || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(institution._id, formData);
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
                        <DialogTitle>Edit Institution</DialogTitle>
                        <DialogDescription>
                            Make changes to institution profile here. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor={`name-${institution._id}`}>Name</Label>
                            <Input
                                id={`name-${institution._id}`}
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter institution name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`email-${institution._id}`}>Contact Email</Label>
                            <Input
                                id={`email-${institution._id}`}
                                name="contactEmail" // ✅ Changed from 'email' to 'contactEmail'
                                type="email"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                placeholder="Enter contact email"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`website-${institution._id}`}>Website</Label>
                            <Input
                                id={`website-${institution._id}`}
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="Enter website URL"
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

// Main Institution List Component
export function InstitutionList({ data, role }: { data: InstitutionListResponse; role?: string }) {
    const [institutions, setInstitutions] = useState<Institution[]>(data.institutions || []); // ✅ Changed from 'Institutions' to 'institutions'
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter(); // ✅ Changed from InstitutionRouter() to useRouter()
    console.log("institutions: ", data)
    const handleDelete = async (institutionId: string) => {
        if (confirm("Are you sure you want to delete this institution?")) {
            try {
                setIsLoading(true);
                // ✅ Update API call to match your backend
                await AdminAPI.deleteInstitution(institutionId); // Changed from SuperAdminAPI
                setInstitutions(institutions.filter(institution => institution._id !== institutionId));
                router.refresh();
            } catch (error) {
                console.error("Failed to delete institution:", error);
                alert("Failed to delete institution");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleUpdateInstitution = async (institutionId: string, updatedData: Partial<Institution>) => {
        try {
            setIsLoading(true);
            const currentInstitution = institutions.find(u => u._id === institutionId);
            if (!currentInstitution) return;

            // ✅ Update API call to match your backend methods
            // Assuming your API has updateInstitution method
            await AdminAPI.updateInstitution(institutionId, updatedData);

            // Update local state
            setInstitutions(institutions.map(institution =>
                institution._id === institutionId ? { ...institution, ...updatedData } : institution
            ));
            router.refresh();
        } catch (error) {
            console.error("Failed to update institution:", error);
            alert("Failed to update institution");
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
                                All {role === 'instructor' ? "Instructors" : "Institutions"} ({institutions.length})
                            </TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead className="font-bold">Name</TableHead>
                            <TableHead className="font-bold">Email</TableHead>
                            <TableHead className="font-bold">Website</TableHead>
                            <TableHead className="font-bold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {institutions.length > 0 ? (
                            institutions.map((institution) => (
                                <TableRow key={institution._id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{institution.name}</TableCell>
                                    <TableCell>{institution.contactEmail}</TableCell>
                                    <TableCell>
                                        {institution.website ? (
                                            <a
                                                href={institution.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {institution.website}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">No website</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <EditInstitutionDialog
                                                institution={institution}
                                                onUpdate={handleUpdateInstitution}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(institution._id)}
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
                                    No {role === 'instructor' ? "Instructors" : "Institutions"} found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}