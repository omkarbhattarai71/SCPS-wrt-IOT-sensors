import React from "react";
import { TEAM_MEMBERS, AUTH_COLORS } from "../../constants/authConstants";
import Header from "../common/Header";
import Footer from "../common/Footer";
import TeamGrid from "./TeamGrid";

const AboutUs = () => {
  const containerStyle = {
    minHeight: "100vh",
    background: AUTH_COLORS.gradient,
    color: AUTH_COLORS.white,
  };

  return (
    <div style={containerStyle}>
      <Header variant="aboutUs" />
      <TeamGrid teamMembers={TEAM_MEMBERS} />
      <Footer variant="aboutUs" />
    </div>
  );
};

export default AboutUs;
