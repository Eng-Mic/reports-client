"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const EquipmentsSelect = ({ onEquipmentChange, availableEquipments = [] }) => {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState([]);

  const toggleSelection = (value) => {
    const updatedValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    setSelectedValues(updatedValues);

    if (onEquipmentChange) {
      onEquipmentChange((prev) => {
        const prevEquipments = prev.equipments || [];
        return {
          ...prev,
          equipments: updatedValues,
        };
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-[250px] justify-between", selectedValues.length > 0 && "min-w-fit")} role="combobox" aria-expanded={open}>
          {selectedValues.length > 0 ? (
            selectedValues.length > 2
              ? `${selectedValues.slice(0, 2).join(", ")} ...(+${selectedValues.length - 2})`
              : selectedValues.join(", ")
          ) : (
            "Select equipments"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-fit p-0">
        <Command className="w-full">
          <CommandInput placeholder="Search equipment..." className="h-9" />
          <CommandList>
            <CommandGroup>
              {availableEquipments.map((equip, index) => {
                const displayValue = equip.label || equip.value || `Item ${index}`; // added index
                const uniqueValue = equip.value || displayValue; // Use value if available for selection

                return (
                  <CommandItem
                    key={index}
                    onSelect={() => toggleSelection(uniqueValue)}
                    className="cursor-pointer"
                  >
                    <Check className={cn("mr-2", selectedValues.includes(uniqueValue) ? "opacity-100" : "opacity-0")} />
                    {displayValue}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default EquipmentsSelect;
