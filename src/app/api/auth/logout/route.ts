import {
  buildMusicServerUrl,
  backendFetch,
  buildAdminHeaders,
} from "@/lib/musicserver-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const headers = await buildAdminHeaders();
    if ((headers as Record<string, string>)["Authorization"]) {
      await backendFetch(buildMusicServerUrl("/admin/logout"), {
        method: "POST",
        headers,
      });
    }
  } catch {
    // best-effort: always clear the cookie
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
