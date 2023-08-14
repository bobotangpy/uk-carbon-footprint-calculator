"use client";

import React, { useState } from "react";
import carbonIntensityData from "@/app/libs/ci_by_source.json";
import electricityMixesData from "@/app/libs/electricity_mixes.json";

export default function Train() {
  const [carbonIntensity, setCarbonIntensity] = useState(null);
  const [electricityMixes, setElectricityMixesData] = useState(null);

  let grCo2Diesel = 74; // source = https://www.railplus.com.au/pdfs/ATOC-rail-is-greener-report.pdf
  let electricConsumption = 0.108; // kWh / pkm for electric trains. Source: https://www.railplus.com.au/pdfs/ATOC-rail-is-greener-report.pdf

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let ciData = await carbonIntensityData;
    setCarbonIntensity(ciData);

    let emData = await electricityMixesData;
    setElectricityMixesData(emData);
  };

  const calculateCO2 = (distKm, trainEnergy, trainCountry, tripType) => {
    let grCo2;

    if (trainEnergy === "electric") {
      grCo2 = electricRailEmissions(trainCountry);
    } else {
      grCo2 = grCo2Diesel;
    }

    let grCo2Person = Math.floor(grCo2 * distKm);

    if (tripType === "round-trip") {
      grCo2Person *= 2;
    }

    return grCo2Person;
  };

  // Return gr CO2 / pkm for electric trains depending on the country
  const electricRailEmissions = (countryCode) => {
    let gCo2PerKWh;

    if (countryCode === "DE") {
      // gCO2_per_kWh = 230 #2019 #https://www.deutschebahn.com/resource/blob/5029910/5bdee6f2cac4fc869ad491d141539be9/Integrierter-Bericht-2019-data.pdf

      gCo2PerKWh = calculateCiInGrid("deutsche-bahn");
    } else if (countryCode === "AT") {
      // gCO2_per_kWh = 59 # See https://docs.google.com/spreadsheets/d/1gxMfqTNyyo8oJEU3__MqZ68T97Hl0466mDHsCTvGbE0
      gCo2PerKWh = calculateCiInGrid("oebb");
    } else {
      // Spain is 80% electric and 20% diesel: https://www.renfe.com/es/es/grupo-renfe/transporte-sostenible/eficiencia-energetica.html
      gCo2PerKWh = ciInCountry(countryCode);
    }

    const carbonEmissions = electricConsumption * gCo2PerKWh;

    return carbonEmissions;
  };

  const calculateCiInGrid = (gridName) => {
    const eMix = electricityMixPerc(gridName);
    const ciBySourceDict = carbonIntensity["energySource"];

    let ciGrid = 0;

    for (const [energySource, percent] of Object.entries(eMix)) {
      const ciThisSource = ciBySourceDict[energySource] * (percent / 100);
      ciGrid += ciThisSource;
    }

    return ciGrid;
  };

  const electricityMixPerc = (gridName) => {
    let e_grids = electricityMixes["electricityGrid"];
    let this_grid =
      e_grids.find((item) => item["gridOwner"] === gridName) || null;
    let e_mix = this_grid["electricityMix"];

    return e_mix;
  };

  // Example usage
  const emissions = calculateCO2(200, "electric", "DE", "round-trip");

  return (
    // distKm
    // trainEnergy type 
    // where do they take the train 
    // tripType
    <div>
      <h1>CO2 Emissions: {emissions}</h1>
    </div>
  );
}
