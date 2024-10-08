import React, { useEffect, useState } from "react";
import { Switch } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import ChartUsers from "./ChartUsers";
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
import { ChartsMobile } from "./ChartsMobile";
import { toZonedTime, format } from "date-fns-tz";
import ChartTrakeo from "./ChartTrakeo";
import { addHours } from "date-fns";

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
  date: Timestamp;
  canalVenta: string;
  clienteId: string;
  lastState: string;
  note: string;
  numberOrder: number;
  status: string;
  total: number;
  ipAddress: string;
}

interface ChartData {
  date: string;
  orders: number;
  label?: string;
  uniqueIPs?: number;
}

const TrakeoAlimentosNaturales: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
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

      // Filtrar y agrupar por día y IP
      const groupedData = ordersData.reduce(
        (
          acc: Record<
            string,
            { count: number; ipSet: Set<string>; totalSales: number }
          >,
          order
        ) => {
          // Convertir el Timestamp a UTC, luego a la zona horaria de Argentina
          const utcDate = order.date.toDate();
          console.log(utcDate);
          const buenosAiresDate = addHours(utcDate, 0);
          console.log(buenosAiresDate); // Restar 2 horas para ajustar a Buenos Aires
          const argDate = toZonedTime(
            buenosAiresDate,
            "America/Argentina/Buenos_Aires"
          );
          console.log(argDate);

          const date = format(argDate, "yyyy-MM-dd", {
            timeZone: "America/Argentina/Buenos_Aires",
          });
          console.log(date);

          if (!acc[date]) {
            acc[date] = { count: 0, ipSet: new Set(), totalSales: 0 };
          }

          acc[date].count += 1;
          acc[date].ipSet.add(order.ipAddress);
          acc[date].totalSales += order.total;

          return acc;
        },
        {}
      );

      // Convertir a array y filtrar los últimos 30 días
      const today = toZonedTime(new Date(), "America/Argentina/Buenos_Aires");
      const lastMonth = new Date(today);
      lastMonth.setDate(today.getDate() - 30);

      const dataToDisplay: ChartData[] = Object.keys(groupedData)
        .filter((date) => new Date(date) >= lastMonth)
        .map((date) => ({
          date,
          orders: groupedData[date].count,
          uniqueIPs: groupedData[date].ipSet.size,
          totalSales: groupedData[date].totalSales,
          label: `Órdenes del día ${date}`,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

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
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            marginLeft: isMobile ? "0rem" : "5rem",
          }}
        >
          <img
            src="https://firebasestorage.googleapis.com/v0/b/mayoristakaurymdp.appspot.com/o/Pesta%C3%B1aLogo%2FSinFondoLogo.png?alt=media&token=8a59df40-df50-4c65-8677-43a9fee55622"
            alt="atlantics.dev"
            style={{ width: isMobile ? "50px" : "100px" }}
          />{" "}
          |
          <h1
            style={{
              marginLeft: isMobile ? "1rem" : "5rem",
              fontSize: isMobile ? "0.7rem" : "1.5rem",
              fontWeight: "bold",
              marginRight: "0rem",
            }}
          >
            Estadisticas : <span style={{ fontWeight: "900" }}>Kaury</span>
          </h1>
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
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <ChartVentasDiarias orders={orders} />
        <ChartTotalVentas orders={orders} />
        <ChartTotalHistorico orders={orders} />
      </div>
      <div
        style={{
          width: "100%",
        }}
      >
        <ChartsOrders chartData={chartData} loading={loading} />
        <ChartVisitas />
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: isMobile ? "center" : "space-between",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <ChartUsers />
        <ChartsMobile />
        <ChartIsLogged />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: isMobile ? "center" : "flex-start",
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
        }}
      >
        <ChartTrakeo />
      </div>
    </div>
  );
};

export default TrakeoAlimentosNaturales;
