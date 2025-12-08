"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateRange = {
    from: Date;
    to: Date;
};

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    className?: string;
}

export function DateRangePicker({
    value,
    onChange,
    className,
}: DateRangePickerProps) {
    const presets = [
        {
            label: "Last 7 days",
            getValue: () => ({
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                to: new Date(),
            }),
        },
        {
            label: "Last 30 days",
            getValue: () => ({
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                to: new Date(),
            }),
        },
        {
            label: "Last 90 days",
            getValue: () => ({
                from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                to: new Date(),
            }),
        },
        {
            label: "Last 365 days",
            getValue: () => ({
                from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                to: new Date(),
            }),
        },
    ];

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        {value?.from ? (
                            value.to ? (
                                <>
                                    {formatDate(value.from)} - {formatDate(value.to)}
                                </>
                            ) : (
                                formatDate(value.from)
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 space-y-2">
                        <div className="text-sm font-medium mb-2">Quick Select</div>
                        {presets.map((preset) => (
                            <Button
                                key={preset.label}
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => onChange(preset.getValue())}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
