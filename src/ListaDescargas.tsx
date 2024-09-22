import React, { useEffect, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Avatar from "@mui/material/Avatar";
import { Chart } from "./Chart";
import { Switch } from "@/components/ui/switch"; // Asegúrate de que la ruta sea correcta
// Asegúrate de que la ruta sea correcta

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
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    const fetchDevices = async () => {
      const querySnapshot = await getDocs(
        collection(db, "trakeoAlimentosNaturales")
      );
      const deviceData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          deviceInfo: {
            deviceType: data.deviceInfo.deviceType,
            language: data.deviceInfo.language,
            screenResolution: data.deviceInfo.screenResolution,
            userAgent: data.deviceInfo.userAgent,
          },
          email: data.email,
          ipAddress: data.ipAddress,
          location: data.location,
          name: data.name,
          telefono: data.telefono,
          timestamp: data.timestamp,
        } as DeviceInfo;
      });
      setDevices(deviceData);
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const convertTimestampToDate = (timestamp: Timestamp): string => {
    return timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : "";
  };

  return (
    <div className="bg-white dark:bg-[#2E2E2E] p-4 min-h-screen">
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          paddingRight: "2rem",
        }}
      >
        <Switch
          id="dark-mode"
          checked={isDarkMode}
          onCheckedChange={() => setIsDarkMode((prev) => !prev)}
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-black dark:text-white">
          Seguimiento de Dispositivos
        </h1>
        <div>
          <img
            alt="Your Company"
            src="https://firebasestorage.googleapis.com/v0/b/mayoristakaurymdp.appspot.com/o/Pesta%C3%B1aLogo%2FSinFondoLogo.png?alt=media&token=8a59df40-df50-4c65-8677-43a9fee55622"
            style={{ width: "150px" }}
            className="block"
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: "1rem",
          maxHeight: "800px",
          width: "100%",
        }}
      >
        <Chart devices={devices} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {devices.map((device) => (
          <Card key={device.id} className="shadow-md">
            <CardHeader>
              <div className="flex flex-col items-center justify-center gap-3">
                <Avatar
                  sx={{
                    bgcolor: "#9C27B0",
                    width: 56,
                    height: 56,
                    fontSize: 24,
                  }}
                >
                  {device.email.charAt(0).toUpperCase()}
                </Avatar>
                <div className="text-center">
                  <CardTitle className="text-base">{device.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {device.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                IP: {device.ipAddress}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ubicación: {device.location}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dispositivo: {device.deviceInfo.deviceType}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Resolución: {device.deviceInfo.screenResolution}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Idioma: {device.deviceInfo.language}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <time dateTime={device.timestamp?.toDate().toISOString()}>
                  {convertTimestampToDate(device.timestamp)}
                </time>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrakeoAlimentosNaturales;
