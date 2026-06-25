import { buildMusicServerUrl } from "@/lib/musicserver-api";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const response = await fetch(
      buildMusicServerUrl("/admin/change-password"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: response.status === 401 ? "Current password is incorrect" : "Failed to change password" },
        { status: response.status },
      );
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("session_token", "", {
      httpOnly: true,
      secure: process.env.HTTPS_ENABLED === "true",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to change password" },
      { status: 500 },
    );
  }
}
