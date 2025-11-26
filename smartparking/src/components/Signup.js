import { useState } from "react";
import { motion } from "framer-motion";
import { auth, db } from "../Firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [wantsOperator, setWantsOperator] = useState(false);
  const [contact, setContact] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    // Validation
    if(!email.trim()){
      alert("Email is required.");
      return;
    }
    if(!password.trim()){
      alert("Password is required.");
      return;
    }
    if(wantsOperator && !contact.trim()){
      alert("Please enter your contact number.");
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Authentication for firestore
      await userCred.user.getIdToken(true);
      const uid = userCred.user.uid;
      
      // Adding the display name [but optional]
      if(displayName){
        await updateProfile(userCred.user, {displayName});
      }

      // Store user doc in firestore
      await setDoc(doc(db, "users", uid), {
        email,
        displayName: displayName || null,
        role: "user",
        wantsCityOperator: wantsOperator,
        contact: wantsOperator ? contact : "",
        createdAt: serverTimestamp(),
      });
      alert("Signup Successfull! Please login.");
      navigate("/login");
    } catch (error) {
      alert(error.message);
      console.error("Signup Error:", error);
    }
  };

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
            <h2>Signup</h2>
            <input
              className="form-control mb-2"
              placeholder="Full Name(Optionl)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
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
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="applyOperator"
                checked={wantsOperator}
                onChange={(e) => setWantsOperator(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="applyOperator">
                Apply to become a City Operator
              </label>
            </div>
            {wantsOperator && (
              <>
                <input
                  className="form-control mb-2"
                  placeholder="Your contact number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
                <small className="text-muted d-block mb-2">
                  We will review your request and notify you once approved.
                </small>
              </>
            )}

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
    </div>
  );
};

export default Signup;

