import React from "react";
import TeamMemberCard from "./TeamMemberCard";

const TeamGrid = ({ teamMembers }) => {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    padding: "40px 20px",
    justifyItems: "center",
  };

  return (
    <div style={gridStyle}>
      {teamMembers.map((member, index) => (
        <TeamMemberCard key={index} member={member} />
      ))}
    </div>
  );
};

export default TeamGrid;
