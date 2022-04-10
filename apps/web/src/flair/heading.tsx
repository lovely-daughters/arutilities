import React from "react";

export function Heading() {
  return (
    <React.Fragment>
      <h1
        style={{
          color: "orange",
          fontSize: "45px",
          margin: "5px 0 5px 0",
        }}
      >
        <span style={{ color: "#ff4f4b" }}>ArU</span>tilities
      </h1>
    </React.Fragment>
  );
  // return (
  //   <React.Fragment>
  //     {/*
  //     //@ts-ignore */}
  //     <marquee
  //       scrollamount="20"
  //       style={{
  //         color: "orange",
  //         fontSize: "45px",
  //       }}
  //     >
  //       <span style={{ color: "#ff4f4b" }}>ArU</span>tilities
  //       {/*
  //     //@ts-ignore */}
  //     </marquee>
  //   </React.Fragment>
  // )
}
