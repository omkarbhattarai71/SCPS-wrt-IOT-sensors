import React from "react";

const DashboardFooter = () => {
  const footerStyle = {
    background: "linear-gradient(90deg, #1e1e1e, #433d3dff)",
    color: "#bdbdbd",
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

export default DashboardFooter;
