import React from "react";
import { AUTH_COLORS } from "../../constants/authConstants";

const Footer = ({ variant = "default" }) => {
  const variants = {
    default: {
      background: "linear-gradient(90deg, #1e1e1e, #433d3dff)",
      color: "#bdbdbd",
      borderTop: "none",
    },
    aboutUs: {
      background: "linear-gradient(90deg, #1e1e1e, #2c2c2c)",
      color: AUTH_COLORS.text,
      borderTop: `1px solid ${AUTH_COLORS.primary}`,
    },
  };

  const footerStyle = {
    ...variants[variant],
    fontSize: "14px",
    textAlign: "center",
    padding: "15px",
    marginTop: "20px",
  };

  return (
    <footer style={footerStyle}>
      <p>© 2025 Smart Parking System | All Rights Reserved</p>
    </footer>
  );
};

export default Footer;
