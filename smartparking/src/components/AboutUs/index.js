import React from "react";
import { TEAM_MEMBERS, AUTH_COLORS } from "../../constants/authConstants";
import AboutUsHeader from "./AboutUsHeader";
import AboutUsFooter from "./AboutUsFooter";
import TeamGrid from "./TeamGrid";

const AboutUs = () => {
  const containerStyle = {
    minHeight: "100vh",
    background: AUTH_COLORS.gradient,
    color: AUTH_COLORS.white,
  };

  return (
    <div style={containerStyle}>
      <AboutUsHeader />
      <TeamGrid teamMembers={TEAM_MEMBERS} />
      <AboutUsFooter />
    </div>
  );
};

export default AboutUs;
