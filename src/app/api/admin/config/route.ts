import {
  buildMusicServerUrl,
  buildAdminHeaders,
  buildAdminJsonHeaders,
  backendFetch,
} from "@/lib/musicserver-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await backendFetch(buildMusicServerUrl("/admin/config"), {
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
            : "Failed to call musicserver /admin/config",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.text();

    const response = await backendFetch(buildMusicServerUrl("/admin/config"), {
      method: "PUT",
      cache: "no-store",
      headers: await buildAdminJsonHeaders(),
      body,
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
            : "Failed to call musicserver /admin/config",
      },
      { status: 500 },
    );
  }
}
