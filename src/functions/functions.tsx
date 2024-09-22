import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

export interface DeviceInfo {
  userAgent: string;
  deviceType: string;
  language: string;
  screenResolution: string;
}

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  let deviceType = "unknown";

  // Utiliza navigator.userAgent en lugar de userAgentData
  deviceType = navigator.platform; // O usa una lógica para determinar el tipo de dispositivo

  return {
    userAgent: navigator.userAgent,
    deviceType,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
};

export const getIPAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error al obtener la IP", error);
    return null;
  }
};

export const getLocationFromIP = async (ip: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return data.city || "Localidad no encontrada";
  } catch (error) {
    console.error("Error al obtener la localidad", error);
    return null;
  }
};

export const saveTrackingData = async (formData: any) => {
  const deviceInfo = await getDeviceInfo(); // Asegúrate de usar await
  const ipAddress = await getIPAddress();
  let location = null;

  if (ipAddress) {
    location = await getLocationFromIP(ipAddress);
  }

  const trackingData = {
    ...formData,
    deviceInfo,
    ipAddress,
    location, // Agrega la localidad al objeto de datos
    timestamp: new Date(),
  };

  try {
    await addDoc(collection(db, "trakeoAlimentosNaturales"), trackingData);
    console.log("Datos de tracking guardados exitosamente");
  } catch (error) {
    console.error("Error al guardar los datos de tracking", error);
  }
};
