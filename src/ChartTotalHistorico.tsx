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
  total: {
    label: "Ventas totales",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Order = {
  status: string;
  lastState: string;
  total: number;
  date: Timestamp;
};

const sumTotalSales = (orders: Order[]) => {
  let totalSales = 0;

  orders.forEach((order) => {
    const isValidTotal = typeof order.total === "number";
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
      totalSales += order.total;
    }
  });

  return totalSales;
};

type Props = {
  orders: Order[];
};

export function ChartTotalHistorico({ orders }: Props) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const calculateTotalSales = () => {
      const calculatedTotalSales = sumTotalSales(orders);
      setTotalSales(calculatedTotalSales);
    };

    const timer = setTimeout(calculateTotalSales, 1000);

    return () => clearTimeout(timer);
  }, [orders]);

  const chartData = [
    {
      browser: "Ventas",
      visitors: totalSales,
      fill: "var(--color-safari)",
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
      {!totalSales ? (
        <CardHeader className="items-center pb-0">
          <SkeletonDemo />
        </CardHeader>
      ) : (
        <CardHeader className="items-center pb-0">
          <CardTitle>Ventas Confirmadas</CardTitle>
          <CardDescription>Historico</CardDescription>
        </CardHeader>
      )}

      <CardContent className="flex-1 pb-0">
        {!totalSales ? (
          <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
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
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
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
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Total de ventas acumuladas <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Ventas total historico (01/04/2024)
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
