import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRUrl } from "@/lib/upload";

interface AttractionData {
  status: 'draft' | 'pending' | 'approved';
  name_en: string;
  name_la: string;
}

interface SocialFeedPayload {
  s_id: string;
  description: string | null;
  website_link: string | null;
  social_images: any;
  facebook: boolean | null;
  attractions: AttractionData | AttractionData[] | null;
}

// =========================================================================
// HELPER: Publish to Facebook Page (With Layout Sequence & Individual Captions)
// =========================================================================
export async function publishToFacebookPage(
  caption: string, 
  storagePaths: string[], 
  imageCaptions?: string[] // Custom array passed to subtitle individual photos in lightbox view
) {
  const PAGE_ID = process.env.FB_PAGE_ID;
  const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!PAGE_ID || !PAGE_ACCESS_TOKEN) {
    throw new Error("Missing Meta API configuration: FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN is not set.");
  }

  // Exact Layout Order: The element position inside this array dictates the Facebook Feed grid position
  const absoluteUrls = (storagePaths || []).map(path => getRUrl(path));
  console.log("[FB Publish] Target layout order sequence:", absoluteUrls);

  // Pattern A: Text-only feed post
  if (absoluteUrls.length === 0) {
    // console.log("[FB Publish] No images — posting text only.");
    const res = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: caption,
        access_token: PAGE_ACCESS_TOKEN
      })
    });
    const data = await res.json();
    // console.log("[FB Publish] Text post response:", data);
    if (!res.ok) throw new Error(data.error?.message || "Text post failure");
    return data;
  }

  // Pattern B: Single image layout (Full width)
  if (absoluteUrls.length === 1) {
    console.log("[FB Publish] Single image layout presentation.");
    const res = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: absoluteUrls[0],
        message: caption, // Main post body text description
        published: true,
        access_token: PAGE_ACCESS_TOKEN
      })
    });
    const data = await res.json();
    // console.log("[FB Publish] Single photo post response:", data);
    if (!res.ok) throw new Error(data.error?.message || "Single photo post failure");
    return data;
  }

  // Pattern C: Multiple images staged into an organized mosaic template grid layout
  // console.log(`[FB Publish] Staging template grid layout for ${absoluteUrls.length} assets.`);
  const mediaIds = await Promise.all(
    absoluteUrls.map(async (url, index) => {
      console.log(`[FB Publish] Staging image [${index}]:`, url);
      
      // Match a targeted caption for each asset layout position if available
      const individualPhotoCaption = imageCaptions && imageCaptions[index] 
        ? imageCaptions[index] 
        : "";

      const uploadRes = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          published: false,
          temporary: true, 
          target_id: PAGE_ID,
          message: individualPhotoCaption, // Customized description attached within the theater viewer
          access_token: PAGE_ACCESS_TOKEN
        })
      });
      const uploadData = await uploadRes.json();
      // console.log(`[FB Publish] Stage response [${index}]:`, uploadData);
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || `Photo staging failed for: ${url}`);
      return { media_fbid: uploadData.id as string };
    })
  );

  // console.log("[FB Publish] All media staged successfully:", mediaIds);

  // Group staged media IDs into the page timeline feed cleanly
  const postRes = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: caption,
      attached_media: mediaIds, // Displays explicitly in array layout order (index 0 is the layout cover)
      access_token: PAGE_ACCESS_TOKEN
    })
  });
  const postData = await postRes.json();
  // console.log("[FB Publish] Feed grid post response:", postData);
  if (!postRes.ok) throw new Error(postData.error?.message || "Feed post failure");
  return postData;
}

// =========================================================================
// POST ROUTE HANDLER
// =========================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Accept optional custom image captions/subtitles array inside client body payloads
    const { s_id, image_captions } = body; 
    // console.log("[API] /social/publish called with s_id:", s_id);

    if (!s_id) {
      return NextResponse.json(
        { success: false, error: 'Social record ID (s_id) is required.' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database Admin Engine is uninitialized.' },
        { status: 500 }
      );
    }

    const { data, error: dbError } = await supabase
      .from('social')
      .select(`
        s_id,
        description,
        website_link,
        social_images,
        facebook,
        attractions!inner (
          status,
          name_en,
          name_la
        )
      `)
      .eq('s_id', s_id)
      .single();

    // console.log("[API] DB query result:", JSON.stringify(data, null, 2));
    // console.log("[API] DB query error:", dbError);

    if (dbError || !data) {
      return NextResponse.json(
        { success: false, error: dbError?.message || 'Social record not found.' },
        { status: 404 }
      );
    }

    const socialRecord = (data as unknown) as SocialFeedPayload;

    // Handle both object layout or single-item array structures returned by !inner joins
    const attraction = Array.isArray(socialRecord.attractions)
      ? socialRecord.attractions[0]
      : socialRecord.attractions;

    // console.log("[API] Attraction:", attraction);
    // console.log("[API] social.facebook:", socialRecord.facebook);

    if (!attraction) {
      return NextResponse.json(
        { success: false, error: 'No attraction linked to this social record.' },
        { status: 400 }
      );
    }

    if (socialRecord.facebook !== true) {
      return NextResponse.json(
        { success: false, error: 'This social record is not marked for Facebook publishing.' },
        { status: 400 }
      );
    }

    if (attraction.status !== 'approved') {
      return NextResponse.json(
        {
          success: false,
          error: `Blocked: attraction status is '${attraction.status}'. Staff must approve before publishing.`
        },
        { status: 400 }
      );
    }

    let rawImages = socialRecord.social_images;
    // console.log("[API] Raw social_images:", rawImages);
    if (typeof rawImages === 'string') {
      try { rawImages = JSON.parse(rawImages); } catch { rawImages = []; }
    }
    const imagePaths: string[] = Array.isArray(rawImages) ? rawImages : [];
    // console.log("[API] Parsed imagePaths:", imagePaths);

    const headingText = attraction.name_en || attraction.name_la || '';
    let finalCaption = `${headingText}\n\n${socialRecord.description || ''}`.trim();
    if (socialRecord.website_link) {
      finalCaption += `\n\n🔗 ${socialRecord.website_link}`;
    }
    // console.log("[API] Final caption:", finalCaption);

    const fbResult = await publishToFacebookPage(finalCaption, imagePaths, image_captions);
    // console.log("[API] FB result:", fbResult);

    return NextResponse.json(
      { success: true, facebookPostId: fbResult.id || fbResult.post_id },
      { status: 200 }
    );

  } catch (err: any) {
    // console.error('[API] /social/publish fatal error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'An unexpected fatal error occurred.' },
      { status: 500 }
    );
  }
}