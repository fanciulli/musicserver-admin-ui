import { buildMusicServerUrl } from "@/lib/musicserver-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(buildMusicServerUrl("/admin/api-keys"), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch API keys" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(buildMusicServerUrl("/admin/api-keys"), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create API key" },
      { status: 500 },
    );
  }
}
