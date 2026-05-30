import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-dark">
      <div className="mb-8 flex flex-col items-center gap-1">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Music Server
        </h1>
        <p className="text-lg font-medium text-gray-500 dark:text-dark-6">
          Administrator console
        </p>
      </div>

      <Signin />

      <p className="mt-6 text-center text-sm text-gray-400 dark:text-dark-6">
        &copy;2026 Massimiliano Fanciulli
      </p>
    </div>
  );
}
