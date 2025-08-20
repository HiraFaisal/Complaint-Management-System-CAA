import React from "react";
import { Link } from "react-router-dom";
import "../assets/SplashScreen.css";
export const SplashScreen = () => {
  return (
    <div>
      <div className="heading">
        <div className="buttons">
          <Link to="/login" className="login-btn">
            {" "}
            Login
          </Link>
          <Link to="/signup" className="signup-btn">
            {" "}
            SignUp
          </Link>
        </div>
      </div>
      <div className="container1">
        <div className="image" />
      </div>
    </div>
  );
};
