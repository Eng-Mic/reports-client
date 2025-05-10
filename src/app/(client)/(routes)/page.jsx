"use client";

import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Auth from '../_components/Auth';
import useAuthStore from '@/store/authStore';

const reports = [
  {
    id: 1,
    slug: "/process",
    name: "Processing",
    description: "Hourly report of the processing plant",
  },
  {
    id: 2,
    slug: "/eng",
    name: "Engineering",
    description: "Assets | Equipment Performance",
  }
];

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Home = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);

  const { isAuthenticated, user } = useAuthStore()

  const handleReportClick = (report) => {
    if (selectedReport === report.id) {
      setSelectedReport(null);
      router.push('/');
    } else {
      setSelectedReport(report.id);
      setNavLoading(true);
      router.push(report.slug);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000); // Show page loader for 1 second

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const currentRoute = reports.find((route) => route.slug === pathname);
    setSelectedReport(currentRoute?.id ?? null);
    setNavLoading(false);
  }, [pathname]);

  if (pageLoading) {
    return <Loader />;
  }

  return (
    <div className='w-full h-full mx-auto flex flex-col  relative lg:w-[70%] lg:justify-center'>
      {navLoading && <Loader />}

      {!isAuthenticated && !user ? (
          <div
              // onClick={() => {
              //   setIsAuth(!isAuth);
              // }}
              className = "fixed inset-0 bg-black opacity-40 z-30"
          />
      ) : null}
      
      <div className="w-full flex flex-col items-center justify-between gap-[3rem] lg:flex-row">

        {/* Left side */}
        <div className="w-full">
          <h2 className='text-2xl font-bold mb-4'>
            Marampa Mines Reports
          </h2>
          <p className="text-gray-600 leading-relaxed text-base">
            Access critical operational reports to drive smarter decisions, enhance productivity, and maintain operational excellence across all departments.
          </p>
        </div>

        {/* Separator */}
        <div className="hidden w-[2px] min-h-[25rem] bg-zinc-300 lg:flex" />

        {/* Right side */}
        <div className="w-full">
          <p className="text-gray-600 leading-relaxed text-base mb-[1.5rem]">
            Select a report from the list to view detailed operational insights and monitor plant performance effectively.
          </p>
          <div className="w-full">
            {reports.map((report) => (
              <div
                key={report.id}
                role="button"
                onClick={() => handleReportClick(report)}
                className={cn(
                  "flex items-center gap-x-[15px] p-4 cursor-pointer",
                  selectedReport === report.id
                    ? "border-[1px] border-sky-500 rounded-[5px]"
                    : "border-b border-gray-200"
                )}
              >
                <div className="w-[13px] h-[12.5px] rounded-full border border-slate-500 flex justify-center items-center sm:h-[20px] md:h-[13px]">
                  <div className={cn(
                    "w-[7px] h-[7px] bg-sky-700 rounded-full transition-transform",
                    selectedReport === report.id ? "scale-100" : "scale-0",
                    "sm:w-[12px] sm:h-[12px] md:w-[7px] md:h-[7px]"
                  )} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">{report.name}</h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {!isAuthenticated && !user ? (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Auth />
        </div>
      ) : null}
    </div>
  );
};

export default Home;
