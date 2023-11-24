import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../assets/images/logo/logo2.png"
import "../assets/css/Navbar.css";

function Navbar1() {
  return (
    <div className="navbar-container">
      {/* <div className="logo">Wathare InfoTech Solutions</div> */}
      <img src={logoImage} alt="Logo" style={{ height: "40px", width: "140px" }} />
      <ul className="nav-links">
        <li className="nav-link">
          <Link to="/">Home</Link>
        </li>
        <li className="nav-link">
          <Link to="/dashboard">Dashboard</Link>
        </li>
        
        {/* Add more navigation links as needed */}
      </ul>
    </div>
  );
}

export default Navbar1;
