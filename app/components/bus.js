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

export default function Bus({ co2 }) {
  const [busCO2, setBusCO2] = useState(co2);

  const [dist, setDist] = useState();
  const [trip, setTrip] = useState("single");
  const [emission, setEmission] = useState();

  const calculateCO2 = (dist, trip) => {
    if (!busCO2) {
      return null; // Handle the case when data is not yet loaded
    }

    const gCO2Km = busCO2.coach;
    const grCO2Person = dist * gCO2Km;

    if (trip === "round") {
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
    setEmission(r)
  };

  return (
    <div className="flexCol">
      <h2>CO2 emission of a bus ride</h2>
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
          onChange={(e) => updateDist(e)}
        />
      </Box>

      <FormControl className="spacing">
        <FormLabel id="demo-radio-buttons-group-label">Trip</FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
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

      {emission && (
        <div className="flexCol spacing">
          <h3>CO2 equivalent emission of your ride:</h3>
          <h3>{emission} grams</h3>
        </div>
      )}
    </div>
  );
}
