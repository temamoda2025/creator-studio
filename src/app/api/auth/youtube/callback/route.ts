import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const origin = req.nextUrl.origin;

  if (searchParams.get("error") || !code || !state) {
    return NextResponse.redirect(`${origin}/dashboard?social_error=youtube`);
  }

  let brandId: string;
  try {
    brandId = JSON.parse(Buffer.from(state, "base64url").toString()).brandId;
  } catch {
    return NextResponse.redirect(`${origin}/dashboard?social_error=youtube`);
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    }).toString(),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/dashboard?social_error=youtube`);
  }

  const tokenData = await tokenRes.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  // Fetch YouTube channel info
  let channelId: string | null = null;
  let channelHandle: string | null = null;
  const chRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );
  if (chRes.ok) {
    const chData = await chRes.json() as {
      items?: Array<{ id: string; snippet: { title: string; customUrl?: string } }>;
    };
    const ch = chData.items?.[0];
    if (ch) {
      channelId = ch.id;
      channelHandle = ch.snippet.customUrl ?? ch.snippet.title;
    }
  }

  await supabase.from("social_connections").upsert(
    {
      brand_id: brandId,
      platform: "youtube",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      platform_user_id: channelId,
      platform_username: channelHandle,
      expires_at: expiresAt,
    },
    { onConflict: "brand_id,platform" }
  );

  return NextResponse.redirect(`${origin}/dashboard?social_connected=youtube`);
}
