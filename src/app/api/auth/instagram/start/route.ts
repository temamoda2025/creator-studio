// Instagram OAuth — redirects to Meta/Instagram consent page
//
// Vercel env vars required:
//   META_APP_ID        — Facebook App ID (developers.facebook.com → Your Apps → Basic Settings)
//   META_APP_SECRET    — Facebook App Secret (same page, click "Show")
//   META_REDIRECT_URI  — must be registered in:
//                        Meta App Dashboard → Instagram Basic Display → Valid OAuth Redirect URIs
//                        Value: https://<your-vercel-domain>/api/auth/instagram/callback

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brand_id");
  if (!brandId) return NextResponse.json({ error: "Missing brand_id" }, { status: 400 });

  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;
  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "META_APP_ID and META_REDIRECT_URI must be set in Vercel env vars" },
      { status: 500 }
    );
  }

  const state = Buffer.from(JSON.stringify({ brandId })).toString("base64url");
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: "user_profile,user_media",
    response_type: "code",
    state,
  });

  return NextResponse.redirect(
    `https://api.instagram.com/oauth/authorize?${params.toString()}`
  );
}
