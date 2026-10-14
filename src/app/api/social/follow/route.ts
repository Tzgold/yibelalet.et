import { NextResponse } from "next/server";
import { getRepository } from "@/data/get-repository";
import { toggleFollow } from "@/lib/social-store";
import { getViewer } from "@/lib/viewer";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { slug?: string } | null;
  const slug = body?.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const repo = getRepository();
  const detail = await repo.getProfileDetail(slug, "30d");
  if (!detail) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const result = await toggleFollow(viewer.id, detail.profile.id);
  return NextResponse.json(result);
}
