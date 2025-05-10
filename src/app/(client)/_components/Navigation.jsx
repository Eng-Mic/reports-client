"use client"

import React, { useState } from 'react'
import { ChevronDown, CircleHelp, LogOut, UserRound } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'
import { useLogoutUser } from '@/hooks/useAuth'

const Navigation = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, logout } = useAuthStore();
  const { mutate: logoutUser, isLoading } = useLogoutUser();
  const router = useRouter();

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

  return (
    <div className="relative">
      {loggingOut && (
        <div
          onClick={() => setLoggingOut(false)}
          className="fixed inset-0 bg-black opacity-30 z-30"
        />
      )}

      <nav className="w-full flex items-center justify-between pt-[1rem] pb-[10px] mb-[3rem] bg-[#fbfbfb] border-b-[1px] border-zinc-300 lg:mb-[1rem]">
        <Link href="/">
          <h2 className="text-xl font-semibold text-zinc-800">
            MML Reports.
          </h2>
        </Link>

        <div className="flex items-center gap-x-[1rem]">
          <div className="bg-zinc-200 py-[8px] px-[10px] rounded-[5px] flex items-center justify-center gap-x-[5px] relative">
            <div className="flex items-center gap-x-[3px]">
              <UserRound className="w-[1.1rem] h-[1.1rem]" />
              <p className="text-[11px] text-gray-600 ml-[5px]">
                {user?.email}
              </p>
            </div>

            {user && (
              <div
                onClick={() => setLoggingOut(!loggingOut)}
                className="flex items-center justify-center cursor-pointer"
              >
                <ChevronDown className="w-[1rem] h-[1rem] text-zinc-600" />
              </div>
            )}

            {loggingOut && (
              <div 
                role='button'
                onClick={handleLogout}
                className='w-full absolute top-[1.3rem] flex items-center justify-center gap-x-[10px] bg-zinc-800 text-white text-[11px] py-[6px] rounded-[4px] mt-[1.1rem] cursor-pointer z-50'
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
            )}
          </div>

          <button className="bg-zinc-200 p-[8px] rounded-[5px] flex items-center justify-center">
            <CircleHelp className="w-[1.1rem] h-[1.1rem]" />
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Navigation
