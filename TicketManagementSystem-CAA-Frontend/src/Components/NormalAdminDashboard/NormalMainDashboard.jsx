import React from "react";
import { Route, Routes, Link } from "react-router-dom";

import Header from "../Dashboard/Header";
import Dashboard from "./Dashboard";
import ComplainTable from './ComplainTable'; // Adjust the path based on your project structure
import AdminTicketPage from "./AdminTicketPage";


const Sidebar = () => {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 h-full rounded-r-lg shadow-lg">
      <div className="flex items-center justify-center mb-6">
        <a href="" className="w-24 h-12 flex items-center justify-center">
          <img
            src="/images/logo.png"
            alt="logo"
            className="max-w-full max-h-full"
          />
        </a>
      </div>
      <ul className="space-y-2">
        <li>
          <Link
            to="/normal-admin"
            className="flex items-center gap-3 p-3 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            {/* Replace with relevant SVG or icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-5">
              {/* SVG path here */}
            </svg>
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            to="/normal-admin/complaint-table"
            className="flex items-center gap-3 p-3 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            {/* Replace with relevant SVG or icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-5">
              {/* SVG path here */}
            </svg>
            <span>Complaint Table</span>
          </Link>
        </li>
        {/* <li>
          <Link
            to="/AdminTicketPage"
            className="flex items-center gap-3 p-3 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            {/* Replace with relevant SVG or icon */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-5">
              SVG path here */}
            {/*</svg>
            <span>Admin Ticket Page</span>
          </Link>
        </li> */}
        
      </ul>
      <div className="mt-auto flex justify-center">
        <a
          href="../login"
          className="flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold leading-none bg-gray-200 dark:bg-gray-800 rounded-lg px-4 py-2 mt-6 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <span className="mr-2">Logout</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6.66645 15.3328C6.66645 15.5096 6.59621 15.6792 6.47119 15.8042C6.34617 15.9292 6.17661 15.9995 5.9998 15.9995H1.33329C0.979679 15.9995 0.640552 15.859 0.390511 15.609C0.140471 15.3589 0 15.0198 0 14.6662V1.33329C0 0.979679 0.140471 0.640552 0.390511 0.390511C0.640552 0.140471 0.979679 0 1.33329 0H5.9998C6.17661 0 6.34617 0.0702357 6.47119 0.195256C6.59621 0.320276 6.66645 0.48984 6.66645 0.666645C6.66645 0.84345 6.59621 1.01301 6.47119 1.13803C6.34617 1.26305 6.17661 1.33329 5.9998 1.33329H1.33329V14.6662H5.9998C6.17661 14.6662 6.34617 14.7364 6.47119 14.8614C6.59621 14.9865 6.66645 15.156 6.66645 15.3328ZM15.8045 8.47139L12.4713 11.8046C12.378 11.898 12.2592 11.9615 12.1298 11.9873C12.0004 12.0131 11.8663 11.9999 11.7444 11.9494C11.6225 11.8989 11.5184 11.8133 11.4451 11.7036C11.3719 11.5939 11.3329 11.4649 11.333 11.333V8.66638H5.9998C5.823 8.66638 5.65343 8.59615 5.52841 8.47113C5.40339 8.34611 5.33316 8.17654 5.33316 7.99974C5.33316 7.82293 5.40339 7.65337 5.52841 7.52835C5.65343 7.40333 5.823 7.33309 5.9998 7.33309H11.333V4.66651C11.3329 4.53459 11.3719 4.4056 11.4451 4.29587C11.5184 4.18615 11.6225 4.10062 11.7444 4.05012C11.8663 3.99962 12.0004 3.98642 12.1298 4.01218C12.2592 4.03795 12.378 4.10152 12.4713 4.19486L15.8045 7.52809C15.8665 7.59 15.9156 7.66352 15.9492 7.74445C15.9827 7.82538 16 7.91213 16 7.99974C16 8.08735 15.9827 8.17409 15.9492 8.25502C15.9156 8.33595 15.8665 8.40948 15.8045 8.47139ZM14.3879 7.99974L12.6663 6.27563V9.72385L14.3879 7.99974Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

const NormalMainDashboard = () => {
  return (
    <>
      <div className="grid grid-cols-12 bg-body-light ">
        <div className="col-span-3 flex justify-center items-start m-4">
          <Sidebar />
        </div>

        <div className="col-span-9">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/complaint-table" element={<ComplainTable />} />
            <Route path="/AdminTicketPage" element={<AdminTicketPage />} />
          
          </Routes>
        </div>
      </div>
    </>
  );
};

export default NormalMainDashboard;
