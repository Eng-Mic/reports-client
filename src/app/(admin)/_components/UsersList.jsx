"use client"

import { useDeleteUser, useGetUsers } from '@/hooks/useUsers'
import { cn } from '@/lib/utils'
import { UserRoundPen, UserRoundX, Users } from 'lucide-react'
import React, { use, useState } from 'react'
import toast from 'react-hot-toast'

const UsersList = ({ onEditUser }) => {
  const { data: users = [], isLoading, isError } = useGetUsers();
  const deleteUser = useDeleteUser();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (user) => {
    onEditUser(user);
  };

  const handleDeleteClick = (user) => {
    deleteUser.mutate(user?._id, {
      onSuccess: () => {
          toast.error(`User ${user.name} has been deleted successfully.`);
      },
      onError: (error) => {
          toast.error("Failed to delete user");
      }
    });
  }
  return (
    <div>
      <div className="border-b-[1px] border-zinc-300 pb-[10px] mb-[10px]">
        <h2 className='text-[1.15rem] font-bold text-center text-gray-800 flex items-center gap-x-[5px]'>
          <Users className='w-[1.1rem] h-[1.1rem]' />
          Users List
        </h2>
        <p className='w-[20rem] text-[10px] text-gray-500 leading-relaxed text-base my-[5px]'>
          List of all users in the system.
        </p>
      </div>
      <div className="w-full flex flex-col gap-y-[1rem] mt-[1.5rem]">
        <label htmlFor="" className='flex flex-col text-[13px] font-medium gap-y-[8px]'>
          <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">
            Search User
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search by name or email'
            className='border-[1px] rounded-[5px] py-[6px] px-[10px] text-[12px] placeholder:text-zinc-600'
          />
        </label>
      </div>
      <div className="">
        <div className="grid grid-cols-3 gap-x-[10px] mt-[1.5rem]">
          {['fullname', 'email', 'role'].map((head, index) => (
              <div key={index} className="border-b-[1.5px] pb-[10px] mb-[10px] px-[5px] border-zinc-700">
                  <h2 className='text-[14px] tracking-tighter capitalize'>
                      {head}
                  </h2>
              </div>
          ))}
        </div>
        <div className="">
          {isLoading ? (
            <p className="text-[13px] text-gray-600 mt-2">Loading users...</p>
          ) : isError ? (
            <p className="text-[13px] text-red-600 mt-2">Failed to load users.</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-[13px] text-gray-500 mt-2">No users found.</p>
          ) : (
            <div className="overflow-y-scroll h-[15rem]">
              {filteredUsers.map((user) => (
                <div className="group/campaign grid grid-cols-3 gap-x-[1.5rem] border-b-[1px] border-zinc-400 font-medium text-[14px] py-[15px] px-[5px] rounded-[3px] hover:bg-zinc-50 transition-all ease-in-out duration-300 last:border-0 relative" key={user?._id}>
                  <div className="line-clamp-1">
                      {user?.name}
                  </div>
                  <div className="line-clamp-1">
                      {user?.email}
                  </div>
                  <div className="">
                    {user?.role}
                  </div>
                  <div className="flex items-center gap-x-[10px] px-[15px] text-[1rem] h-full absolute top-0 right-0 bg-gradient-to-r from-zinc-50 to-zinc-100 opacity-0 group-hover/campaign:opacity-100 transition">
                      <UserRoundPen
                        onClick={() => handleEditClick(user)}
                        className='w-[1rem] h-[1rem] cursor-pointer' 
                      />
                      <UserRoundX 
                        onClick={() => handleDeleteClick(user)}
                        className='w-[1rem] h-[1rem] cursor-pointer' 
                      />
                  </div>
                </div>
              ))}
              </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UsersList