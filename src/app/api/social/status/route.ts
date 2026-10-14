import { NextResponse } from "next/server";
import { getRepository } from "@/data/get-repository";
import { getSocialStatus } from "@/lib/social-store";
import { getViewer } from "@/lib/viewer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const repo = getRepository();
  const detail = await repo.getProfileDetail(slug, "30d");
  if (!detail) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const viewer = await getViewer();
  const status = await getSocialStatus(viewer?.id ?? null, detail.profile.id);
  return NextResponse.json(status);
}
