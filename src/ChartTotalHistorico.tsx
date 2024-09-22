"use client";

import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Timestamp } from "firebase/firestore";

// Configuración del gráfico
const chartConfig = {
  visitors: {
    label: "Ventas",
  },
  total: {
    label: "Ventas totales",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Order = {
  status: string;
  lastState: string;
  total: number;
  date: Timestamp; // Considera que la fecha es un timestamp
};

// Función para sumar todas las ventas
const sumTotalSales = (orders: Order[]) => {
  let totalSales = 0;

  orders.forEach((order) => {
    const isValidTotal = typeof order.total === "number"; // Verificar que total sea un número
    const isActiveOrder =
      order.status !== "cancelada" &&
      order.status !== "nueva" &&
      order.status !== "archivada";
    const isArchivedOrder =
      (order.status === "archivada" &&
        order.lastState !== "cancelada" &&
        order.lastState !== "nueva" &&
        order.lastState !== "archivada" &&
        order.lastState == "empaquetada") ||
      order.lastState == "enviada" ||
      order.lastState == "pagoRecibido";

    if ((isActiveOrder || isArchivedOrder) && isValidTotal) {
      totalSales += order.total; // Sumar si cumple las condiciones
    }
  });

  return totalSales + 474.92;
};

type Props = {
  orders: Order[];
};

export function ChartTotalHistorico({ orders }: Props) {
  // Calcular el total de ventas
  const totalSales = sumTotalSales(orders);

  const chartData = [
    {
      browser: "Ventas",
      visitors: totalSales, // Asignar el total de ventas al gráfico
      fill: "var(--color-safari)",
    },
  ];

  return (
    <Card
      className="flex flex-col"
      style={{ minWidth: "45vw", margin: "1rem", marginLeft: "1rem" }}
    >
      <CardHeader className="items-center pb-0">
        <CardTitle>Ventas Confirmadas</CardTitle>
        <CardDescription>Historico</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          style={{ width: "100%" }}
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {totalSales.toLocaleString("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          })}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Ventas
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total de ventas acumuladas <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Ventas total historico (01/04/2024)
        </div>
      </CardFooter>
    </Card>
  );
}
