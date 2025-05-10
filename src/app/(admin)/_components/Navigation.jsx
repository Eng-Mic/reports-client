"use client"

import React, { use, useEffect, useState } from 'react'
import { Check, ChevronsUpDown, CircleHelp, LogOut, Settings, User, UserRound, UserRoundPen, UserRoundPlus, Users } from "lucide-react"
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
import UsersCreation from './UsersCreation'
import { useLogoutUser } from '@/hooks/useAuth'
import useAuthStore from '@/store/authStore'
 

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

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isModal, setIsModal] = useState(false);
  const [activeContent, setActiveContent] = useState(0);

  const { user, logout } = useAuthStore();
  const { mutate: logoutUser, isLoading } = useLogoutUser();

  const handleLogout = () => {
    logoutUser(undefined, {
      onSuccess: () => {
        logout();
        setLoggingOut(false);
        router.push('/'); 
        toast.success("Logout successful.");
      },
      onError: () => {
        setLoggingOut(false);
        toast.error("Logout failed. Please try again.");
      }
    });
  }

  useEffect(() => {
    // Set the value based on the current route
    const currentRoute = routesReport.find((route) => route.value === pathname);
    if (currentRoute) {
      setValue(currentRoute.value);
    }
  }, [pathname]);

  const renderSettingsContent = () => {
    switch (activeContent) {
        case 1:
            return (
                <UsersCreation closeActiveContent={setActiveContent} />
            );
        case 2:
            return (
                <Profile />
            );
        default:
            return null;
    }
  };
  return (
    <div className="relative">
      {isModal || activeContent ? (
            <div
                onClick={() => {
                  setIsModal(false);
                  setActiveContent(0);
                    // setIsMenuOpened(false)
                }}
                className = "fixed inset-0 bg-black opacity-40 z-30"
            />
        ) : null}
        <nav className='w-full flex items-center justify-between pt-[1rem] pb-[10px] mb-[1rem] bg-[#fbfbfb] border-b-[1px] border-zinc-300 z-30'>
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
          <div className="flex items-center gap-x-[1rem]">
            <div className='bg-zinc-200 py-[8px] px-[10px] rounded-[5px] flex items-center justify-center'>
              <UserRound className='w-[1.1rem] h-[1.1rem]' />
              <p className='text-[11px] text-gray-600 ml-[5px]'>
                {user?.email}
              </p>
            </div>
            <div className='bg-zinc-200 p-[8px] rounded-[5px] flex items-center justify-center'>
              <CircleHelp className='w-[1.1rem] h-[1.1rem]' />
            </div>
            <div 
              onClick={() => setIsModal(!isModal)}
              className="hidden relative flex-col items-center justify-center cursor-pointer h-[3rem] z-20 md:flex"
            >
              <div className='bg-zinc-200 p-[8px] rounded-[5px] flex items-center justify-center'>
                <Settings className='w-[1.1rem] h-[1.1rem]' />
              </div>
            </div>
          </div>
          {isModal && (
            <div className="bg-zinc-50 w-[16rem] absolute top-[4.5rem] right-0 p-[1rem] rounded-[5px] z-30">
                <section className='flex items-center gap-x-[10px] border-b-[1px] border-zinc-300 pb-[10px] mb-[10px]'>
                    <User className='text-[1.5rem]' />
                    <div>
                        <p className='text-[13px] font-medium flex items-center gap-x-[5px]'>
                            {user?.name}
                        </p>
                        <p className='text-[10px]'>
                            {user?.email}
                        </p>
                    </div>
                </section>

                <div className="cursor-pointer">
                  <button
                    onClick={() => {
                      setActiveContent(1);
                      setIsModal(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 text-[12.5px] capitalize text-zinc-600 font-medium",
                      activeContent === 1 ? "bg-zinc-200" : ""
                    )}
                  >
                      <p className='flex items-center gap-2 text-[12.5px] capitalize text-zinc-600 font-medium'>
                          <UserRoundPlus className='w-[1.05rem] h-[1.05rem]' />
                          User Creation
                      </p>
                  </button>
                  <section className='my-[15px]'>
                      <p className='flex items-center gap-2 text-[12.5px] capitalize text-zinc-600 font-medium'>
                        <UserRoundPen className='w-[1.05rem] h-[1.05rem]' />
                        Profile
                      </p>
                  </section>
                </div>
                {/* Logout */}
                <div 
                  role='button'
                  onClick={handleLogout}
                  className='w-full flex items-center justify-center gap-x-[10px] bg-zinc-800 text-white text-[11px] py-[6px] rounded-[4px] mt-[1.1rem] cursor-pointer z-50'
                >
                  {isLoading ? (
                    <p>Logging out...</p>
                  ) : (
                    <>
                      <LogOut className='w-[1.1rem] h-[1.1rem]' />
                      <p>Logout</p>
                    </>
                  )}
                </div>
            </div>
          )}
        </nav>

          <div className="z-30 w-full mx-auto absolute top-[4.5rem] left-0 right-0 flex items-center justify-center">
            { renderSettingsContent() }
          </div>
    </div>
  )
}

export default Navigation