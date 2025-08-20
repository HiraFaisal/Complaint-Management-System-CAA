import React from "react";
import { Route, Routes } from "react-router-dom";


import Header from "../Dashboard/Header";
import LeftSidebar from "../Dashboard/LeftSidebar";
import Dashboard from "./Dashboard";
import ComplainTable from './ComplainTable'; // Adjust the path based on your project structure
import AdminTicketPage from "./AdminTicketPage";



const MainDashboard = () => {
  return (
    <>
      <div className="grid grid-cols-12 bg-body-light ">
        <div className="col-span-3 flex justify-center items-start m-4">
          {" "}
          <LeftSidebar />
        </div>

        <div className="col-span-9">
          {" "}
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

export default MainDashboard;
