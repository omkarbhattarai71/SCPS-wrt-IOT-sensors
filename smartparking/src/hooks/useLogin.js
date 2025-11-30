import { useState } from "react";
import { auth } from "../Firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useLogin = (setToken) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      if (loginType === "admin") {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/login/`, {
          email,
          password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userType", "admin");
        setToken(res.data.token);
      }

      console.log("Login attempt started with email:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase auth successful:", userCredential.user);
      const idToken = await userCredential.user.getIdToken();

      console.log("Firebase ID token obtained:", idToken);

      setToken(idToken);
      alert("Logged in successfully!");
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = await credential.idToken;

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/login/`, {
        token: idToken,
      });

      localStorage.setItem("token", res.data.idToken);
      setToken(res.data.idToken);
      alert("Logged in successfully with Google!");
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.message || "Google login failed. Please try again.";
      setError(errorMessage);
      console.error("Google Login Error:", err);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loginType,
    setLoginType,
    loading,
    error,
    handleLogin,
    handleGoogleLogin,
  };
};
