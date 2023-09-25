"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
// import Autocomplete from "@mui/material/Autocomplete";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import cars from "@/app/libs/cars.json";
import PlantTrees from "./plantTrees";
// import electricityEmissionFactors from "@/app/libs/electricity_emission_factors.json";

export default function Car({ co2 }) {
  // const [countryCodes, setCountryCodes] = useState();
  // const [ciCountryData, setCiCountryData] = useState();
  // const [fuelType, setFuelType] = useState();
  // const [fuelConsumption, setFuelConsumption] = useState();
  // const [electricityConsumption, setElectricityConsumption] = useState();
  // const [electricityCountryCode, setElectricityCountryCode] = useState();
  const [distKm, setDistKm] = useState();
  const [euroCarSegment, setEuroCarSegment] = useState("");
  const [engineType, setEngineType] = useState("");
  const [people, setPeople] = useState();
  const [trip, setTrip] = useState("single");
  const [emission, setEmission] = useState();
  const [ciData, setCiData] = useState();
  const [trees, setTrees] = useState(0);

  const [hideDistErr, setHideDistErr] = useState(true);
  const [hideSegmentErr, setHideSegmentErr] = useState(true);
  const [hideEngineErr, setHideEngineErr] = useState(true);
  const [hidePeopleErr, setHidePeopleErr] = useState(true);
  const [hideTripErr, setHideTripErr] = useState(true);

  // let dieselWellToTank = 2.58 + 0.62; // kg CO2/l
  // let petrolWellToTank = 2.3 + 0.5; // kg CO2/l

  let segmentCodes = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "J",
    "M",
    "S",
    "Don't know",
  ];
  let engines = [
    { name: "Diesel", value: "diesel" },
    { name: "Petrol", value: "petrol" },
    { name: "Plug-in Hybrid Electric", value: "plugInHybridElectric" },
    { name: "Battery Electric", value: "batteryElectric" },
    { name: "Hybrid", value: "hybrid" },
    { name: "LPG", value: "lpg" },
    { name: "CNG", value: "cng" },
    { name: "Don't know", value: "unknown" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const carsData = await cars;
    setCiData(carsData.footprints);

    // const ciInCountryData = await electricityEmissionFactors;
    // let keys = await Object.keys(ciInCountryData.factors);

    // setCountryCodes(keys);
    // setCiCountryData(ciInCountryData);
  };

  const updateDist = (e) => {
    setDistKm(e.target.value);
    setHideDistErr(true);
  };

  // const updateFuelType = (e) => {
  //   setFuelType(e.target.value);
  // };

  // const updateCountry = (e) => {
  //   setElectricityCountryCode(e.target.value);
  // };

  const updateSegment = (e) => {
    setEuroCarSegment(e.target.value);
    setHideSegmentErr(true);
  };

  const updateEngineType = (e) => {
    setEngineType(e.target.value);
    setHideEngineErr(true);
  };

  const updatePeople = (e) => {
    setPeople(e.target.value);
    setHidePeopleErr(true);
  };

  const updateTrip = (e) => {
    setTrip(e.target.value);
    setHideTripErr(true);
  };

  const handleSubmit = () => {
    if (!distKm) return setHideDistErr(false);
    if (!euroCarSegment) return setHideSegmentErr(false);
    if (!engineType) return setHideEngineErr(false);
    if (!people) return setHidePeopleErr(false);
    if (!trip) return setHideTripErr(false);

    calculateCO2(distKm, euroCarSegment, engineType, people, trip);
  };

  const calculateCO2 = (
    distKm,
    segmentCode,
    engineType,
    // fuelType,
    // fuelConsumption,
    // electricityConsumption,
    // electricityCountryCode,
    paxInCar,
    tripType
  ) => {
    let grCO2Driving = carbonIntensity(segmentCode, engineType);

    // if (fuelType === "electric") {
    //   const kWhPer100km = parseInt(electricityConsumption) / 0.83; // We consider a grid-to-battery conversion efficiency of 83%

    //   const gCO2PerKWh = ciInCountry(electricityCountryCode);

    //   grCO2Driving = Math.floor((kWhPer100km * gCO2PerKWh) / 100.0);
    // } else if (fuelType === "diesel" || fuelType === "petrol") {
    //   const kgCO2PerLitre = {
    //     diesel: dieselWellToTank,
    //     petrol: petrolWellToTank,
    //   };

    //   grCO2Driving = Math.floor(
    //     kgCO2PerLitre[fuelType] * parseFloat(fuelConsumption) * 10.0
    //   );
    // } else {
    //   console.log(
    //     "fuelType value is not valid. It must be one of the following: ['electric', 'diesel', 'petrol']"
    //   );
    // }

    let grCO2Person = grCO2Driving * distKm;

    if (tripType === "round-trip") {
      grCO2Person *= 2;
    }

    if (parseInt(paxInCar) > 1) {
      grCO2Person =
        Math.floor(grCO2Person / paxInCar) + (grCO2Person % paxInCar > 0);
    }
    console.log(grCO2Person);

    // setEmission(grCO2Person); // emission per person

    // Convert grCO2Person from grams to tonnes
    let rInTonnes = grCO2Person / 1e6; // 1e6 represents 1 million, which is the conversion factor from grams to tonnes

    if (rInTonnes <= 0.01) {
      setEmission(0.01);
    } else setEmission(rInTonnes.toFixed(2));

    if (grCO2Person <= 1e6) {
      setTrees(1);
    } else {
      Math.round(grCO2Person / 1e6);
    }
  };

  // look up carbon intensity for cars by Euro car segment and engine type
  const carbonIntensity = (euroCarSegment, engineType) => {
    if (euroCarSegment === "Don't know") euroCarSegment = null;
    if (engineType.length === "unknown") engineType = null;

    const entry = ciData.find(
      (d) => d.euroCarSegment == euroCarSegment && d.engineType == engineType
    );
    if (!entry) {
      return ciData[0].carbonIntensity;
      // throw new Error(`Unknown size or type ${euroCarSegment}_${engineType}`);
    }
    return entry.carbonIntensity;
  };

  // const ciInCountry = (countryCode) => {
  //   try {
  //     // Extract the carbon intensity factor for the given country code
  //     const ciFactor = ciCountryData.factors[countryCode].gCO2;
  //     return ciFactor;
  //   } catch (error) {
  //     console.error("countryCode not found. Taking average value instead");
  //     // Return the average value as a fallback
  //     return 295.8; // avg EU value
  //   }
  // };

  return (
    // distKm,
    // fuelType ['electric', 'diesel', 'petrol']
    // fuelConsumption,
    // electricityConsumption,
    // electricityCountryCode,
    // num of ppl in car
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
          label="Distance in km"
          variant="outlined"
          type="number"
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          onChange={(e) => updateDist(e)}
        />
      </Box>
      <p className="error" hidden={hideDistErr}>
        Please enter the distance of the journey.
      </p>

      <Box sx={{ minWidth: "25ch" }} className="spacing">
        <FormControl fullWidth>
          <InputLabel id="segment-simple-select-label">
            Euro Car Segment
          </InputLabel>
          <Select
            labelId="segment-simple-select-label"
            id="segment-simple-select"
            value={euroCarSegment}
            label="Euro Car Segment"
            onChange={updateSegment}
          >
            {segmentCodes.map((code, i) => {
              return (
                <MenuItem value={code} key={i}>
                  {code}
                </MenuItem>
              );
            })}
            {/* <MenuItem value={"electric"}>Diesel</MenuItem>
            <MenuItem value={"diesel"}>Electric</MenuItem>
            <MenuItem value={"petrol"}>Petrol</MenuItem> */}
          </Select>
        </FormControl>
      </Box>
      <p className="error" hidden={hideSegmentErr}>
        Please select the Euro Car Segment code.
      </p>

      <Box sx={{ minWidth: "25ch" }} className="spacing">
        <FormControl fullWidth>
          <InputLabel id="engine-simple-select-label">Engine Type</InputLabel>
          <Select
            labelId="engine-simple-select-label"
            id="engine-simple-select"
            value={engineType}
            label="Engine Type"
            onChange={updateEngineType}
          >
            {engines.map((engine, i) => {
              return (
                <MenuItem value={engine.value} key={i}>
                  {engine.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      <p className="error" hidden={hideEngineErr}>
        Please select the engine type.
      </p>

      <Box
        component="form"
        sx={{
          "& > :not(style)": { m: 1, width: "30ch" },
        }}
        noValidate
        autoComplete="off"
        className="spacing"
      >
        <TextField
          id="outlined-basic"
          label="Number of passengers (including driver)"
          variant="outlined"
          type="number"
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          onChange={(e) => updatePeople(e)}
        />
      </Box>
      <p className="error" hidden={hidePeopleErr}>
        Please enter the number of passangers (including driver).
      </p>

      <FormControl className="spacing">
        <FormLabel id="trip-radio-buttons-group-label">Trip</FormLabel>
        <RadioGroup
          aria-labelledby="trip-radio-buttons-group-label"
          name="controlled-radio-buttons-group"
          value={trip}
          onChange={updateTrip}
        >
          <FormControlLabel
            value="single"
            control={<Radio />}
            label="Single-trip"
          />
          <FormControlLabel
            value="round"
            control={<Radio />}
            label="Round-trip"
          />
        </RadioGroup>
      </FormControl>
      <p className="error" hidden={hideTripErr}>
        Please select the trip type.
      </p>

      <Button
        className="btn spacing"
        variant="contained"
        onClick={() => handleSubmit()}
      >
        Submit
      </Button>

      {emission && (
        <div className="resContainer flexCol spacing">
          <h3>CO2 equivalent emission of your ride per person:</h3>
          <h3>{emission} tonnes</h3>
          <br />
          <PlantTrees num={trees} />
        </div>
      )}
    </div>
  );
}
