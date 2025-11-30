import React from "react";
import { AUTH_COLORS } from "../../constants/authConstants";

const AboutUsFooter = () => {
  const footerStyle = {
    background: "linear-gradient(90deg, #1e1e1e, #2c2c2c)",
    color: AUTH_COLORS.text,
    fontSize: "14px",
    textAlign: "center",
    padding: "15px",
    borderTop: `1px solid ${AUTH_COLORS.primary}`,
  };

  return (
    <footer style={footerStyle}>
      <p>© 2025 Smart Parking System | All Rights Reserved</p>
    </footer>
  );
};

export default AboutUsFooter;
