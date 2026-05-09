importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAr0rxnCdY5lFUyJLyauDUxfhx-9RTMjFk",
  authDomain: "laotms-noti.firebaseapp.com",
  projectId: "laotms-noti",
  storageBucket: "laotms-noti.firebasestorage.app",
  messagingSenderId: "818256918427",
  appId: "1:818256918427:web:bceed94b5807a33643d33e",
  measurementId: "G-4D1SQQTDG7",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "LaoTMS Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    data: payload.data,
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
