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
import { collection, getDocs, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig";

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

// Define la interfaz para las órdenes
import { Timestamp } from "firebase/firestore"; // Asegúrate de importar el tipo correctamente

interface Order {
  id: string;
  date: Timestamp; // Usar el tipo Timestamp de Firestore
  canalVenta: string;
  clienteId: string;
  lastState: string;
  note: string;
  numberOrder: number;
  status: string;
  total: number;
  // Agrega aquí otras propiedades según sea necesario
}

// Define la interfaz para los datos del gráfico
interface ChartData {
  date: string; // Fecha en formato ISO
  orders: number; // Cantidad de órdenes
}

const OrdersChart = () => {
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "userOrders"));
      const ordersData: Order[] = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot) => ({
          ...doc.data(),
          id: doc.id,
        })
      ) as Order[];

      console.log(ordersData);

      // Filtrar y agrupar por día
      const groupedData = ordersData.reduce(
        (acc: Record<string, number>, order) => {
          const date = order.date.toDate().toISOString().split("T")[0]; // Convertir Timestamp a fecha
          acc[date] = (acc[date] || 0) + 1; // Contar órdenes por día
          return acc;
        },
        {}
      );

      // Convertir a array y filtrar los últimos 30 días
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setDate(today.getDate() - 30);

      const dataToDisplay: ChartData[] = Object.keys(groupedData)
        .filter((date) => new Date(date) >= lastMonth)
        .map((date) => ({
          date,
          orders: groupedData[date],
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ); // Ordenar por fecha

      setChartData(dataToDisplay);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <Card style={{ width: "90vw" }}>
      <CardHeader>
        <CardTitle>Órdenes del Último Mes</CardTitle>
        <CardDescription>
          Mostrando la cantidad de órdenes por día
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {loading ? (
          <div>Cargando...</div>
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
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  });
                }}
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
