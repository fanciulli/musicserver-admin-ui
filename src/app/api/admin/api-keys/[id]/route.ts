import { buildMusicServerUrl } from "@/lib/musicserver-api";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const response = await fetch(
      buildMusicServerUrl(`/admin/api-keys/${encodeURIComponent(id)}`),
      { method: "DELETE", cache: "no-store" },
    );
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete API key" },
      { status: 500 },
    );
  }
}
