import React, { useState } from "react";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      const res = await axios.post("http://localhost:8000/api/login/", {
        token: idToken,
      });
      setToken(res.data.token);
      alert("Logged in successfully!");
    } catch (error) {
      alert(error.message);
      console.error("Login Error:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="card p-4" style={{ maxWidth: "400px", width: "100%" }}>
          <h2 className="text-center mb-3">Login</h2>
          <input
            className="form-control mb-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <motion.button
            className="btn btn-primary w-100 mb-2"
            whileHover={{ scale: 1.05 }}
            onClick={handleLogin}
          >
            Login
          </motion.button>
          <p className="text-center mt-3">
            Don't have an account?{" "}
            <motion.span
              style={{
                color: "#0d6efd",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate("/signup")}
            >
              Signup
            </motion.span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;

