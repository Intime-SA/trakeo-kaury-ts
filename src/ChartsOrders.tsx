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
    label: "Órdenes por Día + ",
    color: "hsl(var(--chart-1))",
  },
};

import { CircularProgress } from "@mui/material";

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
  // Convertir fechas de Firebase a la zona horaria local
  const convertToLocalTime = (dateString: string) => {
    const date = new Date(dateString); // Crear objeto Date a partir de la cadena ISO
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card style={{ marginTop: "1rem" }}>
      <CardHeader>
        <CardTitle>Órdenes del Último Mes</CardTitle>
        <CardDescription>
          Mostrando la cantidad de órdenes por día
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {loading ? (
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <CircularProgress />
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
              <XAxis
                dataKey="date"
                tickFormatter={(value) => convertToLocalTime(value)}
              />
              <ChartTooltip
                content={<ChartTooltipContent nameKey="orders" />}
              />
              <Bar dataKey="orders" fill="#4a90e2" /> {/* Azul claro */}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersChart;
