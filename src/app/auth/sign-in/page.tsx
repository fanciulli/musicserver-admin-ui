import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-dark">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Image
          src={"/images/logo/logo-dark.svg"}
          alt="Logo"
          width={140}
          height={28}
          className="dark:hidden"
        />
        <Image
          src={"/images/logo/logo.svg"}
          alt="Logo"
          width={140}
          height={28}
          className="hidden dark:block"
        />
        <h1 className="text-xl font-bold text-dark dark:text-white">
          Admin Login
        </h1>
      </div>

      <Signin />
    </div>
  );
}
