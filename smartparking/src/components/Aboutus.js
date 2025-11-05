import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const teamMembers = [
  {
    name: "Omkar Bhattarai",
    institution: "Aalborg University",
    role: "Student ",
    img: "/images/om.jpg",
  },
  {
    name: "Sven Suneson",
    institution: "Aalborg University",
    role: "Student",
    img: "/images/sven.jpeg",
  },
  {
    name: "Matteo Clementin",
    institution: "Aalborg University",
    role: "Student",
    img: "/images/matteo.jpeg",
  },
  {
    name: "Kristian Brix Kjærsgaard Nielsen",
    institution: "Aalborg University",
    role: "Student",
    img: "/images/kristian.jpeg",
  },
  {
    name: "Mustafa Özger",
    institution: "Aalborg University",
    role: "Superviser",
    img: "/images/mustafa.jpg",
  },
];

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0d0d0d, #1f1f1f)",
        color: "white",
      }}
    >
      {/* Sticky Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(40, 40, 40, 0.9)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 30px",
          zIndex: 10,
          borderBottom: "1px solid #4FC3F7",
        }}
      >
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          style={{
            backgroundColor: "#4FC3F7",
            border: "none",
            color: "black",
            fontWeight: "600",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          ⬅ Back to Home
        </motion.button>

        <h2 style={{ color: "#4FC3F7", margin: 0, textAlign: "center"}}>About Us</h2>
      </header>

      {/* Team Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "25px",
          padding: "40px 20px",
          justifyItems: "center",
        }}
      >
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "15px",
              padding: "20px",
              textAlign: "center",
              width: "100%",
              maxWidth: "300px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <img
              src={member.img}
              alt={member.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "contain",
                objectPosition: "top",
                borderRadius: "100px",
                marginBottom: "15px",
              }}
            />
            <h4 style={{ color: "#4FC3F7" }}>{member.name}</h4>
            <p style={{ margin: "5px 0", fontSize: "14px", color: "#bdbdbd" }}>
              {member.institution}
            </p>
            <p
              style={{
                backgroundColor: "#4FC3F7",
                color: "black",
                display: "inline-block",
                padding: "5px 10px",
                borderRadius: "5px",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              {member.role}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "linear-gradient(90deg, #1e1e1e, #2c2c2c)",
          color: "#bdbdbd",
          fontSize: "14px",
          textAlign: "center",
          padding: "15px",
          borderTop: "1px solid #4FC3F7",
        }}
      >
        <p>© 2025 Smart Parking System | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default AboutUs;
