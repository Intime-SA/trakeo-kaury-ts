"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

const chartConfig = {
  views: {
    label: "Órdenes ",
  },
  orders: {
    label: "",
    color: "hsl(var(--chart-1))",
  },
};

interface ChartData {
  date: string;
  orders: number;
  label?: string;
  uniqueIPs?: number;
}

interface ChildComponentProps {
  chartData: ChartData[];
  loading: boolean;
}

const OrdersChart: React.FC<ChildComponentProps> = ({ chartData, loading }) => {
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    const zonedDate = toZonedTime(date, "America/Argentina/Buenos_Aires");
    return format(zonedDate, "d MMM", { locale: es });
  };

  return (
    <Card style={{ marginTop: "1rem" }}>
      {loading ? (
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
      ) : (
        <CardHeader>
          <CardTitle>Órdenes del Último Mes</CardTitle>
          <CardDescription>
            Mostrando la cantidad de órdenes por día
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className="px-2 sm:p-6">
        {loading ? (
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <ChartTooltip
                content={<ChartTooltipContent nameKey="orders" />}
                cursor={{ fill: "transparent" }}
              />
              <Bar dataKey="orders" fill="#4a90e2" isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersChart;
