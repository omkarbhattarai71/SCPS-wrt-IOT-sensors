import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../constants/parkingConstants";
import { AUTH_COLORS } from "../../constants/authConstants";

const Header = ({
  variant = "dashboard",
  token,
  onLogout,
  isCityOperator,
  onGoToDashboard,
  onRequestOperator,
  checkingRole,
  onBrowseParking,
  operatorRequestStatus,
  onCancelOperator,
}) => {
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    // backgroundColor: currentVariant.backgroundColor,
    backgroundColor: "#38997aff",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 28px",
    zIndex: 50,
    borderBottom: currentVariant.borderBottom,
    backdropFilter: "blur(6px)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
  };

  const brandStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  };

  const logoStyle = {
    height: "32px",
    width: "32px",
    borderRadius: "6px",
    objectFit: "cover",
  };
  const titleStyle = {
    margin: 0,
    // color: currentVariant.primaryColor,
    color: "#495668ff",
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    cursor: "pointer",
    onhover: { color:"#5dda14ff", scale: 1.05 },
  };

  const navStyle = {  
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const buttonBaseStyle = {
    borderRadius: "10px",
    padding: "8px 18px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "15px",
    transition: "all 0.25s ease",
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
        <div style={brandStyle} onClick={() => navigate("/")}>
          <img src="/images/favicon.png" alt="logo" style={logoStyle} />
          <h2 style={titleStyle}>Smart Parking</h2>
        </div>
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

        {token &&
          !checkingRole &&
          (isCityOperator
            ? onGoToDashboard && (
                <button style={dashboardButtonStyle} onClick={onGoToDashboard}>
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </button>
              )
            : onRequestOperator && (
                <button
                  style={requestOperatorButtonStyle}
                  onClick={onRequestOperator}
                  disabled={operatorRequestStatus === "pending"}
                >
                  <i className="bi bi-person-badge me-1"></i>
                  {operatorRequestStatus === "pending"
                    ? "Request Pending"
                    : operatorRequestStatus === "rejected"
                    ? "Resubmit Request"
                    : "Request Operator"}
                </button>
              ))}

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
