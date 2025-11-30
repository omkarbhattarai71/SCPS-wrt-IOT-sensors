import React from "react";
import { motion } from "framer-motion";
import { AUTH_COLORS } from "../../constants/authConstants";

const TeamMemberCard = ({ member }) => {
  const cardStyle = {
    backgroundColor: AUTH_COLORS.cardBg,
    borderRadius: "15px",
    padding: "20px",
    textAlign: "center",
    width: "100%",
    maxWidth: "300px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
  };

  const imageStyle = {
    width: "100%",
    height: "200px",
    objectFit: "contain",
    objectPosition: "top",
    borderRadius: "100px",
    marginBottom: "15px",
  };

  const nameStyle = {
    color: AUTH_COLORS.primary,
  };

  const institutionStyle = {
    margin: "5px 0",
    fontSize: "14px",
    color: AUTH_COLORS.text,
  };

  const roleStyle = {
    backgroundColor: AUTH_COLORS.primary,
    color: AUTH_COLORS.black,
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "5px",
    fontWeight: "500",
    fontSize: "14px",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      style={cardStyle}
    >
      <img src={member.img} alt={member.name} style={imageStyle} />
      <h4 style={nameStyle}>{member.name}</h4>
      <p style={institutionStyle}>{member.institution}</p>
      <p style={roleStyle}>{member.role}</p>
    </motion.div>
  );
};

export default TeamMemberCard;
