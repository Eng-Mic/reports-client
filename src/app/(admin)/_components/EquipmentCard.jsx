"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import useTransformedRecordStore from '@/store/engStore';
import EngChart from './EngChart';

const EquipmentCard = ({ equipment, onTagsSelected = () => {}, dateRange = null }) => {
    const [open, setOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const rawRecords = useTransformedRecordStore((state) => state.rawRecords);

    // console.log("Equipment Card - Raw Records:", rawRecords);
    // console.log("Equipment Card - Equipment:", equipment);
    


    useEffect(() => {
        setSelectedTags([]);
    }, [equipment]);

    // When dateRange changes, ensure we're using the updated filtered records
    useEffect(() => {
        console.log("Date range changed in EquipmentCard:", dateRange);
    }, [dateRange]);

    // Use filtered records if date range is provided, otherwise use all records
    const recordsToUse = rawRecords;

    // console.log("Records to use:", recordsToUse);
    

    // Get the equipment record
    const equipmentRecord = useMemo(() => {
        if (!equipment || !recordsToUse || recordsToUse.length === 0) return null;
        return recordsToUse.find(record => record.equip === equipment);
    }, [equipment, recordsToUse]);

    // console.log("Equipment Record:", equipmentRecord);
    

    // Extract tag data in the format EngChart expects
    const tagData = useMemo(() => {
        if (!equipmentRecord || !equipmentRecord.tags) return [];
        return equipmentRecord.tags;
    }, [equipmentRecord]);

    // console.log("Equipment Data for chart:", tagData);

    const availableTags = useMemo(() => {
        if (!rawRecords || rawRecords.length === 0) return [];
      
        const allTags = new Set();
        rawRecords.forEach(record => {
          if (record && record.TagName) {
            allTags.add(record.TagName);
          }
        });
      
        return Array.from(allTags).sort();
      }, [rawRecords]); // Now the dependency is on rawRecords

    // console.log("Available Tags:", availableTags);

    const toggleTagSelection = (tag) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        setSelectedTags(newSelectedTags);
        onTagsSelected(equipment, newSelectedTags);
    };

    return (
        <div className="mb-[5px] bg-[#f8f8f8] rounded-md border overflow-hidden relative">
            <div className="sticky top-0 z-10">
                <div className="flex items-center justify-between px-4 py-[5px] border-b">
                    <h2 className="text-[16px] font-semibold">{equipment}</h2>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button 
                                variant="outline" 
                                className={cn(
                                    "w-[250px] justify-between",
                                    selectedTags?.length > 0 && "min-w-fit"
                                )} 
                                role="combobox" 
                                aria-expanded={open}
                            >
                                {selectedTags.length > 0 ? (
                                    selectedTags.length > 1 ? (
                                        `${selectedTags.slice(0, 1).join(", ")} ...(${selectedTags.length - 1}+)`
                                    ) : (
                                        selectedTags.join(", ")
                                    )
                                ) : (
                                    "Select equipment tags"
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="min-w-fit p-0">
                            <Command>
                                <CommandInput placeholder="Search tags..." />
                                <CommandList>
                                    {availableTags.length > 0 ? (
                                        availableTags.map((tag, index) => (
                                            <CommandItem
                                                key={index}
                                                onSelect={() => toggleTagSelection(tag)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {tag}
                                            </CommandItem>
                                        ))
                                    ) : (
                                        <CommandEmpty>No tags available</CommandEmpty>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="p-[5px]">
                {/* {selectedTags.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {selectedTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="px-2.5 py-0.5 text-xs font-light"
                                >
                                    {tag}
                                    <button
                                        className="ml-1.5"
                                        onClick={() => toggleTagSelection(tag)}
                                    >
                                        ×
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )} */}
                <div className={cn("py-[1rem] bg-slate-50 rounded-md ", selectedTags.length > 0 && "h-[18.5rem] 2xl:h-[37.5rem] overflow-y-scroll")}>
                    <EngChart
                        selectedTags={selectedTags} 
                        equipmentData={tagData}
                        dateRange={dateRange}
                    />
                </div>
            </div>
        </div>
    );
};

export default EquipmentCard;