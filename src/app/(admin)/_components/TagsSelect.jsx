"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import useTransformedRecordStore from "@/store/engStore";

const TagsSelect = ({ selectedEquipments, onTagChange }) => {
    const [open, setOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const transformedRecords = useTransformedRecordStore((state) => state.transformedRecords);
    const [availableTagsByEquipment, setAvailableTagsByEquipment] = useState({});

    // Memoize available tags based on selected equipments and transformed records
    useEffect(() => {
        if (!selectedEquipments || selectedEquipments.length === 0 || !transformedRecords) {
            setAvailableTagsByEquipment({});
            return;
        }

        const tagsByEquip = {};
        selectedEquipments.forEach(equip => {
            const filteredRecords = transformedRecords.filter(record => record.equip === equip && record.TagName);
            const uniqueTags = [...new Set(filteredRecords.map(record => record.TagName))].sort();
            if (uniqueTags.length > 0) {
                tagsByEquip[equip] = uniqueTags;
            }
        });
        setAvailableTagsByEquipment(tagsByEquip);
    }, [selectedEquipments, transformedRecords]);

    const allAvailableTagsArray = useMemo(() => {
        return Object.values(availableTagsByEquipment).flat();
    }, [availableTagsByEquipment]);

    const toggleTagSelection = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
        );
        if (onTagChange) {
            onTagChange((prev) => ({
                ...prev,
                tags: prev.tags.includes(tag)
                    ? prev.tags.filter((item) => item !== tag)
                    : [...prev.tags, tag],
            }));
        }
    };

    const isInactive = !selectedEquipments || selectedEquipments.length === 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                  variant="outline"
                  className={cn(
                      "w-[250px] justify-between",
                      selectedTags?.length > 0 && "min-w-fit",
                      isInactive && "cursor-not-allowed opacity-50"
                  )}
                  role="combobox"
                  aria-expanded={open}
                  disabled={isInactive}
              >
                  {selectedTags.length > 0 ? (
                      selectedTags.length > 2 ? (
                          `${selectedTags.slice(0, 2).join(", ")} ...(${selectedTags.length - 2}+)`
                      ) : (
                          selectedTags.join(", ")
                      )
                  ) : (
                      isInactive ? "Select equipments first" : "Select equipment tags"
                  )}
                  <ChevronsUpDown className="opacity-50" />
              </Button>
          </PopoverTrigger>
            <PopoverContent className="min-w-fit p-0">
                <Command>
                    <CommandInput placeholder="Search equipment tags..." className="h-9" />
                    <CommandList>
                        {isInactive ? (
                            <CommandEmpty>Select an equipment first</CommandEmpty>
                        ) : Object.keys(availableTagsByEquipment).length === 0 && selectedEquipments.length > 0 ? (
                            <CommandEmpty>No tags available for selected equipments</CommandEmpty>
                        ) : (
                            <>
                                {Object.entries(availableTagsByEquipment).map(
                                    ([equipment, tags]) => (
                                        <CommandGroup heading={<div className="underline">{equipment}</div>} key={equipment}>
                                            {tags.map((tag) => (
                                                <CommandItem
                                                    key={tag}
                                                    onSelect={() => toggleTagSelection(tag)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "min-w-fit mr-2 cursor-pointer",
                                                            selectedTags.includes(tag) ? "opacity-100 cursor-pointer" : "opacity-0"
                                                        )}
                                                    />
                                                    {tag}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )
                                )}
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default TagsSelect;