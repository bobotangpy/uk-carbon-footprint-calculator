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

export default function Flights2({
  co2,
  airportList,
  airportsDetails,
  loadFactorsData,
}) {
  const [cabinClass, setCabinClass] = useState("economy-class");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [iataOrig, setIataOrig] = useState("");
  const [iataDest, setIataDest] = useState("");
  // const [duration, setDuration] = useState();
  const [trip, setTrip] = useState("round");
  const [emission, setEmission] = useState();

  const [hideTripErr, setHideTripErr] = useState(true);
  const [hideDistanceErr, setHideDistanceErr] = useState(true);
  const [hideCabinErr, setHideCabinErr] = useState(true);

  // let domesticFlightMaxKm = 400;
  // let shortHaulMaxKm = 3700;
  // let detourConstant = 95; // km

  // Key constants used in the model
  // source: https://www.myclimate.org/fileadmin/user_upload/myclimate_-_home/01_Information/01_About_myclimate/09_Calculation_principles/Documents/myclimate-flight-calculator-documentation_EN.pdf
  const shortHaulDistanceThreshold = 1500; // km
  const longHaulDistanceThreshold = 2500; // km
  const defaultPassengerLoadFactor = 0.82; // i.e. 77% of seats occupied on average
  const fuelCo2Intensity = 3.15; // kgCO2 per kg jet Fuel
  const fuelPreProductionCo2Intensity = 0.54; // kgCO2eq per kg jet fuel
  const radiativeForcingMultiplier = 2; // accounts for non-CO2 effect in high altitude (uncertain parameter between 1.5 and 4)
  const aircraftFactor = 0.00038; // accounts for aircrafts using produced, then maintained and at the end of their life disposed.
  const detourConstant = 95; // km
  const airportinfrastructureFactor = 11.68; // accounts for using the airport infrastructure

  const bookingClassWeightingFactor = (cabinClass, isShortHaul) => {
    // (bl): use constants in sources to improve matching probability
    switch (cabinClass) {
      case "business-class":
        return isShortHaul ? 1.26 : 1.54;
      case "first-class":
        return 2.4;
      default:
        return isShortHaul ? 0.96 : 0.8; // assumed economy class by default
    }
  };

  // long/short-haul dependent constants
  const defaultPassengerToFreightRatio = (isShortHaul) =>
    isShortHaul ? 0.93 : 0.74;
  // Passenger aircrafts often transport considerable amounts of freight and mail,
  // in particular in wide-body aircrafts on long-haul flights.
  const averageNumberOfSeats = (isShortHaul) => (isShortHaul ? 153.51 : 280.21);
  const a = (isShortHaul) => (isShortHaul ? 0 : 0.0001); // empiric fuel consumption parameter
  const b = (isShortHaul) => (isShortHaul ? 2.714 : 7.104); // empiric fuel consumption parameter
  const c = (isShortHaul) => (isShortHaul ? 1166.52 : 5044.93); // empiric fuel consumption parameter

  const updateOrigin = (val) => {
    setOrigin(val);
    if (destination) setHideDistanceErr(true);
  };

  const updateDestination = (val) => {
    setDestination(val);
    if (origin) setHideDistanceErr(true);
  };

  // const updateDuration = (e) => {
  //   setDuration(e.target.value);
  //   setHideDistanceErr(true);
  // };

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

      setIataOrig(iataOrig);
      setIataDest(iataDestination);

      let co2 = carbonEmissions(iataOrigin, iataDestination, trip);
      // let co2 = calculateCO2FromAirports(
      //   iataOrigin,
      //   iataDestination,
      //   cabinClass,
      //   trip
      // );
      setEmission(co2);
    }
  };
  ////////////////////////////////////////////////////////////////

  const getLoadFactors = (iataOrig, iataDest) => {
    const origAirportObj = airportsDetails.find(
      (a) => a.iata_code === iataOrig
    );
    const destAirportObj = airportsDetails.find(
      (a) => a.iata_code === iataDest
    );

    const departureAirportRegion = origAirportObj["icao_region_code"];
    const destinationAirportRegion = destAirportObj["icao_region_code"];
    if (
      Object.keys(
        loadFactorsData[departureAirportRegion]["passenger_load_factors"]
      ).includes(destinationAirportRegion)
    ) {
      return [
        loadFactorsData[departureAirportRegion]["passenger_load_factors"][
          destinationAirportRegion
        ] / 100,
        // normal form of passenger to freight ratio is function of isshorthaul
        () =>
          loadFactorsData[departureAirportRegion]["passenger_to_freight_ratio"][
            destinationAirportRegion
          ] / 100,
      ];
    }

    return [defaultPassengerLoadFactor, defaultPassengerToFreightRatio];
  };

  const emissionsForShortOrLongHaul = (
    distance,
    cabinClass,
    passengerLoadFactor,
    passengerToFreightRatio,
    isShortHaul
  ) => {
    return (
      ((a(isShortHaul) * distance * distance +
        b(isShortHaul) * distance +
        c(isShortHaul)) /
        (averageNumberOfSeats(isShortHaul) * passengerLoadFactor)) *
        passengerToFreightRatio(isShortHaul) *
        bookingClassWeightingFactor(cabinClass, isShortHaul) *
        (fuelCo2Intensity * radiativeForcingMultiplier +
          fuelPreProductionCo2Intensity) +
      aircraftFactor * distance +
      airportinfrastructureFactor
    );
  };

  const emissionsBetweenShortAndLongHaul = (
    distance,
    cabinClass,
    passengerLoadFactor,
    passengerToFreightRatio
  ) => {
    // Formula for inbetween short and long haul is a linear interpolation between
    // both hauls
    const eMin = emissionsForShortOrLongHaul(
      shortHaulDistanceThreshold,
      cabinClass,
      passengerLoadFactor,
      passengerToFreightRatio,
      true
    );
    const eMax = emissionsForShortOrLongHaul(
      longHaulDistanceThreshold,
      cabinClass,
      passengerLoadFactor,
      passengerToFreightRatio,
      false
    );
    // x is between 0 (short haul) and 1 (long haul)
    const x =
      (distance - shortHaulDistanceThreshold) /
      (longHaulDistanceThreshold - shortHaulDistanceThreshold);
    return (1 - x) * eMin + x * eMax;
  };

  const computeFootprint = (
    distance,
    cabinClass,
    passengerLoadFactor,
    passengerToFreightRatio
  ) => {
    if (
      distance < shortHaulDistanceThreshold ||
      distance > longHaulDistanceThreshold
    ) {
      // Flight is eigher short or long (but not in between)
      const isShortHaul = distance < shortHaulDistanceThreshold;
      return emissionsForShortOrLongHaul(
        distance,
        cabinClass,
        passengerLoadFactor,
        passengerToFreightRatio,
        isShortHaul
      );
    }
    return emissionsBetweenShortAndLongHaul(
      distance,
      cabinClass,
      passengerLoadFactor,
      passengerToFreightRatio
    );
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
    const [passengerLoadFactor, passengerToFreightRatio] = getLoadFactors(
      iataOrig,
      iataDest
    );
    if (!Number.isFinite(distance)) {
      throw new Error(`Incorrect distance obtained: ${distance}`);
    }
    if (!Number.isFinite(passengerLoadFactor)) {
      throw new Error(`Incorrect load factor obtained: ${passengerLoadFactor}`);
    }
    if (
      !Number.isFinite(passengerToFreightRatio(true)) ||
      !Number.isFinite(passengerToFreightRatio(false))
    ) {
      throw new Error(
        `Incorrect passenger freight ratio obtained: short haul: ${passengerToFreightRatio(
          true
        )}, long haul: ${passengerToFreightRatio(false)}`
      );
    }

    return computeFootprint(
      distance,
      cabinClass,
      passengerLoadFactor,
      passengerToFreightRatio
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

      {/* <TextField
        className="spacing"
        id="outlined-basic"
        label="Duration of flight in minutes"
        variant="outlined"
        type="number"
        style={{ width: "30ch" }}
        onChange={(e) => updateDuration(e)}
      /> */}

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
            value="economy-class"
            control={<Radio />}
            label="Economy Class"
          />
          <FormControlLabel
            value="business-class"
            control={<Radio />}
            label="Business Class"
          />
          <FormControlLabel
            value="first-class"
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
        </div>
      )}
    </div>
  );
}
