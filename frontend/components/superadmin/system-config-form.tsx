"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { SystemConfig, SuperAdminAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

const systemConfigSchema = z.object({
    siteName: z.string().min(2, {
        message: "Site name must be at least 2 characters.",
    }),
    siteDescription: z.string().optional(),
    maintenanceMode: z.boolean().default(false),
    allowedFileTypes: z.string().refine(
        (val) => {
            const types = val.split(",").map((t) => t.trim());
            return types.every((t) => t.startsWith("."));
        },
        {
            message: "File types must start with a dot (e.g., .pdf, .mp4)",
        }
    ),
    maxFileSize: z.coerce.number().min(1, {
        message: "Max file size must be at least 1 MB.",
    }),
});

interface SystemConfigFormProps {
    initialConfig: SystemConfig;
}

export function SystemConfigForm({ initialConfig }: SystemConfigFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof systemConfigSchema>>({
        resolver: zodResolver(systemConfigSchema),
        defaultValues: {
            siteName: initialConfig.siteName,
            siteDescription: initialConfig.siteDescription,
            maintenanceMode: initialConfig.maintenanceMode,
            allowedFileTypes: initialConfig.allowedFileTypes.join(", "),
            maxFileSize: initialConfig.maxFileSize,
        },
    });

    async function onSubmit(values: z.infer<typeof systemConfigSchema>) {
        setIsLoading(true);
        try {
            const formattedValues = {
                ...values,
                allowedFileTypes: values.allowedFileTypes.split(",").map((t) => t.trim()),
            };
            await SuperAdminAPI.updateSystemConfig(formattedValues);
            toast.success("System configuration updated successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to update system configuration");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="siteName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Digital Learning Platform" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the name that will be displayed on the dashboard and emails.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="siteDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="A brief description of your platform."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                This description may be used for SEO and meta tags.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="allowedFileTypes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Allowed File Types</FormLabel>
                            <FormControl>
                                <Input placeholder=".pdf, .mp4, .epub" {...field} />
                            </FormControl>
                            <FormDescription>
                                Comma-separated list of allowed file extensions for uploads.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="maxFileSize"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Max File Size (MB)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>
                                Maximum allowed file size for uploads in Megabytes.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Maintenance Mode</FormLabel>
                                <FormDescription>
                                    Enable this to prevent users from accessing the platform during maintenance.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </Form>
    );
}
