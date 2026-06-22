// Instagram OAuth — redirects to Instagram Login API consent page
//
// Vercel env vars required:
//   INSTAGRAM_APP_ID     — Instagram App ID (developers.facebook.com → Your App → Basic Settings)
//   INSTAGRAM_APP_SECRET — Instagram App Secret (same page, click "Show")
//   INSTAGRAM_REDIRECT_URI — must be registered in:
//                            Meta App Dashboard → Instagram → Instagram Login → Valid OAuth Redirect URIs
//                            Value: https://<your-vercel-domain>/api/auth/instagram/callback
//
// Obsolete (Instagram Basic Display API — retired 2024): META_APP_ID, META_APP_SECRET, META_REDIRECT_URI

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brand_id");
  if (!brandId) return NextResponse.json({ error: "Missing brand_id" }, { status: 400 });

  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "INSTAGRAM_APP_ID and INSTAGRAM_REDIRECT_URI must be set in Vercel env vars" },
      { status: 500 }
    );
  }

  const state = Buffer.from(JSON.stringify({ brandId })).toString("base64url");
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: "instagram_business_basic,instagram_business_manage_messages,instagram_business_content_publish",
    response_type: "code",
    state,
  });

  return NextResponse.redirect(
    `https://www.instagram.com/oauth/authorize?${params.toString()}`
  );
}
