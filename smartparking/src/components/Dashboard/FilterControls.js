import React from "react";
import { FILTER_OPTIONS } from "../../constants/parkingConstants";

const FilterControls = ({ searchId, setSearchId, filter, setFilter }) => {
  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  };

  return (
    <>
      <input
        className="form-control mb-2 mt-4"
        placeholder="Search Spot ID"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        style={inputStyle}
      />

      <select
        className="form-control mb-2"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={inputStyle}
      >
        {FILTER_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
};

export default FilterControls;
