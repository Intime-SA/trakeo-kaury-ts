import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import emailjs from "emailjs-com";
import { useState } from "react";
import { CircularProgress } from "@mui/material";
import Mensaje from "./Mensaje";
import {
  getDeviceInfo,
  getIPAddress,
  saveTrackingData,
} from "./functions/functions";
// Define el esquema de validación
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Nombre de Comercio"),
  telefono: z
    .string()
    .min(1, "Telefono es requerido")
    .refine((value) => !isNaN(Number(value)), {
      message: "Debe ser un número",
    }),
});

// Define el tipo de datos del formulario
type FormData = z.infer<typeof schema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [finaly, setFinaly] = useState(false);
  const [loadingLogo, setLoadingLogo] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    try {
      // Envía el email
      const response = await emailjs.send(
        "service_375g9fs",
        "template_inuczyn",
        {
          from_email: data.email,
          name: data.name,
          telefono: data.telefono,
        },
        "HiZortCAfvLTjje7w"
      );
      console.log("Email sent successfully", response);

      // Obtener deviceInfo e IP
      const deviceInfo = await getDeviceInfo();
      const ipAddress = await getIPAddress();

      // Guardar los datos de tracking en Firebase
      await saveTrackingData({
        ...data,
        deviceInfo,
        ipAddress,
      });

      setFinaly(true);
    } catch (err) {
      console.error("Error sending email or saving tracking data", err);
    } finally {
      setLoading(false);
    }
  };

  if (finaly) {
    return <Mensaje />;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {loadingLogo && (
          <div className="flex justify-center items-center h-96">
            <CircularProgress style={{ height: "100px", width: "100px" }} />
          </div>
        )}
        <img
          alt="Your Company"
          src="https://firebasestorage.googleapis.com/v0/b/mayoristakaurymdp.appspot.com/o/LogoAlimentosNaturales.png?alt=media&token=45601fed-80f7-41fb-9bdb-803017d341bc"
          onLoad={() => setLoadingLogo(false)}
          style={{
            display: loadingLogo ? "none" : "block",
            width: "150px",
            margin: "0 auto",
          }}
          className="block"
        />
        <h2 className="mt-10 text-center text-2xl font-semibold leading-9 tracking-tight text-gray-900">
          Dejanos tus datos para recibir el Catalogo Completo
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900 text-left"
            >
              Email
            </label>
            <div className="mt-2">
              <input
                id="email"
                {...register("email")}
                type="email"
                required
                autoComplete="email"
                className="block w-full rounded-md border-0 py-1.5 pl-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {errors.email && (
                <span className="text-red-600">{errors.email.message}</span>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium leading-6 text-gray-900 text-left"
            >
              Telefono
            </label>
            <div className="mt-2">
              <input
                id="telefono"
                {...register("telefono")}
                type="number"
                required
                autoComplete="telefono"
                className="block w-full rounded-md border-0 py-1.5 pl-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {errors.telefono && (
                <span className="text-red-600">{errors.telefono.message}</span>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900 text-left"
            >
              Nombre Comercio
            </label>
            <div className="mt-2">
              <input
                id="name"
                {...register("name")}
                type="text"
                required
                className="block w-full rounded-md border-0 py-1.5 pl-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {errors.name && (
                <span className="text-red-600">{errors.name.message}</span>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <div className="flex w-full justify-center">
                  <h6 style={{ marginTop: "0.2rem" }}>Descargar catalogo</h6>
                  <span
                    style={{ marginBottom: "0.4rem", marginLeft: "1rem" }}
                    className="material-symbols-outlined"
                  >
                    download
                  </span>
                </div>
              )}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center text-sm text-gray-500">
          Anotate y recibis un codigo de descuento <br />
          <a
            href="#"
            className="font-semibold leading-6 text-green-600 hover:text-green-500"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "1rem",
            }}
          >
            Solicita Oferta (-20% off)
            <span
              style={{ margin: "0.5rem", color: "green" }}
              className="material-symbols-outlined"
            >
              shoppingmode
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
