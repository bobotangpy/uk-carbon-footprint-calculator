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
import PlantTrees from "./plantTrees";
import Donate from "./donate";

export default function Ferry({ co2 }) {
  const [duration, setDuration] = useState("");
  const [vehicle, setVehicle] = useState("on-foot");
  const [trip, setTrip] = useState("round-trip");
  const [emission, setEmission] = useState();
  const [trees, setTrees] = useState(0);
  const [showDonate, setShowDonate] = useState(false);

  const [hideDurationErr, setHideDurationErr] = useState(true);
  const [hideTripErr, setHideTripErr] = useState(true);
  const [hideVehicleErr, setHideVehicleErr] = useState(true);

  let avgSpeedKmh = 30;

  const updateDuration = (e) => {
    setDuration(e.target.value);
    setHideDurationErr(true);
  };

  const updateVehicle = (e) => {
    setVehicle(e.target.value);
    setHideVehicleErr(true);
  };

  const updateTrip = (e) => {
    setTrip(e.target.value);
    setHideTripErr(true);
  };

  const handleSubmit = () => {
    if (!duration || !vehicle || !trip) {
      setHideDurationErr(false);
      setHideVehicleErr(false);
      setHideTripErr(false);
      return;
    }

    const emissions = calculateCO2FromDuration(duration, vehicle, trip);

    // setEmission(emissions);

    // Convert emissions from grams to tonnes
    let rInTonnes = emissions / 1e6; // 1e6 represents 1 million, which is the conversion factor from grams to tonnes

    if (rInTonnes <= 0.01) {
      setEmission(0.01);
    } else setEmission(rInTonnes.toFixed(2));

    if (emissions <= 1e6) {
      setTrees(1);
      setShowDonate(true);
    } else {
      Math.round(emissions / 1e6);
    }
  };

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
  // const emissions = calculateCO2FromDuration(360, "with-vehicle", "round-trip");

  return (
    // duration in minutes
    // with vehicle on ferry or not
    // trip type
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
          type="number"
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          onChange={(e) => updateDuration(e)}
        />
      </Box>
      <p className="error" hidden={hideDurationErr}>
        Please enter the duration of the journey.
      </p>

      <FormControl className="spacing">
        {/* <FormLabel id="vehicle-radio-buttons-group-label">Trip Type</FormLabel> */}
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
          <h3>{emission} tonnes</h3>
          <br />
          {showDonate ? <Donate /> : <PlantTrees num={trees} />}
        </div>
      )}
    </div>
  );
}
