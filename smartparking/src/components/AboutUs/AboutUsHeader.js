import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AUTH_COLORS } from "../../constants/authConstants";

const AboutUsHeader = () => {
  const navigate = useNavigate();

  const headerStyle = {
    position: "sticky",
    top: 0,
    backgroundColor: AUTH_COLORS.dark,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    zIndex: 10,
    borderBottom: `1px solid ${AUTH_COLORS.primary}`,
  };

  const buttonStyle = {
    backgroundColor: AUTH_COLORS.primary,
    border: "none",
    color: AUTH_COLORS.black,
    fontWeight: "600",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const titleStyle = {
    color: AUTH_COLORS.primary,
    margin: 0,
    textAlign: "center",
  };

  return (
    <header style={headerStyle}>
      <motion.button
        onClick={() => navigate("/")}
        whileHover={{ scale: 1.05 }}
        style={buttonStyle}
      >
        ⬅ Back to Home
      </motion.button>

      <h2 style={titleStyle}>About Us</h2>
    </header>
  );
};

export default AboutUsHeader;
