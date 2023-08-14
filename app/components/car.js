import React, { useState } from "react";

export default function car({ co2 }) {
  let dieselWellToTank = 2.58 + 0.62; // kg CO2/l
  let petrolWellToTank = 2.3 + 0.5; // kg CO2/l

  const calculateCO2 = (
    distKm,
    fuelType,
    fuelConsumption,
    electricityConsumption,
    electricityCountryCode,
    paxInCar,
    tripType
  ) => {
    let grCO2Driving;

    if (fuelType === "electric") {
      const kWhPer100km = parseInt(electricityConsumption) / 0.83; // We consider a grid-to-battery conversion efficiency of 83%

      const gCO2PerKWh = ciInCountry(electricityCountryCode);

      grCO2Driving = Math.floor((kWhPer100km * gCO2PerKWh) / 100.0);
    } else if (fuelType === "diesel" || fuelType === "petrol") {
      const kgCO2PerLitre = {
        diesel: dieselWellToTank,
        petrol: petrolWellToTank,
      };

      grCO2Driving = Math.floor(
        kgCO2PerLitre[fuelType] * parseFloat(fuelConsumption) * 10.0
      );
    } else {
      console.log(
        "fuelType value is not valid. It must be one of the following: ['electric', 'diesel', 'petrol']"
      );
    }

    let grCO2Person = grCO2Driving * distKm;

    if (tripType === "round-trip") {
      grCO2Person *= 2;
    }

    if (parseInt(paxInCar) > 1) {
      grCO2Person =
        Math.floor(grCO2Person / paxInCar) + (grCO2Person % paxInCar > 0);
    }

    return grCO2Person;
  };

  const ciInCountry = (countryCode) => {
    // Implement method to fetch and return carbon intensity based on country code
  };

  // Example usage
  const emissions = calculateCO2(
    150,
    "diesel",
    6.5,
    20,
    "DE",
    2,
    "round-trip"
  );

  return (
    <div>
      <p>CO2 Emissions: {emissions}</p>
    </div>
  );
}
