"use client";

import React, { useState } from "react";
import carbonIntensityData from "@/app/libs/ci_by_source.json";
import electricityMixesData from "@/app/libs/electricity_mixes.json";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

export default function Train() {
  const [carbonIntensity, setCarbonIntensity] = useState(null);
  const [electricityMixes, setElectricityMixesData] = useState(null);
  const [emission, setEmission] = useState();

  const [hideDurationErr, setHideDurationErr] = useState(true);
  const [hideTripErr, setHideTripErr] = useState(true);
  const [hideVehicleErr, setHideVehicleErr] = useState(true);

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
  // const emissions = calculateCO2(200, "electric", "DE", "round-trip");

  return (
    // distKm
    // trainEnergy type 
    // where do they take the train 
    // tripType
    <div className="flexCol">
      <Box
        component="form"
        sx={{
          "& > :not(style)": { m: 1, width: "25ch" },
        }}
        noValidate
        autoComplete="off"
        className="spacing"
      >
        <TextField
          id="outlined-basic"
          label="Duration in minutes"
          variant="outlined"
          onChange={(e) => updateDuration(e)}
        />
      </Box>
      <p className="error" hidden={hideDurationErr}>
        Please enter the duration of the journey.
      </p>

      <FormControl className="spacing">
        <RadioGroup
          aria-labelledby="vehicle-radio-buttons-group-label"
          name="controlled-radio-buttons-group"
          value={vehicle}
          onChange={updateVehicle}
        >
          <FormControlLabel
            value="with-vehicle"
            control={<Radio />}
            label="with vehicle"
          />
          <FormControlLabel
            value="on-foot"
            control={<Radio />}
            label="On foot"
          />
        </RadioGroup>

        <p className="error" hidden={hideVehicleErr}>
          Please select one option.
        </p>
      </FormControl>

      <FormControl className="spacing">
        <FormLabel id="trip-radio-buttons-group-label">Trip</FormLabel>
        <RadioGroup
          aria-labelledby="trip-radio-buttons-group-label"
          name="controlled-radio-buttons-group"
          value={trip}
          onChange={updateTrip}
        >
          <FormControlLabel
            value="single-trip"
            control={<Radio />}
            label="Single-trip"
          />
          <FormControlLabel
            value="round-trip"
            control={<Radio />}
            label="Round-trip"
          />
        </RadioGroup>

        <p className="error" hidden={hideTripErr}>
          Please select trip type.
        </p>
      </FormControl>

      <Button
        className="btn spacing"
        variant="contained"
        onClick={() => handleSubmit()}
      >
        Submit
      </Button>

      {emission && (
        <div className="resContainer flexCol spacing">
          <h3>CO2 equivalent emission of your ride:</h3>
          <h3>{emission} grams</h3>
        </div>
      )}
    </div>
  );
}
