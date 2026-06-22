// TikTok OAuth — redirects to TikTok consent page
//
// Vercel env vars required:
//   TIKTOK_CLIENT_KEY    — Client Key from TikTok Developer Portal
//   TIKTOK_CLIENT_SECRET — Client Secret (same portal)
//   TIKTOK_REDIRECT_URI  — must be registered in:
//                          TikTok Developer Portal → Your App → Login Kit → Redirect URI for Login Kit
//                          Value: https://<your-vercel-domain>/api/auth/tiktok/callback
//
// TikTok Developer Portal: developers.tiktok.com → Manage Apps → Create app → add Login Kit product

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brand_id");
  if (!brandId) return NextResponse.json({ error: "Missing brand_id" }, { status: 400 });

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  if (!clientKey || !redirectUri) {
    return NextResponse.json(
      { error: "TIKTOK_CLIENT_KEY and TIKTOK_REDIRECT_URI must be set in Vercel env vars" },
      { status: 500 }
    );
  }

  const state = Buffer.from(JSON.stringify({ brandId })).toString("base64url");
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: "user.info.basic",
    redirect_uri: redirectUri,
    state,
  });

  return NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  );
}
