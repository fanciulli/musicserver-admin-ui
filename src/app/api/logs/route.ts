import { buildMusicServerUrl } from "@/lib/musicserver-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim().toLowerCase();
    const query = new URLSearchParams();

    if (id === "main" || id === "fastify") {
      query.set("id", id);
    }

    const upstreamPath =
      query.size > 0 ? `/admin/logs?${query.toString()}` : "/admin/logs";

    const response = await fetch(buildMusicServerUrl(upstreamPath), {
      cache: "no-store",
      headers: {
        Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
      },
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to call musicserver /admin/logs",
      },
      { status: 500 },
    );
  }
}
