import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "../common/Header";
import ParkingMap from "./ParkingMap";
import Footer from "../common/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, setToken } = useAuth();

  const handleLogout = () => {
    setToken(null);
    navigate("/");
  };


  const containerStyle = {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
  };

  const backgroundStyle = {
    backgroundImage: 'url("/images/bg-dashboard.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    zIndex: -1,
    opacity: 0.7,
  };

  return (
    <div style={containerStyle}>
      <Header token={token} onLogout={handleLogout} />

      <div style={backgroundStyle}></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">

          <ParkingMap token={token} spots={[]}/>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Dashboard;
