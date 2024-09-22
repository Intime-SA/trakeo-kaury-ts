import React, { useEffect, useState } from "react";
import { Switch } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import ChartUsers from "./ChartUsers";
import { ChartTrakeo } from "./ChartTrakeo";
import { ChartIsLogged } from "./ChartIsLogged";
import ChartsOrders from "./ChartsOrders";
import { Timestamp } from "firebase/firestore";

export interface DeviceInfo {
  deviceInfo: {
    deviceType: string;
    language: string;
    screenResolution: string;
    userAgent: string;
  };
  email: string;
  id: string;
  ipAddress: string;
  location: string;
  name: string;
  telefono: string;
  timestamp: Timestamp;
}

const TrakeoAlimentosNaturales: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  /*   const convertTimestampToDate = (timestamp: Timestamp): string => {
    return timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : "";
  };
 */
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        padding: "1rem",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
          <h1
            style={{
              marginLeft: isMobile ? "1rem" : "5rem",

              fontSize: isMobile ? "0.7rem" : "1.5rem",
              fontWeight: "bold",
              marginRight: "0rem",
            }}
          >
            {" "}
            Seguimiento Usuarios: Kaury
            <span style={{ marginLeft: "0.9rem" }}>|</span>
          </h1>
          <img
            src="https://firebasestorage.googleapis.com/v0/b/mayoristakaurymdp.appspot.com/o/Pesta%C3%B1aLogo%2FSinFondoLogo.png?alt=media&token=8a59df40-df50-4c65-8677-43a9fee55622"
            alt="atlantics.dev"
            style={{ width: isMobile ? "50px" : "100px" }}
          />
        </div>

        <div style={{ marginRight: isMobile ? "0rem" : "5rem" }}>
          <Switch
            checked={isDarkMode}
            onChange={() => setIsDarkMode((prev) => !prev)}
          />
        </div>
      </div>
      <div>
        <ChartsOrders />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: isMobile ? "center" : "space-around",
          flexDirection: isMobile ? "column" : "row",
          maxHeight: "800px",
          width: "100%",
          marginTop: isMobile ? "15rem" : "2rem",
        }}
      >
        <ChartUsers />
        <ChartTrakeo />
        <ChartIsLogged />
      </div>
    </div>
  );
};

export default TrakeoAlimentosNaturales;
