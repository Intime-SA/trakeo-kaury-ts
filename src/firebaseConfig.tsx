// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_PUBLIC_APIKEY,
  authDomain: import.meta.env.VITE_PUBLIC_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PUBLIC_PROJECTID,
  storageBucket: import.meta.env.VITE_PUBLIC_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_PUBLIC_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_PUBLIC_APPID,
  measurementId: "G-J431P6P08T",
};

const firebaseConfigTrakeo = {
  apiKey: import.meta.env.VITE_PUBLIC_APIKEY_TRAKEO,
  authDomain: import.meta.env.VITE_PUBLIC_AUTHDOMAIN_TRAKEO,
  projectId: import.meta.env.VITE_PUBLIC_PROJECTID_TRAKEO,
  storageBucket: import.meta.env.VITE_PUBLIC_STORAGEBUCKET_TRAKEO,
  messagingSenderId: import.meta.env.VITE_PUBLIC_MESSAGINGSENDERID_TRAKEO,
  appId: import.meta.env.VITE_PUBLIC_APPID_TRAKEO,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app); // Autenticación para la app principal
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Inicializar la segunda app (Trakeo) con un nombre único
const appTrakeo = !getApps().find((app) => app.name === "trakeo")
  ? initializeApp(firebaseConfigTrakeo, "trakeo")
  : getApp("trakeo");

// Base de datos de la app secundaria (Trakeo)
export const db2 = initializeFirestore(appTrakeo, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Types for user credentials
interface UserCredentials {
  email: string;
  password: string;
}

// Sign in with email and password
export const onSignIn = async ({ email, password }: UserCredentials) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error signing in:", err.message);
      throw err; // Re-throw to handle in the calling function
    }
  }
};

// Log out the user
export const logOut = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("isLogged");
    console.log(
      "Successfully logged out and user info cleared from localStorage."
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error during logout:", err.message);
    }
  }
};

// Google login provider
const googleProvider = new GoogleAuthProvider();

// Login with Google
export const loginGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error during Google login:", err.message);
      throw err;
    }
  }
};

// Sign up a new user
import { FirebaseError } from "firebase/app"; // Importa FirebaseError

export const signUp = async ({ email, password }: UserCredentials) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created:", res);
    return res;
  } catch (err: unknown) {
    if (err instanceof FirebaseError) {
      if (err.code === "auth/email-already-in-use") {
        console.log("Email is already in use");
      } else {
        console.error("Error during sign up:", err.message);
      }
      throw err; // Re-throw to handle in the calling function
    } else if (err instanceof Error) {
      // Manejar otros errores genéricos
      console.error("Unexpected error during sign up:", err.message);
    }
  }
};

// Send password reset email
export const forgotPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent to:", email);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error sending password reset email:", err.message);
      throw err;
    }
  }
};
