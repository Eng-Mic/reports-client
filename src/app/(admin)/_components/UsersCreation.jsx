"use client"

import { Eye, EyeOff, UserRoundPen, UserRoundPlus } from 'lucide-react'
import React, { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import UsersList from './UsersList'
import { useRegisterUser } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { useUpdateUser } from '@/hooks/useUsers'

const UsersCreation = ({ closeActiveContent }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
    });

    const [editMode, setEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    // Function to toggle visibility of password
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const { mutate: registerUser, isPending: isRegisterPending } = useRegisterUser();
    const updateUser = useUpdateUser(editingUserId);

    const isPending = isRegisterPending || updateUser.isPending;

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editMode) {
            const updateData = { ...formData };
            if (!updateData.password) {
                delete updateData.password;
            }
            
            // Validate fields excluding password for edit mode
            if (!updateData.name || !updateData.email || !updateData.role) {
                return toast.error("Name, email and role are required fields");
            }
            
            // Update user
            updateUser.mutate(updateData, {
                onSuccess: () => {
                    toast.error(`User ${formData.name} has been updated successfully.`);
                    resetForm();
                },
                onError: (error) => {
                    toast.error("Failed to update user");
                }
            });
        } else {
            // Validate all fields for creating new user
            if (!formData.name || !formData.email || !formData.password || !formData.role) {
                return toast.error("All fields are required");
            }
            
            // Create new user
            registerUser(formData, {
                onSuccess: () => {
                    toast.error(`User ${formData.name} has been created successfully.`);
                    resetForm();
                },
                onError: (error) => {
                    toast.error("Failed to create user");
                }
            });
        }
    };

    const handleEditUser = (user) => {
        setEditMode(true);
        setEditingUserId(user._id);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: user.password || '',
            role: user.role || '',
        });
        
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: '',
        });
        setEditMode(false);
        setEditingUserId(null);
    };
  return (
    <div className='w-full min-h-full flex gap-[1rem]  bg-[#fbfbfb] p-[3rem] rounded-[3px] relative z-20'>
        <div className="w-[30%]">
            <div className="border-b-[1px] border-zinc-300 pb-[10px] mb-[10px]">
                {editMode ? (
                    <h2 className='flex items-center gap-x-[10px] text-[1.1rem] font-bold'>
                        <UserRoundPen className='w-[1.1rem] h-[1.1rem]' />
                        Edit User
                    </h2>
                ) : (
                    <h2 className='flex items-center gap-x-[10px] text-[1.15rem] font-bold'>
                        <UserRoundPlus className='w-[1.1rem] h-[1.1rem]' />
                        Users Creation
                    </h2>
                )}
                <p className='w-[20rem] text-[10px] text-gray-500 leading-relaxed text-base my-[5px]'>
                    {editMode ? 'Update user information.' : 'Create new users and assign them roles.'}
                </p>
            </div>
            <form onSubmit={handleSubmit} action="" className='w-full flex flex-col gap-y-[1rem] mt-[1.5rem]'>
                <label htmlFor="" className='flex flex-col text-[13px] font-medium gap-y-[8px]'>
                    <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">
                        Fullname
                    </span>
                    <input
                        type="text"
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        placeholder='John Doe'
                        className='border-[1px] rounded-[5px] py-[6px] px-[10px] text-[12px] placeholder:text-zinc-600'
                    />
                </label>
                <label htmlFor="" className='flex flex-col text-[13px] font-medium gap-y-[8px]'>
                    <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">
                        Email Address
                    </span>
                    <input
                        type="email"
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        placeholder='your@gmail.com'
                        className='border-[1px] rounded-[5px] py-[6px] px-[10px] text-[12px] placeholder:text-zinc-600'
                    />
                </label>
                <label htmlFor="" className='flex flex-col text-[13px] font-medium gap-y-[8px] relative'>
                    <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">
                        Password
                    </span>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        value={formData.password}
                        onChange={handleChange}
                        placeholder='************'
                        className='border-[1px] rounded-[5px] py-[9px] px-[10px] text-[11.8px] bg-transparent placeholder:text-zinc-600 md:py-[7px]'
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className='absolute bottom-[10px] right-[1rem] flex items-center px-2 lg:right-0'
                    >
                        {showPassword ?
                            <Eye className='w-[1rem] h-[1rem] text-zinc-600 lg:text-sm' /> :
                            <EyeOff className='w-[1rem] h-[1rem] text-zinc-600 lg:text-sm' />
                        }
                    </button>
                </label>
                <label htmlFor="" className='flex flex-col text-[13px] font-medium gap-y-[8px]'>
                    <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">
                        Assign Role
                    </span>
                    <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {["Admin", "User", "Manager"].map((role) => (
                                    <SelectItem key={role} value={role.toLowerCase()} className="capitalize">
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </label>
                <div className="flex gap-2 mt-[1rem]">
                    <div className={`${editMode ? 'bg-zinc-800 hover:bg-zinc-900' : 'bg-zinc-800 hover:bg-zinc-900'} text-white rounded-[5px] transition ease-in-out duration-300 flex-1`}>
                        <button type="submit" className='w-[100%] py-[9px] text-[12.5px] md:py-[7px]' disabled={isPending}>
                            {isPending 
                                ? (editMode ? 'Updating...' : 'Creating...') 
                                : (editMode ? 'Update User' : 'Create User')}
                        </button>
                    </div>
                    {editMode && (
                        <div className="bg-gray-200 text-gray-800 rounded-[5px] transition ease-in-out duration-300 hover:bg-gray-300">
                            <button 
                                type="button" 
                                onClick={resetForm} 
                                className='w-[100%] py-[9px] text-[12.5px] md:py-[7px] px-4'
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
        
        {/* Separator */}
        <div className="hidden w-[1px] min-h-[25rem] bg-zinc-300 lg:flex" />
        {/* Separator */}

        <div className="w-full">
            <UsersList onEditUser={handleEditUser} />
        </div>

        <button 
            onClick={() => closeActiveContent(0)}
            className='text-[12px] font-medium absolute top-[1rem] right-[1rem] bg-zinc-200 py-[6px] px-[8px] rounded-[3px] flex items-center justify-center'
        >
            close
        </button>
    </div>
  )
}

export default UsersCreation