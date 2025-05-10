// "use client"

// import { Eye, EyeOff } from 'lucide-react';
// import React, { useState } from 'react'

// const Auth = () => {
//     const [showPassword, setShowPassword] = useState(false);

//     // Function to toggle visibility of password
//     const togglePasswordVisibility = () => {
//         setShowPassword(!showPassword);
//     };
//   return (
//     <div className='w-[20%] min-h-[10rem] flex flex-col items-center justify-center  bg-[#fbfbfb] p-[2rem] rounded-[3px] z-20'>
//         <h2 className='text-[1.3rem] font-bold text-center text-gray-800'>
//             MML- Reports
//         </h2>
//         <p className='w-[20rem] text-[11.5px] text-center text-gray-600 leading-relaxed text-base my-[5px]'>
//             Login to access reports
//         </p>
//         <form action="" className='w-full flex flex-col gap-y-[1rem] mt-[1.5rem]'>
//             <label htmlFor="" className='flex flex-col text-[13px] font-medium gap-y-[8px]'>
//                 <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">
//                     Email Address
//                 </span>
//                 <input
//                     type="email"
//                     placeholder='your@gmail.com'
//                     className='border-[1px] rounded-[5px] py-[6px] px-[10px] text-[12px] placeholder:text-zinc-600'
//                 />
//             </label>
//             <label htmlFor="" className='flex flex-col text-[13px] font-medium gap-y-[8px] relative'>
//                 <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">
//                     Password
//                 </span>
//                 <input
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder='************'
//                     className='border-[1px] rounded-[5px] py-[9px] px-[10px] text-[11.8px] bg-transparent placeholder:text-zinc-600 md:py-[7px]'
//                 />
//                 <button
//                     type="button"
//                     onClick={togglePasswordVisibility}
//                     className='absolute bottom-[10px] right-[1rem] flex items-center px-2 lg:right-0'
//                 >
//                     {showPassword ?
//                         <Eye className='w-[1rem] h-[1rem] text-zinc-600 lg:text-sm' /> :
//                         <EyeOff className='w-[1rem] h-[1rem] text-zinc-600 lg:text-sm' />
//                     }
//                 </button>
//             </label>
//             <div className="bg-zinc-800 text-white rounded-[5px] mt-[1rem] transition ease-in-out duration-300 hover:bg-zinc-900">
//                 <button className='w-[100%] py-[9px] text-[12.5px] md:py-[7px]'>
//                     Login
//                 </button>
//             </div>
//         </form>
//     </div>
//   )
// }

// export default Auth

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useLoginUser } from "@/hooks/useAuth";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const { mutate: loginUser, isLoading } = useLoginUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data) => {
    setAuthError(""); // Clear previous errors

    loginUser(data, {
      onError: (error) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Wrong Credentials";
        setAuthError(message);
      },
    });
  };

  return (
    <div className="w-[20%] min-h-[10rem] flex flex-col items-center justify-center bg-[#fbfbfb] p-[2rem] rounded-[3px] z-20">
      <h2 className="text-[1.3rem] font-bold text-center text-gray-800">
        MML- Reports
      </h2>
      <p className="w-[20rem] text-[10px] text-center text-gray-600 leading-relaxed text-base my-[5px]">
        Login to access reports
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-y-[1.5rem] mt-[1.5rem]">
        <label className="flex flex-col text-[13px] font-medium gap-y-[8px]">
          <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">
            Email Address
          </span>
          <input
            type="email"
            placeholder="your@gmail.com"
            className="border-[1px] rounded-[5px] py-[6px] px-[10px] text-[12px] placeholder:text-zinc-600 outline-none"
            {...register("email")}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </label>

        <label className="flex flex-col text-[13px] font-medium gap-y-[8px] relative">
          <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">
            Password
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="************"
            className="border-[1px] rounded-[5px] py-[9px] px-[10px] text-[11.8px] bg-transparent placeholder:text-zinc-600 md:py-[7px] outline-none"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute bottom-[10px] right-[1rem] flex items-center px-2 lg:right-0"
          >
            {showPassword ? (
              <Eye className="w-[0.9rem] h-[0.9rem] text-zinc-600 lg:text-sm" />
            ) : (
              <EyeOff className="w-[0.9rem] h-[0.9rem] text-zinc-600 lg:text-sm" />
            )}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs absolute bottom-[-1.2rem]">{errors.password.message}</p>
          )}
        </label>

        <div className="bg-zinc-800 text-white rounded-[5px] mt-[1rem] transition ease-in-out duration-300 hover:bg-zinc-900">
          <button type="submit" className="w-[100%] py-[9px] text-[12.5px] md:py-[7px]" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
        {authError && (
          <div className="w-full flex items-center justify-center bg-red-100 border border-red-400 text-red-700 py-[4px] rounded text-[10px]">
            {authError}
          </div>
        )}
      </form>
    </div>
  );
};

export default Auth;
