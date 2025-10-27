import React, { useState } from "react";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signed up successfully!");
    } catch (error) {
      alert(error.message);
      console.error("Signup Error:", error);
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
          <h2>Signup</h2>
          <input
            className="form-control mb-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="form-control mb-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <motion.button
            className="btn btn-success"
            whileHover={{ scale: 1.05 }}
            onClick={handleSignup}
          >
            Signup
          </motion.button>
          <p className="text-center mt-3">
            Already have an account?{" "}
            <motion.span
              style={{
                color: "#0d6efd",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate("/login")}
            >
              Login
            </motion.span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Signup;
