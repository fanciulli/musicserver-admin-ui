import { buildMusicServerUrl, backendFetch } from "@/lib/musicserver-api";
import { NextRequest, NextResponse } from "next/server";

const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await backendFetch(buildMusicServerUrl("/admin/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: response.status === 401 ? "Invalid credentials" : "Login failed" },
        { status: response.status },
      );
    }

    const { token } = (await response.json()) as { token: string };

    const res = NextResponse.json({ success: true });
    res.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 },
    );
  }
}
