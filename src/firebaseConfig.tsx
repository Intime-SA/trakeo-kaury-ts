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

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC82Xmj6-MfN1lpnmabdANaU4c9ZNjpPh4",
  authDomain: "mayoristakaurymdp.firebaseapp.com",
  projectId: "mayoristakaurymdp",
  storageBucket: "mayoristakaurymdp.appspot.com",
  messagingSenderId: "1059207647185",
  appId: "1:1059207647185:web:e5c8298f7225cd48585af0",
  measurementId: "G-J431P6P08T",
};

const firebaseConfigTrakeo = {
  apiKey: "AIzaSyCIltOqQVKjLm6m4ifQLp0tfolIV0Wjb8w",
  authDomain: "trakeo-93a6e.firebaseapp.com",
  projectId: "trakeo-93a6e",
  storageBucket: "trakeo-93a6e.appspot.com",
  messagingSenderId: "900513744928",
  appId: "1:900513744928:web:dccd3b5e6cd9a68656d445",
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
