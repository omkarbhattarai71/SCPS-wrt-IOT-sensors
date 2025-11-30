import React from "react";
import { motion } from "framer-motion";

const AuthCard = ({ children, title }) => {
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
          {title && <h2 className="text-center mb-3">{title}</h2>}
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default AuthCard;
