import React from "react";

const AuthInput = ({ type = "text", placeholder, value, onChange, ...props }) => {
  return (
    <input
      className="form-control mb-2"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

export default AuthInput;
