import React from "react";
import "../assets/css/HomePage.css";
import { Link } from "react-router-dom";
import backgroundImage from "../assets/images/utilityDemo/factory-cnc-machines1.jpg";

const HomePage: React.FC = () => {
  const containerStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
  };

  return (
    <div className="home-page-container" style={containerStyle}>
      <h1 className="heading">Welcome to MachineWise Monitor & Improve</h1>
      <h2 className="subheading">Where design meets functionality</h2>
    
      <Link to="/ulogin">
        <button>Get Started</button>
      </Link>
    </div>
  );
};

export default HomePage;
