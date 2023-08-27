"use client";

import React, { useEffect, useState } from "react";
// import carbonIntensityData from "@/app/libs/ci_by_source.json";
// import electricityMixesData from "@/app/libs/electricity_mixes.json";
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

export default function Train({ trainStationsData }) {
  const [stationList, setStationList] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [trip, setTrip] = useState("single");
  const [emission, setEmission] = useState();

  const [hideLocationErr, setHideLocationErr] = useState(true);
  const [hideTripErr, setHideTripErr] = useState(true);

  const kgCO2perKm = 0.0351; // source: https://www.thetrainline.com/sustainable-travel (Train = National Rail 0.0351 kg CO2/passenger km)

  // TODO: use train station data to calculate distance in km => km * kgCO2perKm

  // let grCo2Diesel = 74; // source = https://www.railplus.com.au/pdfs/ATOC-rail-is-greener-report.pdf
  // let electricConsumption = 0.108; // kWh / pkm for electric trains. Source: https://www.railplus.com.au/pdfs/ATOC-rail-is-greener-report.pdf

  useEffect(() => {
    if (trainStationsData) {
      let listArr = [];

      trainStationsData.map((item) => {
        listArr.push(`${item.station_name} (${item["3alpha"]})`);
      });

      setStationList(listArr);
    }
  }, []);

  const updateOrigin = (val) => {
    setOrigin(val);
    if (destination) setHideLocationErr(true);
  };

  const updateDestination = (val) => {
    setDestination(val);
    if (origin) setHideLocationErr(true);
  };

  const updateTrip = (e) => {
    setTrip(e.target.value);
    setHideTripErr(true);
  };

  const handleSubmit = () => {
    if (!origin) return setHideLocationErr(false);
    if (!destination) return setHideLocationErr(false);
    if (!trip) return setHideTripErr(false);

    let originCode = origin.split("(")[1].slice(0, -1);
    let destinationCode = destination.split("(")[1].slice(0, -1);

    calculateCO2(originCode, destinationCode, trip);
  };

  const calculateDistance = (origin, destination) => {
    const originObj = trainStationsData.find((t) => t["3alpha"] === origin);
    const destObj = trainStationsData.find((t) => t["3alpha"] === destination);

    return geoDistance(
      [originObj["longitude"], originObj["latitude"]],
      [destObj["longitude"], destObj["latitude"]]
    ) * 6371; // To convert great-arc distance (in radians) into km.
  };

  const calculateCO2 = (origin, destination, tripType) => {
    let distKm = calculateDistance(origin, destination);

    let grCo2Person = Math.floor(kgCO2perKm * distKm);

    if (tripType === "round-trip") {
      grCo2Person *= 2;
    }

    setEmission(grCo2Person);
  };

  return (
    <div className="flexCol">
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
            id="combo-box-trainStations"
            options={stationList ? stationList : []}
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
                label="Origin station"
              />
            )}
          />
          <Autocomplete
            disablePortal
            id="combo-box-trainStations"
            options={stationList ? stationList : []}
            sx={{ width: 900 }}
            onChange={(event, value) => updateDestination(value)}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={`${option}_1`}>
                {option}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Destination station"
              />
            )}
          />
        </Box>
      </div>
      <p className="error" hidden={hideLocationErr}>
        Please enter both origin station and destination station.
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
          <h3>{emission} kg</h3>
        </div>
      )}
    </div>
  );
}
