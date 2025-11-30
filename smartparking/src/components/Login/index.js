import React, { useState } from "react";
import BackgroundWrapper from "../Auth/BackgroundWrapper";
import AuthCard from "../Auth/AuthCard";
import AuthInput from "../Auth/AuthInput";
import AuthButton from "../Auth/AuthButton";
import GoogleLoginButton from "../Auth/GoogleLoginButton";
import AuthLink from "../Auth/AuthLink";
import { useLogin } from "../../hooks/useLogin";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    handleLogin,
    handleGoogleLogin,
  } = useLogin();
  const { loading } = useAuth();

  return (
    <BackgroundWrapper>
      <AuthCard title="Login">
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
          className="form-control mb-3"
        />

        <AuthButton onClick={() => handleLogin(email, password)} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </AuthButton>

        <GoogleLoginButton onClick={handleGoogleLogin} loading={loading} />

        <AuthLink to="/signup" text="Don't have an account?" linkText="Signup" />
      </AuthCard>
    </BackgroundWrapper>
  );
};

export default Login;
