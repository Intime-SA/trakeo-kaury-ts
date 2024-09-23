"use client";

import { useEffect, useState } from "react";
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
import { useMediaQuery } from "@mui/material";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonDemo, SkeletonPieCard } from "./SkeletonLine";

const chartConfig = {
  visitors: {
    label: "Ventas",
  },
  safari: {
    label: "Ventas acumuladas",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Order = {
  status: string;
  total: number;
  date: Timestamp;
  lastState: string;
};

const sumSalesLastMonth = (orders: Order[]) => {
  let totalSales = 0;
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate);
  thirtyDaysAgo.setDate(currentDate.getDate() - 30);

  orders.forEach((order) => {
    const orderDate = order.date.toDate();
    const total = order.total;

    if (orderDate >= thirtyDaysAgo) {
      if (
        order.status !== "cancelada" &&
        order.status !== "nueva" &&
        order.status !== "archivada"
      ) {
        totalSales += total;
      } else if (
        (order.status === "archivada" && order.lastState === "enviada") ||
        order.lastState === "empaquetada" ||
        order.lastState === "pagoRecibido"
      ) {
        totalSales += total;
      }
    }
  });

  return totalSales;
};

type Props = {
  orders: Order[];
};

export function ChartTotalVentas({ orders }: Props) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [totalSales, setTotalSales] = useState<number | null>(null); // Cambiado a null para facilitar el control de carga

  useEffect(() => {
    const calculateTotalSales = () => {
      const total = sumSalesLastMonth(orders);
      setTotalSales(total);
    };

    if (orders.length > 0) {
      calculateTotalSales();
    }
  }, [orders]);

  const chartData =
    totalSales !== null
      ? [
          {
            browser: "Ventas",
            visitors: totalSales,
            fill: "var(--color-safari)",
          },
        ]
      : [];

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
        {!totalSales ? (
          <SkeletonDemo />
        ) : (
          <>
            <CardTitle>Ventas confirmadas</CardTitle>
            <CardDescription>últimos 30 días</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totalSales === null ? ( // Cambia a null para mostrar el skeleton
          <Skeleton className="h-[250px] w-full rounded-xl" />
        ) : (
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
                            className="fill-foreground text-2xl font-bold"
                          >
                            {totalSales.toLocaleString("es-AR", {
                              style: "currency",
                              currency: "ARS",
                            })}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-sm"
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
        )}
      </CardContent>
      {!totalSales ? (
        <CardFooter className="flex-col gap-2 text-sm">
          <SkeletonPieCard />
        </CardFooter>
      ) : (
        <>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Total de ventas acumuladas <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Ventas del último mes
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
