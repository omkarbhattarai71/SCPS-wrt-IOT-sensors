import { useState } from "react";
import { motion } from "framer-motion";
import { auth } from "../Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("user");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (loginType === "admin") {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/login/`, {
          email,
          password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userType", "admin");
        setToken(res.data.token);

      }
      console.log("Login attempt started with email:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Firebase auth successfull:", userCredential.user);
      const idToken = await userCredential.user.getIdToken();

      console.log("Firebase ID token obtained:", idToken);

      setToken(idToken);
      alert("Logged in successfully!");

      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
      console.error("Login Error:", error);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/login/`,
        {
          token: idToken,
        }
      );

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      alert("Logged in successfully with Google!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Login Error:", error);
      alert(error.message);
    }
  };

  const GoogleIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      <div
        style={{
          backgroundImage: 'url("/images/background.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          opacity: 0.7,
        }}
      ></div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
          <div
            className="card p-4"
            style={{ maxWidth: "400px", width: "100%" }}
          >
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

            <div className="text-center mt-3">
              <p>or, login with</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-light border d-flex align-items-center justify-content-center mx-auto"
                style={{
                  gap: "8px",
                  width: "80%",
                  maxWidth: "250px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                onClick={handleGoogleLogin}
              >
                <GoogleIcon />
                {/* <FaGoogle size={15} color="#DB4437" />
                <span className="fw-medium text-secondary">Google</span> */}
              </motion.button>
            </div>

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
    </div>
  );
};

export default Login;
