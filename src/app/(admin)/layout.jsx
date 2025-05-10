"use client"

import useAuthStore from "@/store/authStore"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const { default: Navigation } = require("./_components/Navigation")


const AdminLayout = ({ children }) => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // If not logged in or not an admin/manager, redirect
        if (!isAuthenticated || !user || !['admin', 'manager'].includes(user.role)) {
            router.push('/')
        }
    }, [user, isAuthenticated])

    if (!isAuthenticated || !user || !['admin', 'manager'].includes(user.role)) {
        return null // or show a loading spinner
    }

    return (
        <div className='w-full min-h-screen flex'>
            <main className='w-[90%]  mx-auto relative lg:w-[90%] 2xl:max-w-screen-2xl'>
                <div className="pt-[1.5rem] sticky top-0 bg-[#fbfbfb] z-30">
                    <Navigation />
                </div>
                <>
                    {children}
                </>
            </main>
        </div>
    )
}

export default AdminLayout