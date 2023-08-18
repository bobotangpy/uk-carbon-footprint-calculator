"use client";
import ReactLoading from "react-loading";

export default function Loading() {
  return (
    <div className="loading">
      <ReactLoading
        type="bubbles"
        color={"#ffffff"}
        style={{
          width: "50px",
          height: "50px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <style>
        {`
          .loading {
            position: fixed;
            z-index: 1300;
            inset: 0px;
            background-color: rgba(250, 250, 250, 0.3);
            -webkit-tap-highlight-color: transparent;
          }
        `}
      </style>
    </div>
  );
}
