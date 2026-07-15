import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

// Send push notification via OneSignal
export async function POST(req: NextRequest) {
  try {
    if (!ONESIGNAL_REST_API_KEY || !ONESIGNAL_APP_ID) {
      console.error("Missing OneSignal configuration");
      return NextResponse.json(
        { error: "Server misconfigured: Missing OneSignal API key or App ID" },
        { status: 500 }
      );
    }

    const { userId, title, message, relatedId } = await req.json();

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: userId, title, message" },
        { status: 400 }
      );
    }

    // Verify user is authenticated (optional security check)
    const serverClient = await createSupabaseServerClient();
    const { data: { user: caller } } = await serverClient.auth.getUser();
    
    if (!caller) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Send notification via OneSignal REST API
    const oneSignalRes = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_external_user_ids: [userId], // Use Supabase user ID (from OneSignal.login)
        headings: { en: title },
        contents: { en: message },
        data: {
          notificationId: relatedId || "",
          type: "attraction_update",
        },
      }),
    });

    const oneSignalData = await oneSignalRes.json();

    if (!oneSignalRes.ok) {
      console.error("OneSignal API error:", oneSignalData);
      return NextResponse.json(
        { error: "Failed to send notification", details: oneSignalData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notificationId: oneSignalData.body.notification_uuid,
    });
  } catch (err: any) {
    console.error("Send notification error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
