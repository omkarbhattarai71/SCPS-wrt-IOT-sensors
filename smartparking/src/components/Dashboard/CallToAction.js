import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../constants/parkingConstants";

const CallToAction = ({ token }) => {
  const navigate = useNavigate();

  const containerStyle = {
    backgroundColor: COLORS.darkOverlay,
    padding: "30px",
    borderRadius: "10px",
    color: "white",
    textAlign: "center",
    marginTop: "20px",
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
  };

  const primaryButtonStyle = {
    backgroundColor: COLORS.primary,
    border: "none",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const secondaryButtonStyle = {
    backgroundColor: "transparent",
    border: `1px solid ${COLORS.primary}`,
    color: COLORS.primary,
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={containerStyle}
    >
      {token ? (
        <>
          <h3>Welcome to Smart Parking System</h3>
          <p>
            You can now see the available parking slots and predictions with ease. 
            Enjoy the site developed by the team <h4>MOSK</h4>
          </p>
          <div style={buttonContainerStyle}>
            <button onClick={() => navigate("/about")} style={primaryButtonStyle}>
              Wanna view the team?
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>Smart Parking System</h3>
          <p>
            Login to access real-time parking spot information and predictions
          </p>
          <div style={buttonContainerStyle}>
            <button onClick={() => navigate("/login")} style={primaryButtonStyle}>
              Login
            </button>
            <button onClick={() => navigate("/signup")} style={secondaryButtonStyle}>
              Sign Up
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default CallToAction;
