import { buildMusicServerUrl, buildAdminHeaders } from "@/lib/musicserver-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(buildMusicServerUrl("/admin/db/summary"), {
      cache: "no-store",
      headers: await buildAdminHeaders(),
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to call musicserver /admin/db/summary",
      },
      { status: 500 },
    );
  }
}
