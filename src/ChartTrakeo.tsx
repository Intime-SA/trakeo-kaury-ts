"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
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
  dateTime: string;
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
  abbreviation: string;
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

const generateRandomColor = (): string => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

const generateAbbreviation = (location: string): string => {
  const commaIndex = location.indexOf(",");
  if (commaIndex !== -1) {
    location = location.substring(0, commaIndex).trim();
  }

  const words = location.split(" ");

  if (words.length === 1) {
    // Si es una sola palabra, toma las dos primeras letras
    return location.substring(0, 2).toUpperCase();
  } else {
    // Si son múltiples palabras, toma la primera letra de cada una
    return words.map((word) => word[0].toUpperCase()).join("");
  }
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
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentData = data.filter((entry) => {
      const entryDate = new Date(entry.dateTime);
      return entryDate >= twentyFourHoursAgo && entryDate <= now;
    });

    recentData.forEach((entry) => {
      const { location } = entry;
      if (location) {
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });

    return Object.entries(locationCounts)
      .map(([location, count]) => ({
        location,
        abbreviation: generateAbbreviation(location),
        count,
        fill: generateRandomColor(),
      }))
      .sort((a, b) => b.count - a.count); // Ordenar de mayor a menor
  };

  const chartHeight = Math.max(300, chartData.length * 40); // Altura mínima de 300px, o 40px por cada dato

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle>Estadísticas por Localidad</CardTitle>
        <CardDescription>
          Distribución de usuarios por localidad -{" "}
          <span className="font-light">(últimas 24hs)</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ height: `${chartHeight}px` }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 60, right: 20, top: 20, bottom: 20 }}
            >
              <YAxis
                dataKey="abbreviation"
                type="category"
                tickLine={false}
                axisLine={false}
                width={1}
              />
              <XAxis dataKey="count" type="number" hide />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { location, count } = payload[0].payload;
                    return (
                      <div className="bg-background border border-border p-2 rounded-md shadow-md">
                        <p className="font-medium">{location}</p>
                        <p className="text-sm text-muted-foreground">
                          Visitas: {count}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                layout="vertical"
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
