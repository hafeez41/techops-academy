import { NextResponse } from "next/server";
import { getMux } from "@/lib/mux";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { uploadId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mux = getMux();
  const upload = await mux.video.uploads.retrieve(params.uploadId);

  if (upload.status === "asset_created" && upload.asset_id) {
    const asset = await mux.video.assets.retrieve(upload.asset_id);
    return NextResponse.json({
      status: asset.status,
      assetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id ?? null,
    });
  }

  return NextResponse.json({ status: upload.status, assetId: null, playbackId: null });
}
