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

type ChartData = {
  dateTime: string;
  ip: string;
  isLogged: boolean;
  location: string;
  user: null;
  userAgent: string;
};

const chartConfig = {
  views: {
    label: "Page Views",
  },
} satisfies ChartConfig;

const filterRecentIPs = (data: ChartData[]) => {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const uniqueIPs: Record<string, ChartData> = {};

  data.forEach((item) => {
    const recordDate = new Date(item.dateTime);
    if (recordDate > last24Hours) {
      const existingRecord = uniqueIPs[item.ip];
      if (!existingRecord || new Date(existingRecord.dateTime) < recordDate) {
        uniqueIPs[item.ip] = item;
      }
    }
  });

  return Object.values(uniqueIPs);
};

const countUsersByHour = (data: ChartData[]) => {
  const filteredData = filterRecentIPs(data);
  const counts: Record<string, { loggedIn: number; notLoggedIn: number }> = {};
  const now = new Date();
  const currentHour = now.getHours();

  // Initialize counts for the last 24 hours, including the current hour
  for (let i = 24; i > 0; i--) {
    const hour = (currentHour - i + 24) % 24;
    counts[hour] = { loggedIn: 0, notLoggedIn: 0 };
  }

  filteredData.forEach((item) => {
    const date = new Date(item.dateTime);
    const hour = date.getHours();

    if (counts[hour] !== undefined) {
      if (item.isLogged) {
        counts[hour].loggedIn += 1;
      } else {
        counts[hour].notLoggedIn += 1;
      }
    }
  });

  // Transform the object into an array for the chart
  return Object.entries(counts)
    .map(([hour, count]) => ({
      hour: `${hour.padStart(2, "0")}:00`,
      loggedIn: count.loggedIn,
      notLoggedIn: count.notLoggedIn,
    }))
    .sort((a, b) => {
      const hourA = parseInt(a.hour);
      const hourB = parseInt(b.hour);
      return (
        ((hourA - currentHour + 24) % 24) - ((hourB - currentHour + 24) % 24)
      );
    });
};

export function ChartVisitas() {
  const [chartData, setChartData] = React.useState<ChartData[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db2, "trakeoKaury"));
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
              interval={3}
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
                  labelFormatter={(value) => `Hora: ${value}`}
                />
              }
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
