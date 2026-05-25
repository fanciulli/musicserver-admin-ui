import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import type { PropsWithChildren } from "react";
import { cookies } from "next/headers";

function extractUsernameFromToken(token: string): string {
  try {
    const prefix = token.split(".")[0];
    return Buffer.from(prefix, "base64url").toString("utf8");
  } catch {
    return "Administrator";
  }
}

export default async function AdminLayout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value ?? "";
  const username = token ? extractUsernameFromToken(token) : "Administrator";

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header username={username} />

        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
