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

interface UserActivityData {
  isMobile: boolean;
  ip: string;
}

const defaultData = [
  { deviceType: "Mobile", users: 0, fill: "var(--color-mobile)" },
  { deviceType: "Desktop", users: 0, fill: "var(--color-desktop)" },
];

const chartConfig = {
  users: { label: "Users" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-1))" },
  desktop: { label: "Desktop", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const fetchTrackingData = async (): Promise<UserActivityData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db2, "trakeoKaury"));
    return querySnapshot.docs.map((doc) => doc.data() as UserActivityData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export function ChartsMobile() {
  const [chartData, setChartData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchTrackingData();

        const userCount: { Mobile: number; Desktop: number } = {
          Mobile: 0,
          Desktop: 0,
        };
        const countedIPs = new Set<string>(); // Conjunto para rastrear IPs contadas

        data.forEach((record) => {
          const { isMobile, ip } = record;

          // Solo sumar si la IP no ha sido contada antes
          if (!countedIPs.has(ip)) {
            countedIPs.add(ip); // Marca la IP como contada
            const deviceType = isMobile ? "Mobile" : "Desktop";
            userCount[deviceType] += 1; // Incrementa el conteo por tipo de dispositivo
          }
        });

        const mappedData = [
          {
            deviceType: "Mobile",
            users: userCount.Mobile,
            fill: "var(--color-mobile)",
          },
          {
            deviceType: "Desktop",
            users: userCount.Desktop,
            fill: "var(--color-desktop)",
          },
        ];

        setChartData(mappedData);
      } catch (err) {
        console.log(err);
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
