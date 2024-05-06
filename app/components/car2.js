"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import cars from "@/app/libs/cars-by-size.json";
import PlantTrees from "./plantTrees";

export default function Car2() {
  const [fuelType, setFuelType] = useState("diesel");
  const [size, setSize] = useState("small");
  const [distKm, setDistKm] = useState();
  const [people, setPeople] = useState();
  const [trip, setTrip] = useState("single");
  const [ciData, setCiData] = useState();
  const [kgEmission, setKgEmission] = useState();
  const [tonnesEmission, setTonnesEmission] = useState();
  const [trees, setTrees] = useState(0);

  const [hideDistErr, setHideDistErr] = useState(true);
  const [hideSizeErr, setHideSizeErr] = useState(true);
  const [hideFuelErr, setHideFuelErr] = useState(true);
  const [hidePeopleErr, setHidePeopleErr] = useState(true);
  const [hideTripErr, setHideTripErr] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const carsData = await cars;
    setCiData(carsData.footprints);
  };

  const updateDist = (e) => {
    setDistKm(e.target.value);
    setHideDistErr(true);
  };

  const updateFuelType = (e) => {
    setFuelType(e.target.value);
  };

  const updateSize = (e) => {
    setSize(e.target.value);
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
    if (!size) return setHideSizeErr(false);
    if (!fuelType) return setHideFuelErr(false);
    if (!people) return setHidePeopleErr(false);
    if (!trip) return setHideTripErr(false);

    calculateCO2(distKm, size, fuelType, people, trip);
  };

  const calculateCO2 = (
    distKm,
    carSize,
    fuelType,
    paxInCar,
    tripType
  ) => {
    let grCO2Driving = carbonIntensity(carSize, fuelType);

    let grCO2Person = grCO2Driving * distKm;

    if (tripType === "round-trip") {
      grCO2Person *= 2;
    }

    if (parseInt(paxInCar) > 1) {
      grCO2Person =
        Math.floor(grCO2Person / paxInCar) + (grCO2Person % paxInCar > 0);
    }
    console.log(grCO2Person);

    setKgEmission(grCO2Person); // emission per person

    // Convert grCO2Person from grams to tonnes
    let rInTonnes = grCO2Person / 1e6; // 1e6 represents 1 million, which is the conversion factor from grams to tonnes

    let annualCo2 = rInTonnes.toFixed(2) * 5 * 48;
    setTonnesEmission(annualCo2);

    if (annualCo2 <= 1) {
      setTrees(1);
    } else {
      setTrees(Math.round(annualCo2));
    }
  };

  const carbonIntensity = (carSize, fuelType) => {
    const entry = ciData.find((d) => d.size == carSize);
    const co2 = entry.fuel.find((item) => Object.keys(item).includes(fuelType));
    
    return co2[fuelType];
  };

  return (
    // distKm,
    // fuelType ['electric', 'diesel', 'petrol']
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
          <InputLabel id="fuel-simple-select-label">
            Fuel Type
          </InputLabel>
          <Select
            labelId="fuel-simple-select-label"
            id="fuel-simple-select"
            value={fuelType}
            label="Fuel Type"
            onChange={updateFuelType}
          >
            <MenuItem value={"diesel"}>Diesel</MenuItem>
            <MenuItem value={"electric"}>Electric</MenuItem>
            <MenuItem value={"hybrid"}>Hybrid</MenuItem>
            <MenuItem value={"petrol"}>Petrol</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <p className="error" hidden={hideFuelErr}>
        Please select the fuel type.
      </p>

      <Box sx={{ minWidth: "25ch" }} className="spacing">
        <FormControl fullWidth>
          <InputLabel id="size-simple-select-label">Car Size</InputLabel>
          <Select
            labelId="size-simple-select-label"
            id="size-simple-select"
            value={size}
            label="Car Size"
            onChange={updateSize}
          >
            <MenuItem value={"small"}>Small</MenuItem>
            <MenuItem value={"medium"}>Medium</MenuItem>
            <MenuItem value={"large"}>Large</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <p className="error" hidden={hideSizeErr}>
        Please select the car size.
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
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 1 }}
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

      {tonnesEmission && (
        <div className="resContainer flexCol spacing">
          <h3>CO2 equivalent emission of your ride per person:</h3>
          <h3>{kgEmission} kg</h3>
          <br />

          <h3>The CO2 equivalent emission of your annual commute<sup>*</sup> would be:</h3>
          <h3>{tonnesEmission} tonnes</h3>
          <PlantTrees num={trees} />

          <br />
          <p><sup>*</sup></p>
        </div>
      )}
    </div>
  );
}
