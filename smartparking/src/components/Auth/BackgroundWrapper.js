import React from "react";
import { BACKGROUND_IMAGE } from "../../constants/authConstants";

const BackgroundWrapper = ({ children }) => {
  const backgroundStyle = {
    backgroundImage: `url("${BACKGROUND_IMAGE}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
    opacity: 0.7,
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <div style={backgroundStyle}></div>
      {children}
    </div>
  );
};

export default BackgroundWrapper;
