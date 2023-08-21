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

export default function Flights({ co2, airportList, airportsDetails }) {
  const [cabinClass, setCabinClass] = useState("economy-class");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState();
  const [trip, setTrip] = useState("round");
  const [emission, setEmission] = useState();

  const [hideTripErr, setHideTripErr] = useState(true);
  const [hideDistanceErr, setHideDistanceErr] = useState(true);
  const [hideCabinErr, setHideCabinErr] = useState(true);

  let domesticFlightMaxKm = 400;
  let shortHaulMaxKm = 3700;
  let detourConstant = 95; // km

  const updateOrigin = (val) => {
    setOrigin(val);
    if (destination) setHideDistanceErr(true);
  };

  const updateDestination = (val) => {
    setDestination(val);
    if (origin) setHideDistanceErr(true);
  };

  const updateDuration = (e) => {
    setDuration(e.target.value);
    setHideDistanceErr(true);
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

    if (duration === null || (origin === null && destination === null)) {
      return setHideDistanceErr(false);
    }

    if (!cabinClass) return setHideCabinErr(false);

    if (duration) {
      let co2 = calculateCO2FromDuration(duration, cabinClass, trip);
      setEmission(co2);
    }

    if (origin && destination) {
      let iataOrigin = origin.split("(")[1].slice(0, -1);
      let iataDestination = destination.split("(")[1].slice(0, -1);
      let co2 = calculateCO2FromAirports(iataOrigin, iataDestination, cabinClass, trip);
      setEmission(co2);
    }
  };

  const calculateCO2 = (distKm, paxClass, tripType) => {
    let grCO2;

    if (distKm < domesticFlightMaxKm) {
      grCO2 = co2["domestic"]["avg"];
    } else if (distKm < shortHaulMaxKm) {
      grCO2 =
        paxClass === "business-class"
          ? co2["shortHaul"]["businessClass"]
          : co2["shortHaul"]["economyClass"];
    } else {
      grCO2 =
        paxClass === "business-class"
          ? co2["longHaul"]["businessClass"]
          : co2["longHaul"]["economyClass"];
    }

    let grCO2Person = grCO2 * distKm;

    if (tripType === "round-trip") {
      grCO2Person *= 2;
    }

    let grams = Math.floor(grCO2Person);

    // 1 tonne = 1000000 grams
    const tonnes = grams / 1000000;
    return tonnes;
  };

  const calculateCO2FromAirports = (iataOrig, iataDest, paxClass, tripType) => {
    const distKm = realDistance(iataOrig, iataDest);
    return calculateCO2(distKm, paxClass, tripType);
  };

  const calculateCO2FromDuration = (durationInMinutes, paxClass, tripType) => {
    const distKm = estimateFlightDistanceFromDuration(durationInMinutes);
    return calculateCO2(distKm, paxClass, tripType);
  };

  const estimateFlightDistanceFromDuration = (durationInMinutes) => {
    const distKm =
      averageSpeedFromDuration(durationInMinutes) * (durationInMinutes / 60);
    return Math.floor(distKm);
  };

  const averageSpeedFromDuration = (durationInMinutes) => {
    let avgSpeed;

    const hour = durationInMinutes / 60;

    if (hour < 3.3) {
      avgSpeed =
        14.1 +
        495 * hour -
        110 * hour * hour +
        9.85 * hour * hour * hour -
        0.309 * hour * hour * hour * hour;
    } else {
      avgSpeed = 770;
    }

    return Math.floor(avgSpeed);
  };

  // Calculate real distance between airports in km, given two airport as iata codes (3-digit code).
  const realDistance = (iataOrig, iataDest) => {
    const origAirportObj = airportsDetails.find((a) => a.iata_code === iataOrig);
    const destAirportObj = airportsDetails.find((a) => a.iata_code === iataDest);

    const distM = haversine(
      parseAirportLat(origAirportObj),
      parseAirportLon(origAirportObj),
      parseAirportLat(destAirportObj),
      parseAirportLon(destAirportObj)
    );

    const distKm = Math.floor(distM / 1000) + detourConstant;

    console.log("Real distance:", distKm, "km");

    return distKm;
  };

  const radians = (degrees) => {
    return (degrees * Math.PI) / 180;
  };

  const haversine = (lat1, lon1, lat2, lon2) => {
    /*
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    Source: http://stackoverflow.com/a/15737218/5802289
    */
    // Convert input to floats
    lat1 = parseFloat(lat1);
    lon1 = parseFloat(lon1);
    lat2 = parseFloat(lat2);
    lon2 = parseFloat(lon2);

    // Convert decimal degrees to radians
    const [rLon1, rLat1, rLon2, rLat2] = [lon1, lat1, lon2, lat2].map(radians);

    // Haversine formula
    const dLon = rLon2 - rLon1;
    const dLat = rLat2 - rLat1;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a));
    const km = 6367 * c;
    const meters = Math.floor(km * 1000);

    return meters;
  };

  const parseAirportLat = (airportObj) => {
    const airportCoordinates = parseAirportCoordinates(airportObj);
    return airportCoordinates[1];
  };

  const parseAirportLon = (airportObj) => {
    const airportCoordinates = parseAirportCoordinates(airportObj);
    return airportCoordinates[0];
  };

  const parseAirportCoordinates = (airportObj) => {
    const airportCoordinates = airportObj["lonlat"];
    return airportCoordinates;
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
              <TextField
                {...params}
                variant="outlined"
                // onChange={(e) => updateOrigin(e)}
                label="Leaving from"
              />
            )}
          />
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={airportList ? airportList : []}
            sx={{ width: 900 }}
            onChange={(event, value) => updateDestination(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Going to"
              />
            )}
          />
        </Box>
      </div>

      <TextField
        className="spacing"
        id="outlined-basic"
        label="Duration of flight in minutes"
        variant="outlined"
        type="number"
        style={{ width: "30ch" }}
        onChange={(e) => updateDuration(e)}
      />

      <p className="error" hidden={hideDistanceErr}>
        Please enter origin and destination <i>OR</i> duration of the flight.
      </p>

      <FormControl className="spacing">
        <FormLabel id="cabinClass-radio-buttons-group-label">Cabin Class</FormLabel>
        <RadioGroup
          aria-labelledby="cabinClass-radio-buttons-group-label"
          name="controlled-radio-buttons-group"
          value={cabinClass}
          onChange={updateClass}
        >
          <FormControlLabel
            value="economy-class"
            control={<Radio />}
            label="Economy Class"
          />
          <FormControlLabel
            value="business-class"
            control={<Radio />}
            label="Business Class"
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
        </div>
      )}
    </div>
  );
}
