import React from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../constants/parkingConstants";

const DashboardHeader = ({ token, onLogout }) => {
  const navigate = useNavigate();

  const headerStyle = {
    position: "sticky",
    top: 0,
    backgroundColor: COLORS.dark,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    zIndex: 10,
  };

  const titleStyle = {
    color: COLORS.primary,
  };

  const navStyle = {
    display: "flex",
    gap: "15px",
  };

  const buttonBaseStyle = {
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const aboutButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "transparent",
    border: `1px solid ${COLORS.primary}`,
    color: COLORS.primary,
  };

  const loginButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: COLORS.primary,
    color: "black",
  };

  const logoutButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: COLORS.danger,
    color: "white",
  };

  return (
    <header style={headerStyle}>
      <a href="/" style={{ textDecoration: "none" }}>
        <h2 style={titleStyle}>Smart Parking Dashboard</h2>
      </a>
      <nav style={navStyle}>
        <button style={aboutButtonStyle} onClick={() => navigate("/about")}>
          About Us
        </button>

        {token ? (
          <button style={logoutButtonStyle} onClick={onLogout}>
            Logout
          </button>
        ) : (
          <button style={loginButtonStyle} onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </nav>
    </header>
  );
};

export default DashboardHeader;
