import React, { useEffect } from "react";
import Header from "./Header";
import { useState } from "react";
import LeftSidebar from "./LeftSidebar";
// import RightSidebar from "./RightSidebar";
import ContactUs from "./ContactUs";
import { FeedBack } from "./FeedBack";
import { Route, Routes, useLocation } from "react-router-dom";
import Complaint from "./Complaint";
import ComplainTable from "./ComplainTable";
import NewComplaint from "./NewComplaint";
import AccountDetails from "./AccountDetails";
import TicketPage from "./TicketPage";


const DashboardMain = () => {
  const Location = useLocation();

  useEffect(() => {
    if (Location.pathname.includes("/dashboard")) {
      document.body.classList.add("bg-body-light");
    }
  }, []);
  //here i globally define a state we can use it in any component
  // variable             setter function        initial value
  const [selectedStatus, setSelectedStatus] = useState("TotalComplaints");
  return (
    <div className="grid grid-cols-12 bg-body-light ">
      <div className="col-span-3 flex justify-center items-start m-4">
        {" "}
        <LeftSidebar />
      </div>
      {/* <PopupDashboard />  */}
      <div className="col-span-9">
        {" "}
        <Header />
        {/* iska naam kch or rakhna hoga */}
        {/* sub routes */}
        <Routes>
          {/* tumhe srf dashbaord pr dikhana to srf / lagado */}
          {/* <Route path="/" element={<RightSidebar />} /> */}
          <Route
            path="/"
            //i am passing setter method of selectedStatus state in props of complaint component (props defined in complaint component)
            element={<Complaint setSelectedStatus={setSelectedStatus} />}
          />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/feedback" element={<FeedBack />} />
          <Route
            path="/complaint"
            element={
              <ComplainTable
                //props call
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
              />
            }
          />
          <Route path="/new-complaint" element={<NewComplaint />} />
          <Route path="/account" element={<AccountDetails />} />
          <Route path="/ticketpage" element={<TicketPage />} />
          {/* <Route path="/complaint/:tId" element={<TicketPage />} /> */}
          {/* <Route path="/contact" element={<DashboardContact />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default DashboardMain;
