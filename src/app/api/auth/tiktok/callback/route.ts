import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const origin = req.nextUrl.origin;

  if (searchParams.get("error") || !code || !state) {
    return NextResponse.redirect(`${origin}/dashboard?social_error=tiktok`);
  }

  let brandId: string;
  try {
    brandId = JSON.parse(Buffer.from(state, "base64url").toString()).brandId;
  } catch {
    return NextResponse.redirect(`${origin}/dashboard?social_error=tiktok`);
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
    }).toString(),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/dashboard?social_error=tiktok`);
  }

  const tokenData = await tokenRes.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    open_id: string;
  };

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  // Fetch display name
  let username: string | null = null;
  const userRes = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );
  if (userRes.ok) {
    const userData = await userRes.json() as {
      data?: { user?: { display_name?: string } };
    };
    username = userData.data?.user?.display_name ?? null;
  }

  await supabase.from("social_connections").upsert(
    {
      brand_id: brandId,
      platform: "tiktok",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      platform_user_id: tokenData.open_id,
      platform_username: username,
      expires_at: expiresAt,
    },
    { onConflict: "brand_id,platform" }
  );

  return NextResponse.redirect(`${origin}/dashboard?social_connected=tiktok`);
}
