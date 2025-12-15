import React, { useState } from "react";
import BackgroundWrapper from "../Auth/BackgroundWrapper";
import AuthCard from "../Auth/AuthCard";
import AuthInput from "../Auth/AuthInput";
import AuthButton from "../Auth/AuthButton";
import { auth } from "../../Firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const handleReset = async () => {
    if (!email) {
      showError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showSuccess("Password reset email sent. Check your inbox.");
      navigate("/login");
    } catch (err) {
      const msg = err.message || "Failed to send reset email.";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      <AuthCard title="Reset Password">
        <p className="text-muted">Enter your account email to receive reset instructions.</p>

        <AuthInput
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthButton onClick={handleReset} disabled={loading}>
          {loading ? "Sending..." : "Send reset email"}
        </AuthButton>

        <p className="text-center mt-3">
          Remembered?{" "}
          <span style={{ color: "#0d6efd", cursor: "pointer", fontWeight: "bold" }} onClick={() => navigate("/login")}>
            Back to Login
          </span>
        </p>
      </AuthCard>
    </BackgroundWrapper>
  );
};

export default ForgotPassword;