"use client"

import React, { useEffect } from "react";

export default function Ferry({ co2 }) {

  let avgSpeedKmh = 30;

  const calculateCO2 = (distKm, vehicleFerry, tripType) => {
    const paxQty = 1;
    const gCO2FootPax = co2.footPax;

    let gCO2Km;

    if (vehicleFerry === "with-vehicle") {
      const gCO2CarPax = co2.carPax;
      gCO2Km = gCO2CarPax + gCO2FootPax * (paxQty - 1);
    } else {
      gCO2Km = gCO2FootPax * paxQty;
    }

    let grCO2Person = Math.floor(distKm * gCO2Km);

    if (tripType === "round-trip") {
      grCO2Person *= 2;
    }

    return grCO2Person;
  };

  const calculateCO2FromDuration = (
    durationInMinutes,
    vehicleFerry,
    tripType
  ) => {
    const distKm = estimateDistanceFromDuration(durationInMinutes);
    return calculateCO2(distKm, vehicleFerry, tripType);
  };

  const estimateDistanceFromDuration = (durationInMinutes) => {
    const distKm = Math.floor((durationInMinutes * avgSpeedKmh) / 60);
    return distKm;
  };

  // Example usage
  const emissions = calculateCO2FromDuration(360, "with-vehicle", "round-trip");

  return (
    // duration in minutes
    // with vehicle on ferry or not
    // trip type
    <div>
      <h1>CO2 Emissions: {emissions}</h1>
    </div>
  );
}
