"use client"

import React from 'react'
import { CircleHelp, UserRound } from "lucide-react"
import Link from 'next/link'


const Navigation = () => {
  return (
    <div className="relative">
    
        <nav className='w-full flex items-center justify-between pt-[1rem] pb-[10px] mb-[3rem] bg-[#fbfbfb] border-b-[1px] border-zinc-300 lg:mb-[1rem]'>
          <Link href="/">
            <h2>
              MML Reports.
            </h2>
          </Link>
          <div className="flex items-center gap-x-[1rem]">
            <button className='bg-zinc-200 p-[8px] rounded-[5px] flex items-center justify-center'>
              <UserRound className='w-[1.1rem] h-[1.1rem]' />
            </button>
            <button className='bg-zinc-200 p-[8px] rounded-[5px] flex items-center justify-center'>
              <CircleHelp className='w-[1.1rem] h-[1.1rem]' />
            </button>
          </div>
        </nav>
    </div>
  )
}

export default Navigation