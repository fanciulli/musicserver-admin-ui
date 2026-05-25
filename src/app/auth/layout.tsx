import type { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#020d1a]">
      {children}
    </div>
  );
}
