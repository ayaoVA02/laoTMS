/**
 * Send a browser push notification via OneSignal
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  message: string,
  relatedId?: string
) {
  try {
    const res = await fetch("/api/notifications/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        title,
        message,
        relatedId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to send notification:", data);
      return { success: false, error: data.error };
    }

    return { success: true, notificationId: data.notificationId };
  } catch (err) {
    console.error("Error calling notification API:", err);
    return { success: false, error: String(err) };
  }
}
