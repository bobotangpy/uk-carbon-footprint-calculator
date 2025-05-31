"use client";

export default function Donate() {
  return (
    <div style={{ textAlign: "center", color: "#06414b" }}>
      <h3>Balance your carbon footprint today by donating to 9Trees!</h3>
      <h3>1 tonne per tree / £1 per 0.1 tonne</h3>
      <a
        href="https://www.9trees.org/checkout/donate?donatePageId=5e94451610408e119ceef349"
        target="_blank"
      >
        <h3 style={{ textDecoration: "underline" }}>
          Donate to support our environmental initiatives
        </h3>
      </a>
      <br />
      <h3>Or just round it up to buy one tree to cover multiple journeys!</h3>
      <a href="https://www.9trees.org/shop/one-tree" target="_blank">
        <h3 style={{ textDecoration: "underline" }}>Plant 1 Tree</h3>
      </a>
    </div>
  );
}
