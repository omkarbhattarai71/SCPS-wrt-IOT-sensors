import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AuthLink = ({ to, text, linkText }) => {
  const navigate = useNavigate();

  return (
    <p className="text-center mt-3">
      {text}{" "}
      <motion.span
        style={{
          color: "#0d6efd",
          cursor: "pointer",
          fontWeight: "bold",
        }}
        whileHover={{ scale: 1.1 }}
        onClick={() => navigate(to)}
      >
        {linkText}
      </motion.span>
    </p>
  );
};

export default AuthLink;
