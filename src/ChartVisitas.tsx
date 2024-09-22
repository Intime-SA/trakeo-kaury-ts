"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { collection, getDocs } from "firebase/firestore";
import { db2 } from "./firebaseConfig";

// Definición del tipo para los datos del gráfico
type ChartData = {
  dateTime: string;
  ip: string;
  isLogged: boolean;
  location: string;
  user: null;
  userAgent: string;
};

// Configuración del gráfico
const chartConfig = {
  views: {
    label: "Page Views",
  },
} satisfies ChartConfig;

// Función para contar usuarios por hora
const countUsersByHour = (data: ChartData[]) => {
  const counts: Record<string, { loggedIn: number; notLoggedIn: number }> = {};

  data.forEach((item) => {
    const date = new Date(item.dateTime);
    const hour = date.getHours(); // Solo obtener la hora

    if (!counts[hour]) {
      counts[hour] = { loggedIn: 0, notLoggedIn: 0 };
    }

    if (item.isLogged) {
      counts[hour].loggedIn += 1; // Aumenta el contador si el usuario está logueado
    } else {
      counts[hour].notLoggedIn += 1; // Aumenta el contador si el usuario no está logueado
    }
  });

  // Transformar el objeto en un array para el gráfico
  return Object.entries(counts)
    .map(([hour, count]) => ({
      hour: `${hour}:00`, // Formato "HH:00"
      loggedIn: count.loggedIn,
      notLoggedIn: count.notLoggedIn,
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour)); // Ordenar por hora
};

export function ChartVisitas() {
  const [chartData, setChartData] = React.useState<ChartData[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db2, "trakeoKaury")); // Ajusta el nombre de la colección
      const data = querySnapshot.docs.map((doc) => doc.data() as ChartData);
      setChartData(data);
    };

    fetchData();
  }, []);

  const userCountsByHour = React.useMemo(
    () => countUsersByHour(chartData),
    [chartData]
  );

  return (
    <Card style={{ marginTop: "1rem" }}>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Estadisticas en vivo</CardTitle>
          <CardDescription>
            Usuarios logeados y anonimos en las ultimas 24hs
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart data={userCountsByHour} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Line
              type="monotone"
              dataKey="loggedIn"
              stroke="#8884d8"
              name="Logeados "
            />
            <Line
              type="monotone"
              dataKey="notLoggedIn"
              stroke="#82ca9d"
              name="Anonimos "
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="count"
                  labelFormatter={(value) => `Hour: ${value}`}
                />
              }
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
