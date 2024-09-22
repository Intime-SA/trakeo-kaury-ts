import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Label } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { db } from "./firebaseConfig";

interface User {
  datosEnvio?: {
    provincia?: string;
  };
}

export const ChartUsers: React.FC = () => {
  const [userData, setUserData] = React.useState<{
    totalUsers: number;
    usersByProvince: Record<string, number>;
  }>({
    totalUsers: 0,
    usersByProvince: {},
  });

  React.useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      let totalUsers = 0;
      const provinceCounts: Record<string, number> = {};

      querySnapshot.forEach((doc) => {
        const user = doc.data() as User;
        totalUsers += 1;

        // Normalizar el nombre de la provincia
        const province = user?.datosEnvio?.provincia?.trim().toLowerCase(); // Convertir a minúsculas
        if (province) {
          // Agrupar variantes bajo una misma clave
          const normalizedProvince = province.replace(/\s+/g, " "); // Eliminar espacios innecesarios
          provinceCounts[normalizedProvince] =
            (provinceCounts[normalizedProvince] || 0) + 1;
        }
      });

      setUserData({
        totalUsers,
        usersByProvince: provinceCounts,
      });
    };

    fetchUsers();
  }, []);

  // Convertir usersByProvince a un arreglo que pueda ser usado en el chart
  // Convertir usersByProvince a un arreglo, ordenarlo alfabéticamente, y luego mapear para el chart
  const chartData = Object.entries(userData.usersByProvince)
    .sort(([provinceA], [provinceB]) => provinceA.localeCompare(provinceB)) // Ordenar alfabéticamente
    .map(([province, count]) => {
      // Normalizar el nombre de la provincia
      const normalizedProvince = province.toLowerCase().replace(/\s+/g, "-");

      // Establecer el color según la provincia
      const fillColor =
        normalizedProvince === "buenos-aires"
          ? "var(--color-buenos-aires)"
          : `var(--color-${normalizedProvince})`; // Colores dinámicos según la provincia

      return {
        province,
        count,
        fill: fillColor,
      };
    });

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card style={{ width: "100%", maxWidth: "450px", marginBottom: "1rem" }}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Usuarios por Provincia</CardTitle>
        <CardDescription>
          Datos de usuarios agrupados por provincia
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="province"
              innerRadius={60}
              strokeWidth={5}
            >
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {userData.totalUsers.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Usuarios
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Usuarios agrupados por provincia <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChartUsers;
