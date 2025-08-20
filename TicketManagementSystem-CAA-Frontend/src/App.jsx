import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SplashScreen } from "./Components/SplashScreen";
import { Login } from "./Components/Login";
import { SignUp } from "./Components/SignUp";
// import { Contact } from "./Components/Contact"; // Use named import
// import { FeedBack } from "./Components/FeedBack";
import DashboardMain from "./Components/Dashboard/DashboardMain";
import Test from "./Components/Test";
import MainDashboard from "./Components/AdminDashboard/MainDashboard";
import NormalMainDashboard from "./Components/NormalAdminDashboard/NormalMainDashboard";

function App() {
  return (
    // main routes
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/test" element={<Test />} />

        {/* <Route path="/contact" element={<Contact />} /> */}
        {/* <Route path="/feedback" element={<FeedBack />} /> */}
        {/* /dashboard/* ka mtlb /dashboard may jitne bhi sub routes hon wo bhi render hon agr /* ye nhi lagata aage to sub routes kaam nhi krte */}
        <Route path="/dashboard/*" element={<DashboardMain />} />
        <Route path="/admin/*" element={<MainDashboard />} />
        <Route path="/normal-admin/*" element={<NormalMainDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
