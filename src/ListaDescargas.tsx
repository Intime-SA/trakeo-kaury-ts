import React, { useEffect, useState } from "react";
import { Switch } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import ChartUsers from "./ChartUsers";
import { ChartTrakeo } from "./ChartTrakeo";
import { ChartIsLogged } from "./ChartIsLogged";
import ChartsOrders from "./ChartsOrders";
import {
  collection,
  getDocs,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { ChartVisitas } from "./ChartVisitas";
import { db } from "./firebaseConfig";
import { ChartTotalVentas } from "./ChartTotalVentas";
import { ChartTotalHistorico } from "./ChartTotalHistorico";
import { ChartVentasDiarias } from "./ChartVentasDiarias";

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

interface Order {
  id: string;
  date: Timestamp; // Usar el tipo Timestamp de Firestore
  canalVenta: string;
  clienteId: string;
  lastState: string;
  note: string;
  numberOrder: number;
  status: string;
  total: number;
  // Agrega aquí otras propiedades según sea necesario
}

// Define la interfaz para los datos del gráfico
interface ChartData {
  date: string; // Fecha en formato ISO
  orders: number; // Cantidad de órdenes
  label: string; // Nueva propiedad
  value: number; // Nueva propiedad (puede ser la misma que orders si así lo decides)
}

// Define la interfaz para los datos internos
interface OrderChartData {
  date: string;
  orders: number;
}

const TrakeoAlimentosNaturales: React.FC = () => {
  const [chartData, setChartData] = React.useState<OrderChartData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);

  React.useEffect(() => {
    // Define la interfaz para los datos del gráfico incluyendo las propiedades necesarias

    // Modifica la transformación de datos en fetchOrders
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "userOrders"));
      const ordersData: Order[] = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot) => ({
          ...doc.data(),
          id: doc.id,
        })
      ) as Order[];

      setOrders(ordersData);
      console.log(ordersData);

      // Filtrar y agrupar por día
      const groupedData = ordersData.reduce(
        (acc: Record<string, number>, order) => {
          const date = order.date.toDate().toISOString().split("T")[0]; // Convertir Timestamp a fecha
          acc[date] = (acc[date] || 0) + 1; // Contar órdenes por día
          return acc;
        },
        {}
      );

      // Convertir a array y filtrar los últimos 30 días
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setDate(today.getDate() - 30);

      const dataToDisplay: ChartData[] = Object.keys(groupedData)
        .filter((date) => new Date(date) >= lastMonth)
        .map((date) => ({
          date,
          orders: groupedData[date],
          label: `Orders on ${date}`, // Asignar la propiedad 'label'
          value: groupedData[date], // Asignar la propiedad 'value'
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ); // Ordenar por fecha

      setChartData(dataToDisplay);
      setLoading(false);
    };

    fetchOrders();
  }, []);
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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <ChartTotalHistorico orders={orders} />
        <ChartTotalVentas orders={orders} />
        <ChartVentasDiarias orders={orders} />
      </div>
      <div>
        <ChartsOrders chartData={chartData} loading={loading} />
        <ChartVisitas />
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

        <ChartIsLogged />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: isMobile ? "center" : "flex-start",
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
          marginTop: isMobile ? "15rem" : "2rem",
        }}
      >
        <ChartTrakeo />
      </div>
    </div>
  );
};

export default TrakeoAlimentosNaturales;
