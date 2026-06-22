import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brand_id");
  if (!brandId) return NextResponse.json({ error: "Missing brand_id" }, { status: 400 });

  const { data, error } = await supabase
    .from("social_connections")
    .select("id, platform, platform_user_id, platform_username, connected_at, expires_at")
    .eq("brand_id", brandId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ connections: data ?? [] });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from("social_connections")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
