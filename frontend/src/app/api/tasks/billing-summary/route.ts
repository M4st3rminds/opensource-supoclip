import { NextResponse } from "next/server";

import { maxVideoUploadBytes } from "@/lib/video-upload";

/**
 * Static, permissive billing summary for this local self-hosted build.
 * Monetization is off, so every task can be created and the only caps are the
 * configured upload size and source duration limits (not plan paywalls).
 */
export async function GET() {
  return NextResponse.json({
    monetization_enabled: false,
    plan: "self_host",
    subscription_status: "active",
    subscription_provider: null,
    cancel_at: null,
    period_end: null,
    usage_count: 0,
    usage_limit: null,
    remaining: null,
    usage_minutes: 0,
    minute_limit: null,
    remaining_minutes: null,
    output_short_side: null,
    legacy_hd: false,
    billing_interval: null,
    can_schedule_posts: true,
    can_create_task: true,
    upgrade_required: false,
    reason: null,
    max_youtube_duration_seconds: 5400,
    max_upload_duration_seconds: 5400,
    max_upload_bytes: maxVideoUploadBytes(),
  });
}
