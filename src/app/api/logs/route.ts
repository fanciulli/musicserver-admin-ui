import { buildMusicServerUrl, buildAdminHeaders, backendFetch } from "@/lib/musicserver-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = new URLSearchParams();

    const id = searchParams.get("id")?.trim().toLowerCase();
    if (id === "main" || id === "fastify") {
      query.set("id", id);
    }

    const level = searchParams.get("level")?.trim().toLowerCase();
    const validLevels = ["trace", "debug", "info", "warn", "error", "fatal"];
    if (level && validLevels.includes(level)) {
      query.set("level", level);
    }

    const from = searchParams.get("from")?.trim();
    if (from) query.set("from", from);

    const to = searchParams.get("to")?.trim();
    if (to) query.set("to", to);

    const page = searchParams.get("page")?.trim();
    if (page) query.set("page", page);

    const limit = searchParams.get("limit")?.trim();
    if (limit) query.set("limit", limit);

    const upstreamPath =
      query.size > 0 ? `/admin/logs?${query.toString()}` : "/admin/logs";

    const response = await backendFetch(buildMusicServerUrl(upstreamPath), {
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
            : "Failed to call musicserver /admin/logs",
      },
      { status: 500 },
    );
  }
}
