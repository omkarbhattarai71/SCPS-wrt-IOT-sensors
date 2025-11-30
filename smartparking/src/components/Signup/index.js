import React, { useState } from "react";
import BackgroundWrapper from "../Auth/BackgroundWrapper";
import AuthCard from "../Auth/AuthCard";
import AuthInput from "../Auth/AuthInput";
import AuthButton from "../Auth/AuthButton";
import AuthLink from "../Auth/AuthLink";
import { useSignup } from "../../hooks/useSignup";
import { useAuth } from "../../context/AuthContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleSignup } = useSignup();
  const { loading } = useAuth();

  return (
    <BackgroundWrapper>
      <AuthCard title="Signup">
        <AuthInput
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <AuthButton
          className="btn btn-success"
          onClick={() => handleSignup(email, password)}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Signup"}
        </AuthButton>

        <AuthLink to="/login" text="Already have an account?" linkText="Login" />
      </AuthCard>
    </BackgroundWrapper>
  );
};

export default Signup;
