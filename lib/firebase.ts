import { initializeApp, getApps } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAr0rxnCdY5lFUyJLyauDUxfhx-9RTMjFk",
  authDomain: "laotms-noti.firebaseapp.com",
  projectId: "laotms-noti",
  storageBucket: "laotms-noti.firebasestorage.app",
  messagingSenderId: "818256918427",
  appId: "1:818256918427:web:bceed94b5807a33643d33e",
  measurementId: "G-4D1SQQTDG7",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const getFirebaseMessaging = async () => {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};

export { app };
