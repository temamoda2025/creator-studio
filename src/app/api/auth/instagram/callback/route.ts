import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const origin = req.nextUrl.origin;

  if (searchParams.get("error") || !code || !state) {
    return NextResponse.redirect(`${origin}/dashboard?social_error=instagram`);
  }

  let brandId: string;
  try {
    brandId = JSON.parse(Buffer.from(state, "base64url").toString()).brandId;
  } catch {
    return NextResponse.redirect(`${origin}/dashboard?social_error=instagram`);
  }

  // Exchange code for short-lived token
  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: process.env.META_REDIRECT_URI!,
      code,
    }).toString(),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/dashboard?social_error=instagram`);
  }

  const { access_token: shortToken, user_id } = await tokenRes.json() as {
    access_token: string;
    user_id: number;
  };

  // Exchange for long-lived token (~60-day expiry)
  let accessToken = shortToken;
  let expiresAt: string | null = null;
  const llRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.META_APP_SECRET}&access_token=${shortToken}`
  );
  if (llRes.ok) {
    const ll = await llRes.json() as { access_token: string; expires_in: number };
    accessToken = ll.access_token;
    if (ll.expires_in) {
      expiresAt = new Date(Date.now() + ll.expires_in * 1000).toISOString();
    }
  }

  // Fetch username
  let username: string | null = null;
  const meRes = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
  );
  if (meRes.ok) {
    const me = await meRes.json() as { id: string; username: string };
    username = me.username ?? null;
  }

  await supabase.from("social_connections").upsert(
    {
      brand_id: brandId,
      platform: "instagram",
      access_token: accessToken,
      platform_user_id: String(user_id),
      platform_username: username,
      expires_at: expiresAt,
    },
    { onConflict: "brand_id,platform" }
  );

  return NextResponse.redirect(`${origin}/dashboard?social_connected=instagram`);
}
