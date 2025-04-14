import React from "react";
import "./styles/Common.css";

const MainHeaderText = (props) => {
    const classes = props.color === "white" ? "section-title text-white" : "section-title";
  return (
    
    <h2 className={classes}>
      <span className="red-bar"></span> {props.text}
    </h2>
  );
};

export default MainHeaderText;
