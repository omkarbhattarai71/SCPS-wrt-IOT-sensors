import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../constants/parkingConstants";
import { AUTH_COLORS } from "../../constants/authConstants";

const Header = ({ variant = "dashboard", token, onLogout, isCityOperator, onGoToDashboard, onRequestOperator, checkingRole, onBrowseParking, operatorRequestStatus }) => {
  const navigate = useNavigate();

  const variants = {
    dashboard: {
      backgroundColor: COLORS.dark,
      borderBottom: "none",
      primaryColor: COLORS.primary,
      dangerColor: COLORS.danger,
      blackColor: "black",
    },
    aboutUs: {
      backgroundColor: AUTH_COLORS.dark,
      borderBottom: `1px solid ${AUTH_COLORS.primary}`,
      primaryColor: AUTH_COLORS.primary,
      dangerColor: AUTH_COLORS.danger,
      blackColor: AUTH_COLORS.black,
    },
  };

  const currentVariant = variants[variant];

  const headerStyle = {
    position: "sticky",
    top: 0,
    backgroundColor: currentVariant.backgroundColor,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: variant === "aboutUs" ? "15px 30px" : "10px 20px",
    zIndex: 10,
    borderBottom: currentVariant.borderBottom,
  };

  const titleStyle = {
    color: currentVariant.primaryColor,
    margin: 0,
    textAlign: variant === "aboutUs" ? "center" : "left",
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
    fontWeight: "600",
  };

  const aboutButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "transparent",
    border: `1px solid ${currentVariant.primaryColor}`,
    color: currentVariant.primaryColor,
  };

  const loginButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: currentVariant.primaryColor,
    color: currentVariant.blackColor,
  };

  const logoutButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: currentVariant.dangerColor,
    color: "white",
  };

  const dashboardButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: currentVariant.primaryColor,
    color: currentVariant.blackColor,
  };

  const requestOperatorButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "transparent",
    border: `1px solid ${currentVariant.primaryColor}`,
    color: currentVariant.primaryColor,
  };

  const browseParkingButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "transparent",
    border: `1px solid ${currentVariant.primaryColor}`,
    color: currentVariant.primaryColor,
  };

  const backButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: currentVariant.primaryColor,
    color: currentVariant.blackColor,
  };

  if (variant === "aboutUs") {
    return (
      <header style={headerStyle}>
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          style={backButtonStyle}
        >
          ⬅ Back to Home
        </motion.button>

        <h2 style={titleStyle}>About Us</h2>
      </header>
    );
  }

  return (
    <header style={headerStyle}>
      <a href="/" style={{ textDecoration: "none" }}>
        <h2 style={titleStyle}>Smart Parking Dashboard</h2>
      </a>
      <nav style={navStyle}>
        <button style={aboutButtonStyle} onClick={() => navigate("/about")}>
          About Us
        </button>

        {onBrowseParking && (
          <button style={browseParkingButtonStyle} onClick={onBrowseParking}>
            <i className="bi bi-search me-1"></i>
            Browse Parking
          </button>
        )}

        {token && !checkingRole && (
          isCityOperator ? (
            onGoToDashboard && (
              <button style={dashboardButtonStyle} onClick={onGoToDashboard}>
                <i className="bi bi-speedometer2 me-1"></i>
                Dashboard
              </button>
            )
          ) : (
            onRequestOperator && (
              <button 
                style={requestOperatorButtonStyle} 
                onClick={onRequestOperator}
                disabled={operatorRequestStatus === 'pending'}
              >
                <i className="bi bi-person-badge me-1"></i>
                {operatorRequestStatus === 'pending' 
                  ? 'Request Pending' 
                  : operatorRequestStatus === 'rejected'
                  ? 'Resubmit Request'
                  : 'Request Operator'}
              </button>
            )
          )
        )}

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

export default Header;
