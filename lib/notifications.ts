import { getFirebaseMessaging } from "./firebase";

const VAPID_KEY = "BLOC_w09Eb5jsXGQeD-hscJOI0W_Vk-gzrcSWE1PTahp_Oo64GIfQYTdeFtfKZ1JxuFQ_ixg9Xzp0qUWlk4U0Ek";

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    return registration;
  } catch {
    return null;
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const permission = await requestNotificationPermission();
    if (permission !== "granted") return null;

    await registerServiceWorker();

    const { getToken } = await import("firebase/messaging");
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    return token;
  } catch {
    return null;
  }
}

export async function setupForegroundNotifications(): Promise<void> {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    const { onMessage } = await import("firebase/messaging");
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || "LaoTMS";
      const body = payload.notification?.body || "";
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/icon-192x192.png",
        });
      }
    });
  } catch {
    /* ignore */
  }
}
