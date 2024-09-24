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

// Configuración del gráfico
const chartConfig = {
  views: {
    label: "Órdenes ",
  },
  orders: {
    label: "",
    color: "hsl(var(--chart-1))",
  },
};

import { Skeleton } from "./components/ui/skeleton";
import { SkeletonDemo, SkeletonPieCard } from "./SkeletonLine";

interface ChartData {
  date: string; // Fecha en formato ISO
  orders: number;
  label?: string; // Hacer que sea opcional si no siempre se proporciona
}

interface ChildComponentProps {
  chartData: ChartData[];
  loading: boolean;
}

const OrdersChart: React.FC<ChildComponentProps> = ({ chartData, loading }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1); // Add one day to the date
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    });
  };

  const adjustedChartData = chartData.map((item) => ({
    ...item,
    adjustedDate: new Date(item.date),
  }));

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
              data={adjustedChartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="adjustedDate" tickFormatter={formatDate} />
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
