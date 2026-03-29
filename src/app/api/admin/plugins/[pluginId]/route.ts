import { buildMusicServerUrl } from "@/lib/musicserver-api";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    pluginId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { pluginId } = await context.params;
    const response = await fetch(
      buildMusicServerUrl(
        `/admin/plugins/${encodeURIComponent(pluginId)}/config`,
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
            : "Failed to call musicserver /admin/plugins/:pluginId",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { pluginId } = await context.params;
    const body = await request.text();
    const response = await fetch(
      buildMusicServerUrl(
        `/admin/plugins/${encodeURIComponent(pluginId)}/config`,
      ),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body,
        cache: "no-store",
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
            : "Failed to call musicserver /admin/plugins/:pluginId/config",
      },
      { status: 500 },
    );
  }
}
