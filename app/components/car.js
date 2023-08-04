"use client";

import React, { useEffect, useState } from "react";
import govData from "@/app/libs/gov_uk.json";

export default function Car() {
  const [busCO2, setBusCO2] = useState(null);

  const [dist, setDist] = useState();
  const [trip, setTrip] = useState();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let data = await govData;
    const co2 = data.gCO2.bus;
    setBusCO2(co2);
  };

  const calculateCO2 = (dist, trip) => {
    if (!busCO2) {
      return null; // Handle the case when data is not yet loaded
    }

    const gCO2Km = busCO2.coach;
    const grCO2Person = dist * gCO2Km;

    if (trip === "round-trip") {
      return Math.floor(grCO2Person * 2);
    }

    return Math.floor(grCO2Person);
  };

  const updateDist = (e) => {
    setDist(e.target.value);
  };

  const updateTrip = (e) => {
    setTrip(e.target.value);
  };

  const handleSubmit = () => {
    console.log(dist, trip);

    let r = calculateCO2(dist, trip);
    console.log({ r });
  };

  return (
    <div>
      <input
        placeholder="Distance in km"
        onChange={(e) => updateDist(e)}
      />
      <input
        placeholder="Single or Round trip"
        onChange={(e) => updateTrip(e)}
      />

      <button onClick={() => handleSubmit()}>Submit</button>
    </div>
  );
}
