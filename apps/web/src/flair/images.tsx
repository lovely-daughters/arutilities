import React from "react";
import "./images.css";

export function Images() {
  return (
    <React.Fragment>
      <img
        src="/images/Aru.png"
        className="ARU"
        style={{
          width: "33%",
          zIndex: 10,
          position: "absolute",
          bottom: -70,
          right: 0,
        }}
      ></img>

      <img
        src="/images/Kalpo.png"
        style={{
          width: "40%",
          zIndex: 9,
          position: "absolute",
          bottom: -450,
          right: -70,
        }}
      ></img>
      <img
        src="/images/Monty.png"
        style={{
          width: "50%",
          zIndex: 8,
          position: "absolute",
          top: -70,
          right: -120,
        }}
      ></img>

      <img
        src="/images/Lingers.png"
        style={{
          opacity: 0.15,
          width: "90%",
          zIndex: -1,
          position: "absolute",
          bottom: 0,
          left: 0,
        }}
      ></img>
    </React.Fragment>
  );
}
