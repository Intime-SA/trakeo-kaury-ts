"use client";

import { useEffect, useState } from "react";
import { Pie, PieChart, Label, Sector } from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { useMediaQuery } from "@mui/material";
import { db2 } from "./firebaseConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

// Interfaz para tipar los datos de Firestore
interface UserActivityData {
  isMobile: boolean; // Para capturar otros campos que no estamos usando
}

// Simulación de los datos que obtendrás desde la base de datos
const defaultData = [
  { deviceType: "Mobile", users: 0, fill: "var(--color-mobile)" },
  { deviceType: "Desktop", users: 0, fill: "var(--color-desktop)" },
];

// Configuración de los colores y etiquetas del gráfico
const chartConfig = {
  users: { label: "Users" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-1))" },
  desktop: { label: "Desktop", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

// Función para obtener los datos desde Firebase Firestore
async function fetchTrackingData(): Promise<UserActivityData[]> {
  try {
    const querySnapshot = await getDocs(collection(db2, "trakeoKaury")); // Colección en Firestore
    const data = querySnapshot.docs.map(
      (doc) => doc.data() as UserActivityData
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

export function ChartsMobile() {
  const [chartData, setChartData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchTrackingData();

        // Procesa los datos recibidos para adaptarlos al gráfico
        const mappedData = data.reduce(
          (acc, record) => {
            const { isMobile } = record;
            if (isMobile) {
              acc[0].users += 1; // Mobile
            } else {
              acc[1].users += 1; // Desktop
            }
            return acc;
          },
          [...defaultData]
        );

        setChartData(mappedData);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading chart data...</p>;
  if (error) return <p>Error loading chart data.</p>;

  const totalUsers = chartData.reduce((sum, item) => sum + item.users, 0);

  return (
    <Card
      className="flex flex-col"
      style={{
        width: "100%",
        marginTop: "1rem",
        marginRight: isMobile ? "0rem" : "1rem",
      }}
    >
      <CardHeader className="items-center pb-0">
        <CardTitle>Mobile vs Desktop Users</CardTitle>
        <CardDescription>Data for September 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="users"
              nameKey="deviceType"
              innerRadius={60}
              outerRadius={80}
              labelLine={false}
              fill="#8884d8"
            >
              {chartData.map((entry, index) => (
                <Sector
                  key={`sector-${index}`}
                  fill={entry.fill}
                  strokeWidth={5}
                />
              ))}
              <Label
                value={totalUsers.toLocaleString()}
                position="center"
                className="text-3xl font-bold fill-foreground"
              />
              <Label
                value=""
                position="center"
                className="text-xs fill-muted-foreground"
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
