"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { geoDistance } from "d3-geo";
import PlantTrees from "./plantTrees";

export default function Flights3({
  co2,
  airportList,
  airportsDetails,
}) {
  const [cabinClass, setCabinClass] = useState("economy-class");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [iataOrig, setIataOrig] = useState("");
  const [iataDest, setIataDest] = useState("");
  const [trip, setTrip] = useState("round");
  const [emission, setEmission] = useState();
  const [trees, setTrees] = useState(0);

  const [hideTripErr, setHideTripErr] = useState(true);
  const [hideDistanceErr, setHideDistanceErr] = useState(true);
  const [hideCabinErr, setHideCabinErr] = useState(true);

  // Key constants used in the model
  // source: https://www.myclimate.org/fileadmin/user_upload/myclimate_-_home/01_Information/01_About_myclimate/09_Calculation_principles/Documents/myclimate-flight-calculator-documentation_EN.pdf
  const detourConstant = 95; // km

  const longHaulDistanceThreshold = 3700; // km

  const updateOrigin = (val) => {
    setOrigin(val);
    if (destination) setHideDistanceErr(true);
  };

  const updateDestination = (val) => {
    setDestination(val);
    if (origin) setHideDistanceErr(true);
  };

  const updateClass = (e) => {
    setCabinClass(e.target.value);
    setHideCabinErr(true);
  };

  const updateTrip = (e) => {
    setTrip(e.target.value);
    setHideTripErr(true);
  };

  const handleSubmit = () => {
    if (!trip) return setHideTripErr(false);

    if (origin === null && destination === null) {
      return setHideDistanceErr(false);
    }

    if (!cabinClass) return setHideCabinErr(false);

    if (origin && destination) {
      let iataOrigin = origin.split("(")[1].slice(0, -1);
      let iataDestination = destination.split("(")[1].slice(0, -1);

      setIataOrig(iataOrig);
      setIataDest(iataDestination);

      let co2 = carbonEmissions(iataOrigin, iataDestination, trip);

      setEmission(co2);

      setTrees(Math.round(co2));
    }
  };
  ////////////////////////////////////////////////////////////////

  const computeFootprint = (
    distance,
    cabinClass,
  ) => {
    if (distance <= longHaulDistanceThreshold) {
      // use shortHaul number for cabinClass
      return distance * (co2.shortHaul[cabinClass] / 1000); // convert to kg
    } else {
      // use longHaul number for cabinClass
      return distance * (co2.longHaul[cabinClass] / 1000); // convert to kg
    }
  };

  const distanceFromAirports = (iataOrig, iataDest) => {
    const origAirportObj = airportsDetails.find(
      (a) => a.iata_code === iataOrig
    );
    const destAirportObj = airportsDetails.find(
      (a) => a.iata_code === iataDest
    );

    return (
      geoDistance(
        [origAirportObj["lonlat"][0], origAirportObj["lonlat"][1]],
        [destAirportObj["lonlat"][0], destAirportObj["lonlat"][1]]
      ) *
        6371 + // To convert great-arc distance (in radians) into km.
      detourConstant
    );
  };

  const activityDistance = (iataOrig, iataDest) => {
    // compute distance from airport codes
    let realDist = distanceFromAirports(iataOrig, iataDest);

    console.log("Real distance:", realDist, "km");

    return realDist;
  };

  const calculateEmissions = (iataOrig, iataDest) => {
    const distance = activityDistance(iataOrig, iataDest);

    return computeFootprint(
      distance,
      cabinClass,
    );
  };

  /* Calculates emissions in kgCO2eq */
  const carbonEmissions = (iataOrigin, iataDestination, trip) => {
    const footprint = calculateEmissions(iataOrigin, iataDestination);

    if (trip !== "round") {
      // 1 tonne = 1000 kg
      const tonnes = Math.floor(footprint) / 1000;
      return tonnes;
      // return footprint;
    }

    // If no airport codes are defined, we simply multiply the emissions for roundtrips
    if (!iataOrigin || !iataDestination) {
      return footprint * 2;
    }

    // Reversing the destination and departure to calculate more precise emissions
    let g = footprint + calculateEmissions(iataOrigin, iataDestination);
    console.log(g);
    // 1 tonne = 1000 kg
    const tonnes = Math.floor(g) / 1000;
    return tonnes;

    // return footprint + calculateEmissions(iataOrigin, iataDestination);
  };

  return (
    // trip type
    // from, to
    // duration in minutes
    // class of passenger (business-class or economy-class)
    <div className="flexCol">
      <FormControl className="spacing">
        <FormLabel id="trip-radio-buttons-group-label">Trip Type</FormLabel>
        <RadioGroup
          aria-labelledby="trip-radio-buttons-group-label"
          name="controlled-radio-buttons-group"
          value={trip}
          onChange={updateTrip}
        >
          <FormControlLabel
            value="single"
            control={<Radio />}
            label="One-way"
          />
          <FormControlLabel value="round" control={<Radio />} label="Return" />
        </RadioGroup>

        <p className="error" hidden={hideTripErr}>
          Please select trip type.
        </p>
      </FormControl>

      <div className="flexRow">
        <Box
          component="form"
          sx={{
            "& > :not(style)": { m: 1, width: "30ch" },
          }}
          noValidate
          autoComplete="on"
          className="spacing"
        >
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={airportList ? airportList : []}
            sx={{ width: 900 }}
            onChange={(event, value) => updateOrigin(value)}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={`${option}_1`}>
                {option}
              </Box>
            )}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Leaving from" />
            )}
          />
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={airportList ? airportList : []}
            sx={{ width: 900 }}
            onChange={(event, value) => updateDestination(value)}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={`${option}_1`}>
                {option}
              </Box>
            )}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Going to" />
            )}
          />
        </Box>
      </div>

      <p className="error" hidden={hideDistanceErr}>
        Please enter origin and destination of the flight.
      </p>

      <FormControl className="spacing">
        <FormLabel id="cabinClass-radio-buttons-group-label">
          Cabin Class
        </FormLabel>
        <RadioGroup
          aria-labelledby="cabinClass-radio-buttons-group-label"
          name="controlled-radio-buttons-group"
          value={cabinClass}
          onChange={updateClass}
        >
          <FormControlLabel
            value="economyClass"
            control={<Radio />}
            label="Economy Class"
          />
          <FormControlLabel
            value="businessClass"
            control={<Radio />}
            label="Business Class"
          />
          <FormControlLabel
            value="firstClass"
            control={<Radio />}
            label="First Class"
          />
        </RadioGroup>

        <p className="error" hidden={hideCabinErr}>
          Please select cabin class.
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
          <h3>CO2 equivalent emission of your flight:</h3>
          <h2>{emission} tonnes</h2>
          <br />
          <PlantTrees num={trees} />
        </div>
      )}
    </div>
  );
}
