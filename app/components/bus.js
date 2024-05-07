"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import PlantTrees from "./plantTrees";

export default function Bus({ co2 }) {
  const [busCO2, setBusCO2] = useState(co2);

  const [dist, setDist] = useState();
  const [unit, setUnit] = useState('km');
  const [trip, setTrip] = useState("single");
  const [gramsEmission, setGramsEmission] = useState();
  const [tonnesEmission, setTonnesEmission] = useState();
  const [trees, setTrees] = useState(0);

  const calculateCO2 = (dist, trip) => {
    if (!busCO2) {
      return null; // Handle the case when data is not yet loaded
    }

    const gCO2Km = busCO2.coach;
    const grCO2Person = (unit === 'km' ? dist : convertToKm()) * gCO2Km;

    if (trip === "round") {
      return Math.floor(grCO2Person * 2);
    }

    return Math.floor(grCO2Person);
  };

  const convertToKm = () => {
    // Conversion from miles to kilometers
    const milesToKm = (miles) => miles * 1.60934;
    const distanceInKm = milesToKm(parseFloat(dist));
    return distanceInKm;
  };

  const updateDist = (e) => {
    setDist(e.target.value);
  };

  const updateUnit = (e) => {
    setUnit(e.target.value);
  };

  const updateTrip = (e) => {
    setTrip(e.target.value);
  };

  const handleSubmit = () => {
    console.log(dist, trip);

    let r = calculateCO2(dist, trip);
    console.log({ r });

    setGramsEmission(Math.round(r));

    // Convert r from grams to tonnes
    let rInTonnes = r / 1e6; // 1e6 represents 1 million, which is the conversion factor from grams to tonnes

    let annualCo2 = rInTonnes.toFixed(2) * 5 * 48;
    setTonnesEmission(Math.round(annualCo2));
    console.log({annualCo2});

    if (annualCo2 <= 1) {
      setTrees(1);
    } else {
      setTrees(Math.round(annualCo2));
    }
  };

  return (
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
          label="Distance"
          variant="outlined"
          type="number"
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          onChange={(e) => updateDist(e)}
        />
      </Box>

      <FormControl className="spacing">
        <FormLabel id="unit-radio-buttons-group-label">Unit</FormLabel>
        <RadioGroup
          aria-labelledby="unit-radio-buttons-group-label"
          name="controlled-radio-buttons-group"
          value={unit}
          onChange={updateUnit}
        >
          <FormControlLabel
            value="km"
            control={<Radio />}
            label="km"
          />
          <FormControlLabel
            value="miles"
            control={<Radio />}
            label="miles"
          />
        </RadioGroup>
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

      <Button
        className="btn spacing"
        variant="contained"
        onClick={() => handleSubmit()}
      >
        Submit
      </Button>

      {tonnesEmission && (
        <div className="resContainer flexCol spacing">
          <h3>CO2 equivalent emission of your ride:</h3>
          <h3>{gramsEmission} grams</h3>
          <br />

          <h3>The CO2 equivalent emission of your annual commute<sup>*</sup> would be:</h3>
          <h3>{tonnesEmission} tonnes</h3>
          <PlantTrees num={trees} />

          <br />
          <p><sup>*</sup>5 days a week, 48 weeks a year</p>
        </div>
      )}
    </div>
  );
}
