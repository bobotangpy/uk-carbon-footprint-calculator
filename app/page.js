"use client";
import Image from "next/image";
import styles from "./styles/page.module.css";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useState } from "react";
import HouseholdEnergy from "./components/householdEnergy";
import Car from "./components/car";

export default function Home() {
  const [value, setValue] = useState(0);

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
            <Typography>{children}</Typography>
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
      <h1 style={{ textAlign: "center" }}>Carbon Footprint Calculator</h1>

      <div className="tabs-container">
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
            <Car />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            Flights
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            Motorbike
          </CustomTabPanel>
          <CustomTabPanel value={value} index={4}>
            Bus
          </CustomTabPanel>
          <CustomTabPanel value={value} index={5}>
            Train
          </CustomTabPanel>
          <CustomTabPanel value={value} index={6}>
            Ferry
          </CustomTabPanel>
        </Box>
      </div>
    </div>
  );
}
