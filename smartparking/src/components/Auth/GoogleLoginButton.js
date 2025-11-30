import React from "react";
import AuthButton from "./AuthButton";
import GoogleIcon from "./GoogleIcon";

const GoogleLoginButton = ({ onClick, loading }) => {
  return (
    <div className="text-center mt-3">
      <p>or, login with</p>
      <AuthButton
        className="btn btn-light border d-flex align-items-center justify-content-center mx-auto"
        style={{
          gap: "8px",
          width: "80%",
          maxWidth: "250px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
        onClick={onClick}
        disabled={loading}
      >
        <GoogleIcon />
        <span className="fw-medium text-secondary">
          {loading ? "Signing in..." : "Google"}
        </span>
      </AuthButton>
    </div>
  );
};

export default GoogleLoginButton;
