import React from "react";
import BackgroundWrapper from "../Auth/BackgroundWrapper";
import AuthCard from "../Auth/AuthCard";
import AuthInput from "../Auth/AuthInput";
import AuthButton from "../Auth/AuthButton";
import GoogleLoginButton from "../Auth/GoogleLoginButton";
import AuthLink from "../Auth/AuthLink";
import { useLogin } from "../../hooks/useLogin";

const Login = ({ setToken }) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
    handleGoogleLogin,
  } = useLogin(setToken);

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

        <AuthButton onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </AuthButton>

        <GoogleLoginButton onClick={handleGoogleLogin} loading={loading} />

        <AuthLink to="/signup" text="Don't have an account?" linkText="Signup" />
      </AuthCard>
    </BackgroundWrapper>
  );
};

export default Login;
