import { buildMusicServerUrl } from "@/lib/musicserver-api";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    albumId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { albumId } = await context.params;
    const response = await fetch(
      buildMusicServerUrl(
        `/admin/db/albums/${encodeURIComponent(albumId)}/songs`,
      ),
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
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
            : "Failed to call musicserver /admin/db/albums/:albumId/songs",
      },
      { status: 500 },
    );
  }
}
