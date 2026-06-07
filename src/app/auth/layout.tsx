import type { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#020d1a]">
      {children}
    </div>
  );
}
