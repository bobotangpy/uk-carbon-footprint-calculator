"use client";

export default function PlantTrees({ num }) {
  return (
    <div style={{ textAlign: "center", color: "#06414b" }}>
      <h3>
        Balance your carbon footprint today by planting trees with 9Trees!
      </h3>
      <a href="https://www.9trees.org/shop/one-tree" target="_blank">
        <h3 style={{ textDecoration: "underline" }}>
          Plant <span style={{ fontSize: "24px" }}>{num} </span>
          <span>{num > 1 ? "trees" : "tree"}</span> to balance the carbon
          footprint of this ride.
        </h3>
      </a>
    </div>
  );
}
