"use client";

import React, { useEffect, useState } from "react";
import airportData from "@/app/libs/airport.json";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

export default function Flights({ co2, airportList }) {
  // const [airportList, setAirportList] = useState(null);
  const [cabinClass, setCabinClass] = useState();
  const [duration, setDuration] = useState();
  const [trip, setTrip] = useState();
  const [emission, setEmission] = useState();

  let domesticFlightMaxKm = 400;
  let shortHaulMaxKm = 3700;
  let detourConstant = 95; // km

  useEffect(() => {
    // fetchData();
    console.log(airportList);
  }, []);

  // const fetchData = async () => {
  //   let data = await airportData;

  //   if (data.length > 0) {
  //     let list = Object.values(data.airports);
  //     let listArr = [];
  //     list.forEach.map((airport) => {
  //       listArr.push(airport.name);
  //     });

  //     setAirportList(listArr);
  //   }
  // };

  const updateOrigin = (e) => {
    console.log(e.target.value);
  };

  const updateDestination = (e) => {
    console.log(e.target.value);
  };

  const updateDuration = (e) => {
    setDuration(e.target.value);
  };

  const updateClass = (e) => {
    setCabinClass(e.target.value);
  };

  const updateTrip = (e) => {
    setTrip(e.target.value);
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

    return Math.floor(grCO2Person);
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
    const origAirportDict = airportList[iataOrig];
    const destAirportDict = airportList[iataDest];

    const distM = haversine(
      parseAirportLat(origAirportDict),
      parseAirportLon(origAirportDict),
      parseAirportLat(destAirportDict),
      parseAirportLon(destAirportDict)
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

  const parseAirportLat = () => {
    const airportCoordinates = parseAirportCoordinates(airportList);
    return airportCoordinates[1];
  };

  const parseAirportLon = () => {
    const airportCoordinates = parseAirportCoordinates(airportList);
    return airportCoordinates[0];
  };

  const parseAirportCoordinates = () => {
    const airportCoordinates = airportList["lonlat"];
    return airportCoordinates;
  };

  // Example usage
  const emissions = calculateCO2(1000, "business-class", "round-trip");
  console.log("CO2 Emissions:", emissions);

  return (
    // trip type
    // from, to
    // duration in minutes
    // class of passenger (business-class or economy-class)
    <div className="flexCol">
      <h2>CO2 emission of a flight</h2>

      <FormControl className="spacing">
        <FormLabel id="demo-radio-buttons-group-label">Trip Type</FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
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
            renderOption={(props, option) => (
              <Box component="li" {...props} key={`${option}_1`}>
                {option}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                onChange={(e) => updateOrigin(e)}
                label="Leaving from"
              />
            )}
          />
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={airportList ? airportList : []}
            sx={{ width: 900 }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                onChange={(e) => updateDestination(e)}
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
        style={{ width: "30ch" }}
        onChange={(e) => updateDuration(e)}
      />

      <FormControl className="spacing">
        <FormLabel id="demo-radio-buttons-group-label">Cabin Class</FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          name="controlled-radio-buttons-group"
          value={trip}
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
          <h3>CO2 equivalent emission of your flight:</h3>
          <h3>{emission} grams</h3>
        </div>
      )}
    </div>
  );
}
