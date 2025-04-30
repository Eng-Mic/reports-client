"use client"

import React, { useEffect, useState } from 'react'
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
 

const routesReport = [
  {
    value: "/process",
    label: "Processing Report",
  },
  {
    value: "/eng",
    label: "Engineering Report",
  }
]

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  useEffect(() => {
    // Set the value based on the current route
    const currentRoute = routesReport.find((route) => route.value === pathname);
    if (currentRoute) {
      setValue(currentRoute.value);
    }
  }, [pathname]);

  return (
    <div className="relative">
    
        <nav className='w-full flex items-center justify-between pt-[1rem] pb-[10px] mb-[1rem] bg-[#fbfbfb] border-b-[1px] border-zinc-300 z-20'>
          <div className="flex items-center gap-x-[1rem]">
            <Link href="/">
              <h2>
                MML Reports.
              </h2>
            </Link>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  {value
                    ? routesReport.find((route) => route.value === value)?.label
                    : "Select report..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search report..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No route reports found.</CommandEmpty>
                    <CommandGroup>
                      {routesReport.map((route) => (
                        <CommandItem
                          key={route.value}
                          value={route.value}
                          onSelect={(currentValue) => {
                            if (currentValue !== value) {
                              setValue(currentValue);
                              router.push(currentValue); // Navigate to selected route
                            }
                            setOpen(false)
                          }}
                        >
                          {route.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === route.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </nav>
    </div>
  )
}

export default Navigation