"use client";

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styles from "./styles/page.module.css";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FlightIcon from '@mui/icons-material/Flight';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
// import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import govData from "@/app/libs/gov_uk.json";
import airportData from "@/app/libs/airport.json";
import loadFactors from "@/app/libs/loadfactors.json";
import HouseholdEnergy from "./components/householdEnergy";
import Bus from "./components/bus";
// import Flights from "./components/flight";
import Flights2 from "./components/flight2";
import Ferry from "./components/ferry";
import Car from "./components/car";
import Loading from "./components/loading";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0);
  const [airportList, setAirportList] = useState(null);
  const [airportsDetails, setAirportsDetails] = useState(null);
  const [loadFactorsData, setLoadFactorsData] = useState(null);

  const [busCO2, setBusCO2] = useState(null);
  const [flightCO2, setFlightCO2] = useState(null);
  const [trainCO2, setTrainCO2] = useState(null);
  const [carCO2, setCarCO2] = useState(null);
  const [ferryCO2, setFerryCO2] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (loadFactorsData) setLoading(false);
  }, [loadFactorsData]);

  const fetchData = async () => {
    let data = await govData;
    const co2 = data.gCO2;
    setBusCO2(co2.bus);
    setFlightCO2(co2.flight);
    setTrainCO2(co2.train);
    setCarCO2(co2.car);
    setFerryCO2(co2.ferry);

    let apData = await airportData;
    let list = await Object.values(apData.airports);
    let listArr = [];
    await list.map((airport) => {
      listArr.push(`${airport.name} (${airport.iata_code})`);
    });

    let factorsData = await loadFactors;
    setLoadFactorsData(factorsData);

    setAirportsDetails(list);
    setAirportList(listArr.sort());
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {/* <Typography> */}
            {children}
            {/* </Typography> */}
          </Box>
        )}
      </div>
    );
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <div className="main">
      <h1 style={{ textAlign: "center", margin: "30px 20px 50px" }}>
        Carbon Footprint Calculator
      </h1>

      {loading ? (
        <Loading />
      ) : (
        <div className="tabs-container">
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="Carbon Footprint Calculator tabs"
              >
                <Tab label="Household Energy" icon={<HomeIcon />} iconPosition="start" {...a11yProps(0)} />
                <Tab label="Car" icon={<DirectionsCarIcon />} iconPosition="start" {...a11yProps(1)} />
                <Tab label="Flights" icon={<FlightIcon />} iconPosition="start" {...a11yProps(2)} />
                {/* <Tab label="Motorbike" {...a11yProps(3)} /> */}
                <Tab label="Bus" icon={<DirectionsBusIcon />} iconPosition="start" {...a11yProps(3)} />
                <Tab label="Train" icon={<TrainIcon />} iconPosition="start" {...a11yProps(4)} />
                <Tab label="Ferry" icon={<DirectionsBoatIcon />} iconPosition="start" {...a11yProps(5)} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <HouseholdEnergy />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Car co2={carCO2} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              {/* <Flights
                co2={flightCO2}
                airportList={airportList}
                airportsDetails={airportsDetails}
              /> */}
              <Flights2
                co2={flightCO2}
                airportList={airportList}
                airportsDetails={airportsDetails}
                loadFactorsData={loadFactorsData}
              />
            </CustomTabPanel>
            {/* <CustomTabPanel value={value} index={3}>
              Motorbike
            </CustomTabPanel> */}
            <CustomTabPanel value={value} index={3}>
              <Bus co2={busCO2} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
              Train
            </CustomTabPanel>
            <CustomTabPanel value={value} index={5}>
              <Ferry co2={ferryCO2} />
            </CustomTabPanel>
          </Box>
        </div>
      )}
    </div>
  );
}
