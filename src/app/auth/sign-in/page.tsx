import Signin from "@/components/Auth/Signin";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-dark">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo />
        <h1 className="text-xl font-bold text-dark dark:text-white">
          Administrator console
        </h1>
      </div>

      <Signin />
    </div>
  );
}
