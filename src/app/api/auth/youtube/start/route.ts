// YouTube OAuth — redirects to Google consent page
//
// Vercel env vars required:
//   GOOGLE_CLIENT_ID     — from Google Cloud Console OAuth 2.0 credentials
//   GOOGLE_CLIENT_SECRET — same credentials page
//   GOOGLE_REDIRECT_URI  — must be added to "Authorised redirect URIs" in:
//                          Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs
//                          Value: https://<your-vercel-domain>/api/auth/youtube/callback
//
// Google Cloud Console setup:
//   1. cloud.google.com → create/select project
//   2. APIs & Services → Library → enable "YouTube Data API v3"
//   3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
//   4. Application type: Web application
//   5. Add GOOGLE_REDIRECT_URI to Authorised redirect URIs

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brand_id");
  if (!brandId) return NextResponse.json({ error: "Missing brand_id" }, { status: 400 });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI must be set in Vercel env vars" },
      { status: 500 }
    );
  }

  const state = Buffer.from(JSON.stringify({ brandId })).toString("base64url");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
