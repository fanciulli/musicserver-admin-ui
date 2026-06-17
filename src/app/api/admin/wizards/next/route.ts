import {
  buildMusicServerUrl,
  buildAdminHeaders,
  backendFetch,
} from "@/lib/musicserver-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await backendFetch(
      buildMusicServerUrl("/admin/wizards/next"),
      {
        cache: "no-store",
        headers: await buildAdminHeaders(),
      },
    );

    // No wizard to show: forward the 204 unchanged so the client can stop.
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

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
            : "Failed to call musicserver /admin/wizards/next",
      },
      { status: 500 },
    );
  }
}
