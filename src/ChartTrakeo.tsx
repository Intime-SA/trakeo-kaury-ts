"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { getDocs, collection } from "firebase/firestore";
import { db2 } from "./firebaseConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

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

interface ChartData {
  location: string;
  abbreviation: string; // Nueva propiedad para las siglas
  count: number;
  fill: string;
}

type ChartConfigType = {
  [key: string]: {
    label: string;
    color?: string;
  };
};

const chartConfig: ChartConfigType = {
  visitors: {
    label: "Visitors",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
};

// Función para generar un color aleatorio en formato hex
const generateRandomColor = (): string => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

// Función para generar las siglas de una localidad (primeras letras de cada palabra)
const generateAbbreviation = (location: string): string => {
  return location
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("");
};

export function ChartTrakeo() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db2, "trakeoKaury"));
        const rawData: UserActivity[] = querySnapshot.docs.map(
          (doc) => doc.data() as UserActivity
        );

        const processedData = processLocationData(rawData);
        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchData();
  }, []);

  const processLocationData = (data: UserActivity[]): ChartData[] => {
    const locationCounts: Record<string, number> = {};
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 horas atrás

    // Filtrar datos para las últimas 24 horas
    const recentData = data.filter((entry) => {
      const entryDate = new Date(entry.dateTime);
      return entryDate >= twentyFourHoursAgo && entryDate <= now;
    });

    // Procesar los datos para contar la cantidad de registros por localidad
    recentData.forEach((entry) => {
      const { location } = entry;

      if (location) {
        // Incrementar el contador para esta localidad sin normalización
        if (locationCounts[location]) {
          locationCounts[location]++;
        } else {
          locationCounts[location] = 1;
        }
      }
    });

    // Convertir los datos en un formato que pueda ser usado por el gráfico
    return Object.entries(locationCounts).map(([location, count]) => ({
      location,
      abbreviation: generateAbbreviation(location), // Generar siglas para cada localidad
      count,
      fill: generateRandomColor(), // Asignar un color aleatorio a cada localidad
    }));
  };

  return (
    <Card style={{ width: "100%", maxWidth: "450px", marginBottom: "1rem" }}>
      <CardHeader>
        <CardTitle>Estadísticas por Localidad</CardTitle>
        <CardDescription>
          Distribución de usuarios por localidad -{" "}
          <span style={{ fontWeight: "100" }}>(ultimas 24hs)</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
            <YAxis
              dataKey="abbreviation" // Mostrar las siglas en el eje Y
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={10}
              height={9000}
            />
            <XAxis dataKey="count" type="number" hide />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const { location, count } = payload[0].payload;
                  return (
                    <div className="custom-tooltip">
                      <p>{`${count}, ${location}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" layout="vertical" radius={5}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Estadísticas basadas en visitas a la WEB{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando la distribución de usuarios por localidad.
        </div>
      </CardFooter>
    </Card>
  );
}
