"use client";
import React, { useState, useCallback } from "react";
import { format, isValid } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DateRangePicker({
  onChange,
  className,
  mode = "single", // Default to single, but allow overriding
  disabled = false, // Add a disabled prop with a default value of false
}) {
  const [date, setDate] = useState({
    from: null,
    to: null
  });
  const [open, setOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  const handleDateChange = useCallback(
    (selectedDate) => {
      if (disabled) {
        return; // Do nothing if disabled
      }
      // Handle different selection modes
      if (currentMode === "single") {
        const validDate = selectedDate instanceof Date && isValid(selectedDate)
          ? selectedDate
          : null;

        setDate({ from: validDate, to: null });
        onChange(validDate, null);
      } else {
        // Range selection
        const validFrom = selectedDate?.from instanceof Date && isValid(selectedDate.from)
          ? selectedDate.from
          : null;
        const validTo = selectedDate?.to instanceof Date && isValid(selectedDate.to)
          ? selectedDate.to
          : null;

        setDate({ from: validFrom, to: validTo });
        onChange(validFrom, validTo);
      }
    },
    [onChange, currentMode, disabled]
  );

  const clearDate = useCallback(
    (e) => {
      e.stopPropagation();
      if (!disabled) {
        setDate({ from: null, to: null });
        onChange(null, null);
      }
    },
    [onChange, disabled]
  );

  const renderDateDisplay = () => {
    // Single date display
    if (currentMode === "single" && date.from) {
      return format(date.from, "LLL dd, y");
    }

    // Range display
    if (date.from && date.to) {
      return `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`;
    }

    return "Select Date";
  };

  const toggleMode = () => {
    if (!disabled) {
      const newMode = currentMode === "single" ? "range" : "single";
      setCurrentMode(newMode);
      // Reset date when switching modes
      setDate({ from: null, to: null });
      onChange(null, null);
    }
  };

  return (
    <div className="relative flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[300px] justify-between text-left font-normal",
              !date.from && "text-muted-foreground",
              className,
              disabled && "cursor-not-allowed opacity-50" // Visual indication for disabled
            )}
            disabled={disabled} // Apply the disabled attribute to the button
          >
            <span>{renderDateDisplay()}</span>
            {date.from ? (
              <span onClick={clearDate} className="z-50 p-1 cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </span>
            ) : (
              <CalendarIcon className="w-4 h-4 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode={currentMode}
            selected={currentMode === "single" ? date.from : date}
            onSelect={handleDateChange}
            numberOfMonths={currentMode === "range" ? 2 : 1}
            disabled={disabled ? () => true : undefined} // Disable calendar cells if the whole picker is disabled
          />
          <div className="p-2 flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMode}
              disabled={disabled}
            >
              {currentMode === "single" ? "Switch to Range" : "Switch to Single"}
            </Button>
            <Button size="sm" onClick={() => setOpen(false)} disabled={disabled}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}