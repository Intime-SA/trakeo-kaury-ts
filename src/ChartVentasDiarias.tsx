"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Timestamp } from "firebase/firestore";

type Order = {
  status: string;
  total: number;
  date: Timestamp;
  lastState: string;
};

const sumSalesToday = (orders: Order[]) => {
  let totalSales = 0;

  // Paso 1: Obtener la fecha más reciente
  const lastOrderDate = orders
    .map((order) => order.date.toDate())
    .reduce(
      (latest, current) => (current > latest ? current : latest),
      new Date(0)
    );

  // Paso 2: Filtrar las órdenes del último día
  const filteredOrders = orders.filter((order) => {
    const orderDate = order.date.toDate();
    orderDate.setHours(0, 0, 0, 0);
    lastOrderDate.setHours(0, 0, 0, 0); // Comparar solo la fecha, no la hora

    return orderDate.getTime() === lastOrderDate.getTime();
  });

  // Paso 3: Calcular las ventas totales del último día
  filteredOrders.forEach((order) => {
    const total = parseFloat(order.total.toString());

    if (order.status !== "cancelada" && order.status !== "archivada") {
      totalSales += total;
    }
  });

  return totalSales;
};

type Props = {
  orders: Order[];
};

export function ChartVentasDiarias({ orders }: Props) {
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const calculatedTotalSales = sumSalesToday(orders);
    setTotalSales(calculatedTotalSales);
  }, [orders]);

  const chartData = [
    {
      name: "Ventas",
      value: totalSales,
      fill: "var(--chart-2)",
    },
  ];

  return (
    <Card
      className="flex flex-col"
      style={{
        width: "100%",
        marginTop: "1rem",
      }}
    >
      <CardHeader className="items-center pb-0">
        <CardTitle>Ordenes de venta</CardTitle>
        <CardDescription>del día de hoy</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto aspect-square max-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={chartData}
              startAngle={0}
              endAngle={250}
              innerRadius="80%"
              outerRadius="100%"
            >
              <PolarGrid gridType="circle" />
              <PolarRadiusAxis tick={false} axisLine={false} tickLine={false} />
              <RadialBar dataKey="value" cornerRadius={10} background />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-4xl font-bold"
              >
                {totalSales.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total de ventas del día <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Confirmadas y no confirmadas
        </div>
      </CardFooter>
    </Card>
  );
}
