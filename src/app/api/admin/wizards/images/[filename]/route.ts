import {
  buildMusicServerUrl,
  buildAdminHeaders,
  backendFetch,
} from "@/lib/musicserver-api";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;
    const response = await backendFetch(
      buildMusicServerUrl(
        `/admin/wizards/images/${encodeURIComponent(filename)}`,
      ),
      {
        cache: "no-store",
        headers: await buildAdminHeaders(),
      },
    );

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/octet-stream",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load wizard image",
      },
      { status: 500 },
    );
  }
}
