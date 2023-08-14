"use client";

import styles from "./styles/page.module.css";
import PropTypes from "prop-types";
import Skeleton from "@mui/material/Skeleton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import govData from "@/app/libs/gov_uk.json";
import airportData from "@/app/libs/airport.json";
import HouseholdEnergy from "./components/householdEnergy";
import Bus from "./components/bus";
import Flights from "./components/flight";

export default function Home() {
  const [value, setValue] = useState(0);
  const [airportList, setAirportList] = useState(null);

  const [busCO2, setBusCO2] = useState(null);
  const [flightCO2, setFlightCO2] = useState(null);
  const [trainCO2, setTrainCO2] = useState(null);
  const [carCO2, setCarCO2] = useState(null);
  const [ferryCO2, setFerryCO2] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let data = await govData;
    const co2 = data.gCO2;
    setBusCO2(co2.bus);
    setFlightCO2(co2.flight);
    setTrainCO2(co2.train);
    setCarCO2(co2.car);
    setFerryCO2(co2.ferry);

    let apData = await airportData;
    // console.log(Object.values(apData.airports));
      let list = await Object.values(apData.airports);
      let listArr = [];
      await list.map((airport) => {
    // console.log(airport.name);
        listArr.push(`${airport.name} (${airport.iata_code})`);
      });

      setAirportList(listArr.sort());
    }

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
      <h1 style={{ textAlign: "center", marginBottom: "50px" }}>
        Carbon Footprint Calculator
      </h1>

      <div className="tabs-container">
        {ferryCO2 ? (
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="Carbon Footprint Calculator tabs"
              >
                <Tab label="Household Energy" {...a11yProps(0)} />
                <Tab label="Car" {...a11yProps(1)} />
                <Tab label="Flights" {...a11yProps(2)} />
                <Tab label="Motorbike" {...a11yProps(3)} />
                <Tab label="Bus" {...a11yProps(4)} />
                <Tab label="Train" {...a11yProps(5)} />
                <Tab label="Ferry" {...a11yProps(6)} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <HouseholdEnergy />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              Car
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <Flights co2={flightCO2} airportList={airportList} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
              Motorbike
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
              <Bus co2={busCO2} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={5}>
              Train
            </CustomTabPanel>
            <CustomTabPanel value={value} index={6}>
              Ferry
            </CustomTabPanel>
          </Box>
        ) : (
          <Skeleton
            sx={{ bgcolor: "grey.900" }}
            variant="rectangular"
            width={210}
            height={118}
          />
        )}
      </div>
    </div>
  );
}
