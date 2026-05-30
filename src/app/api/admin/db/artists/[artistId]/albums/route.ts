import { buildMusicServerUrl, buildAdminHeaders } from "@/lib/musicserver-api";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    artistId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { artistId } = await context.params;
    const response = await fetch(
      buildMusicServerUrl(
        `/admin/db/artists/${encodeURIComponent(artistId)}/albums`,
      ),
      {
        cache: "no-store",
        headers: await buildAdminHeaders(),
      },
    );

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
            : "Failed to call musicserver /admin/db/artists/:artistId/albums",
      },
      { status: 500 },
    );
  }
}
