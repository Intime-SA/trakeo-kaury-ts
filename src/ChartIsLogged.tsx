"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db2 } from "./firebaseConfig";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Interfaz para los datos de actividad de usuario
interface UserActivity {
  dateTime: string; // Debe estar en formato ISO
  ip: string;
  isLogged: boolean;
  location: string;
  user: {
    email: string;
    rol: string;
  } | null;
  userAgent: string;
}

// Interfaz para los datos del gráfico
interface ChartData {
  status: string;
  count: number;
}

// Configuración del gráfico
const chartConfig = {
  count: {
    label: "Cantidad de Usuarios",
  },
} satisfies ChartConfig;

export function ChartIsLogged() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Función para agrupar los datos por estado de "isLogged"
  const processUserData = (data: UserActivity[]): ChartData[] => {
    const groupedData = {
      loggedIn: 0,
      loggedOut: 0,
    };

    data.forEach((item) => {
      if (item.isLogged) {
        groupedData.loggedIn += 1;
      } else {
        groupedData.loggedOut += 1;
      }
    });

    return [
      { status: "Usuario", count: groupedData.loggedIn },
      { status: "Anonimo", count: groupedData.loggedOut },
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos de la colección "trakeoKaury"
        const querySnapshot = await getDocs(collection(db2, "trakeoKaury"));
        const rawData: UserActivity[] = querySnapshot.docs.map(
          (doc) => doc.data() as UserActivity
        );

        // Filtrar datos para las últimas 24 horas
        const now = new Date();
        const twentyFourHoursAgo = new Date(
          now.getTime() - 24 * 60 * 60 * 1000
        ); // 24 horas atrás

        const recentData = rawData.filter((entry) => {
          const entryDate = new Date(entry.dateTime);
          return entryDate >= twentyFourHoursAgo && entryDate <= now;
        });

        // Procesar los datos para agrupar por estado de "isLogged"
        const processedData = processUserData(recentData);
        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card
      style={{ maxWidth: "375px", marginBottom: "1rem", marginTop: "1rem" }}
    >
      <CardHeader>
        <CardTitle>Estado de Sesión de Usuarios</CardTitle>
        <CardDescription>
          Usuarios navegan Logeados o Anonimos{" "}
          <span style={{ fontWeight: "100" }}> - (ultimas 24hs)</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="status" />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel hideIndicator />}
            />
            <Bar dataKey="count">
              <LabelList position="top" dataKey="count" fillOpacity={1} />
              {chartData.map((item) => (
                <Cell
                  key={item.status}
                  fill={
                    item.status === "Usuario"
                      ? "hsl(var(--chart-1))"
                      : "hsl(var(--chart-2))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Usuario anonimo se traduce en cliente nuevo
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando el estado de sesión de usuarios en dos grupos
        </div>
      </CardFooter>
    </Card>
  );
}
