import React from "react";
import { motion } from "framer-motion";

const AuthButton = ({ onClick, children, className = "btn btn-primary w-100", ...props }) => {
  return (
    <motion.button
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AuthButton;
