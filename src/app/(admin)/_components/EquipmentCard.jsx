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

const EquipmentCard = ({ 
  equipment, 
  onTagsSelected = () => {}, 
  dateRange = null,
  filteredRecords = { tags: [] } // Renamed from rawRecords to clarify it's already filtered
}) => {
    const [open, setOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    
    // Get equipment-specific records directly from props instead of store
    const equipmentRecords = filteredRecords.tags || [];

    // console.log("Equipment Card - Equipment:", equipment);
    // console.log("Equipment Card - Filtered Records:", equipmentRecords);
    // console.log("Equipment Card - Date Range:", dateRange);

    useEffect(() => {
        // Reset selected tags when equipment changes
        setSelectedTags([]);
    }, [equipment]);

    // When dateRange changes, ensure we're using the updated filtered records
    useEffect(() => {
        console.log("Date range changed in EquipmentCard:", dateRange);
    }, [dateRange]);

    // Extract tag data in the format EngChart expects
    const tagData = useMemo(() => {
        // Simply use the equipment-specific records we received
        return equipmentRecords;
    }, [equipmentRecords]);

    // console.log("Equipment Data for chart:", tagData);

    // Extract available tags from the equipment-specific records
    const availableTags = useMemo(() => {
        if (!equipmentRecords || equipmentRecords.length === 0) return [];
    
        const tagMap = new Map();
    
        equipmentRecords.forEach(record => {
            if (typeof record.TagName === 'string') {
                const tag = record.TagName;
                const description = record.Description || 'No description available';
    
                if (!tagMap.has(tag)) {
                    tagMap.set(tag, description);
                }
            }
        });
    
        // Convert to array of objects and sort by tag name
        return Array.from(tagMap.entries())
            .map(([name, description]) => ({ name, description }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [equipmentRecords]);
    
      
    // console.log("Available Tags:", availableTags);

    const toggleTagSelection = (tagName) => {
        const newSelectedTags = selectedTags.includes(tagName)
            ? selectedTags.filter(t => t !== tagName)
            : [...selectedTags, tagName];
    
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
                                        availableTags.map((tagObj, index) => (
                                            <CommandItem
                                                key={index}
                                                onSelect={() => toggleTagSelection(tagObj.name)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4 flex-shrink-0",
                                                        selectedTags.includes(tagObj.name) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{tagObj.name}</span>
                                                    <span className="text-xs text-muted-foreground">{tagObj.description}</span>
                                                </div>
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


// "use client";

// import React, { useState, useEffect, useMemo } from 'react';
// import { Check, ChevronsUpDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { cn } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
// import useTransformedRecordStore from '@/store/engStore';
// import EngChart from './EngChart';

// const EquipmentCard = ({ equipment, onTagsSelected = () => {}, dateRange = null }) => {
//     const [open, setOpen] = useState(false);
//     const [selectedTags, setSelectedTags] = useState([]);
//     const rawRecords = useTransformedRecordStore((state) => state.rawRecords);

//     console.log("Equipment Card - Raw Records:", rawRecords);
//     console.log("Equipment Card - Equipment:", equipment);
    


//     useEffect(() => {
//         setSelectedTags([]);
//     }, [equipment]);

//     // When dateRange changes, ensure we're using the updated filtered records
//     useEffect(() => {
//         console.log("Date range changed in EquipmentCard:", dateRange);
//     }, [dateRange]);

//     // Use filtered records if date range is provided, otherwise use all records
//     const recordsToUse = rawRecords;

//     console.log("Records to use:", recordsToUse);
    

//     // Get the equipment record
//     const equipmentRecord = useMemo(() => {
//         if (!equipment || !recordsToUse || recordsToUse.length === 0) return null;
//         return recordsToUse.filter(record => record.TagName.includes(equipment));
//     }, [equipment, recordsToUse]);

//     console.log("Equipment Record:", equipmentRecord);
    

//     // Extract tag data in the format EngChart expects
//     const tagData = useMemo(() => {
//         if (!equipmentRecord) return [];
//         return equipmentRecord;
//     }, [equipmentRecord]);

//     console.log("Equipment Data for chart:", tagData);

//     const availableTags = useMemo(() => {
//         if (!rawRecords || rawRecords.length === 0 || !equipment) return [];
      
//         const allTags = new Set();
      
//         rawRecords
//           .filter(record =>
//             typeof record.TagName === 'string' &&
//             record.TagName.includes(equipment)
//           )
//           .forEach(record => {
//             allTags.add(record.TagName);
//           });
      
//         return Array.from(allTags).sort();
//       }, [rawRecords, equipment]);
      

//     console.log("Available Tags:", availableTags);

//     const toggleTagSelection = (tag) => {
//         const newSelectedTags = selectedTags.includes(tag)
//             ? selectedTags.filter(t => t !== tag)
//             : [...selectedTags, tag];
//         setSelectedTags(newSelectedTags);
//         onTagsSelected(equipment, newSelectedTags);
//     };

//     return (
//         <div className="mb-[5px] bg-[#f8f8f8] rounded-md border overflow-hidden relative">
//             <div className="sticky top-0 z-10">
//                 <div className="flex items-center justify-between px-4 py-[5px] border-b">
//                     <h2 className="text-[16px] font-semibold">{equipment}</h2>
//                     <Popover open={open} onOpenChange={setOpen}>
//                         <PopoverTrigger asChild>
//                             <Button 
//                                 variant="outline" 
//                                 className={cn(
//                                     "w-[250px] justify-between",
//                                     selectedTags?.length > 0 && "min-w-fit"
//                                 )} 
//                                 role="combobox" 
//                                 aria-expanded={open}
//                             >
//                                 {selectedTags.length > 0 ? (
//                                     selectedTags.length > 1 ? (
//                                         `${selectedTags.slice(0, 1).join(", ")} ...(${selectedTags.length - 1}+)`
//                                     ) : (
//                                         selectedTags.join(", ")
//                                     )
//                                 ) : (
//                                     "Select equipment tags"
//                                 )}
//                                 <ChevronsUpDown className="ml-2 h-4 w-4" />
//                             </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="min-w-fit p-0">
//                             <Command>
//                                 <CommandInput placeholder="Search tags..." />
//                                 <CommandList>
//                                     {availableTags.length > 0 ? (
//                                         availableTags.map((tag, index) => (
//                                             <CommandItem
//                                                 key={index}
//                                                 onSelect={() => toggleTagSelection(tag)}
//                                             >
//                                                 <Check
//                                                     className={cn(
//                                                         "mr-2 h-4 w-4",
//                                                         selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
//                                                     )}
//                                                 />
//                                                 {tag}
//                                             </CommandItem>
//                                         ))
//                                     ) : (
//                                         <CommandEmpty>No tags available</CommandEmpty>
//                                     )}
//                                 </CommandList>
//                             </Command>
//                         </PopoverContent>
//                     </Popover>
//                 </div>
//             </div>
//             <div className="p-[5px]">
                
//                 <div className={cn("py-[1rem] bg-slate-50 rounded-md ", selectedTags.length > 0 && "h-[18.5rem] 2xl:h-[37.5rem] overflow-y-scroll")}>
//                     <EngChart
//                         selectedTags={selectedTags} 
//                         equipmentData={tagData}
//                         dateRange={dateRange}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EquipmentCard;

// "use client";

// import React, { useState, useEffect, useMemo } from 'react';
// import { Check, ChevronsUpDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { cn } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
// import useTransformedRecordStore from '@/store/engStore';
// import EngChart from './EngChart';

// const EquipmentCard = ({ 
//   equipment, 
//   onTagsSelected = () => {},
//   dateRange = null,
//   filteredRecords = { tags: [] } // Allow passing filtered records directly
// }) => {
//     const [open, setOpen] = useState(false);
//     const [selectedTags, setSelectedTags] = useState([]);
//     const rawRecords = useTransformedRecordStore((state) => state.rawRecords);
    
//     // Use filtered records if provided, otherwise use raw records from store
//     const recordsToUse = useMemo(() => {
//       return filteredRecords?.tags?.length > 0 
//         ? filteredRecords.tags 
//         : rawRecords;
//     }, [filteredRecords, rawRecords]);

//     console.log(`Equipment Card (${equipment}) - Records to use:`, recordsToUse?.length || 0);

//     useEffect(() => {
//         setSelectedTags([]);
//     }, [equipment]);

//     // When dateRange changes, ensure we're using the updated filtered records
//     useEffect(() => {
//         console.log(`Date range changed in EquipmentCard (${equipment}):`, dateRange);
//     }, [dateRange, equipment]);

//     // Get the equipment record - make sure we account for different formats of equipment names
//     const equipmentRecord = useMemo(() => {
//         if (!equipment || !recordsToUse || recordsToUse.length === 0) return [];
        
//         // Transform equipment name to match format in tags (if needed)
//         const transformedEquipment = equipment.replace(/^(\d+)([A-Z]+)(\d+)$/, (_, num1, letters, num2) => {
//             return `${num1}-${letters.toLowerCase()}-${num2}`;
//         });
        
//         // Try different variations to find matching records
//         const matches = recordsToUse.filter(record => {
//             if (!record.TagName) return false;
            
//             const tagName = record.TagName.toLowerCase();
//             const equipName = equipment.toLowerCase();
//             const transformedName = transformedEquipment.toLowerCase();
            
//             return tagName.includes(equipName) || tagName.includes(transformedName);
//         });
        
//         return matches;
//     }, [equipment, recordsToUse]);

//     console.log(`Equipment Record (${equipment}):`, equipmentRecord?.length || 0);

//     // Extract tag data in the format EngChart expects
//     const tagData = useMemo(() => {
//         return equipmentRecord || [];
//     }, [equipmentRecord]);

//     console.log(`Equipment Data for chart (${equipment}):`, tagData?.length || 0);

//     // Get available tags for this equipment
//     const availableTags = useMemo(() => {
//         if (!recordsToUse || recordsToUse.length === 0 || !equipment) return [];
      
//         const transformedEquipment = equipment.replace(/^(\d+)([A-Z]+)(\d+)$/, (_, num1, letters, num2) => {
//             return `${num1}-${letters.toLowerCase()}-${num2}`;
//         });
        
//         const allTags = new Set();
        
//         recordsToUse
//           .filter(record => {
//             if (!record.TagName) return false;
            
//             const tagName = record.TagName.toLowerCase();
//             const equipName = equipment.toLowerCase();  
//             const transformedName = transformedEquipment.toLowerCase();
            
//             return tagName.includes(equipName) || tagName.includes(transformedName);
//           })
//           .forEach(record => {
//             if (record.TagName) {
//               allTags.add(record.TagName);
//             }
//           });
      
//         return Array.from(allTags).sort();
//     }, [recordsToUse, equipment]);

//     console.log(`Available Tags (${equipment}):`, availableTags);

//     const toggleTagSelection = (tag) => {
//         const newSelectedTags = selectedTags.includes(tag)
//             ? selectedTags.filter(t => t !== tag)
//             : [...selectedTags, tag];
//         setSelectedTags(newSelectedTags);
//         onTagsSelected(equipment, newSelectedTags);
//     };

//     return (
//         <div className="mb-[5px] bg-[#f8f8f8] rounded-md border overflow-hidden relative">
//             <div className="sticky top-0 z-10">
//                 <div className="flex items-center justify-between px-4 py-[5px] border-b">
//                     <h2 className="text-[16px] font-semibold">{equipment}</h2>
//                     <Popover open={open} onOpenChange={setOpen}>
//                         <PopoverTrigger asChild>
//                             <Button 
//                                 variant="outline" 
//                                 className={cn(
//                                     "w-[250px] justify-between",
//                                     selectedTags?.length > 0 && "min-w-fit"
//                                 )} 
//                                 role="combobox" 
//                                 aria-expanded={open}
//                                 disabled={availableTags.length === 0}
//                             >
//                                 {selectedTags.length > 0 ? (
//                                     selectedTags.length > 1 ? (
//                                         `${selectedTags.slice(0, 1).join(", ")} ...(${selectedTags.length - 1}+)`
//                                     ) : (
//                                         selectedTags.join(", ")
//                                     )
//                                 ) : (
//                                     availableTags.length === 0 
//                                       ? "No tags available" 
//                                       : "Select equipment tags"
//                                 )}
//                                 <ChevronsUpDown className="ml-2 h-4 w-4" />
//                             </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="min-w-fit p-0">
//                             <Command>
//                                 <CommandInput placeholder="Search tags..." />
//                                 <CommandList>
//                                     {availableTags.length > 0 ? (
//                                         availableTags.map((tag, index) => (
//                                             <CommandItem
//                                                 key={index}
//                                                 onSelect={() => toggleTagSelection(tag)}
//                                             >
//                                                 <Check
//                                                     className={cn(
//                                                         "mr-2 h-4 w-4",
//                                                         selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
//                                                     )}
//                                                 />
//                                                 {tag}
//                                             </CommandItem>
//                                         ))
//                                     ) : (
//                                         <CommandEmpty>No tags available</CommandEmpty>
//                                     )}
//                                 </CommandList>
//                             </Command>
//                         </PopoverContent>
//                     </Popover>
//                 </div>
//             </div>
//             <div className="p-[5px]">
                
//                 <div className={cn("py-[1rem] bg-slate-50 rounded-md ", selectedTags.length > 0 && "h-[18.5rem] 2xl:h-[37.5rem] overflow-y-scroll")}>
//                     <EngChart
//                         selectedTags={selectedTags} 
//                         equipmentData={tagData}
//                         dateRange={dateRange}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EquipmentCard;

