"use client"

const { default: Navigation } = require("./_components/Navigation")


const AdminLayout = ({ children }) => {
    return (
        <div className='w-full min-h-screen flex'>
            <main className='w-[90%]  mx-auto relative lg:w-[90%] 2xl:max-w-screen-2xl'>
                <div className="pt-[1.5rem] sticky top-0 bg-[#fbfbfb] z-20">
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