import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getMux } from "@/lib/mux";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const webhookSecret = process.env.MUX_WEBHOOK_SECRET;

  if (webhookSecret) {
    try {
      const mux = getMux();
      mux.webhooks.verifySignature(body, req.headers, webhookSecret);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const event = JSON.parse(body) as {
    type: string;
    data?: { id?: string; duration?: number };
  };

  if (event.type === "video.asset.ready") {
    const assetId = event.data?.id;
    const duration = event.data?.duration;

    if (assetId && duration) {
      const supabase = createServiceClient();
      const { error } = await supabase
        .from("lessons")
        .update({ duration_seconds: Math.round(duration) })
        .eq("mux_asset_id", assetId);
      if (error) console.error("[mux-webhook] Failed to update duration:", error.message);
    }
  }

  return NextResponse.json({ received: true });
}
