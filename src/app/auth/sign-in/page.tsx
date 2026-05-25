import Signin from "@/components/Auth/Signin";
import darkLogo from "@/assets/logos/dark.svg";
import logo from "@/assets/logos/main.svg";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-dark">
      <div className="mb-8 flex flex-col items-center gap-4">
        <Image
          src={logo}
          width={174}
          height={30}
          alt="Music Server"
          className="dark:hidden"
          priority
        />
        <Image
          src={darkLogo}
          width={174}
          height={30}
          alt="Music Server"
          className="hidden dark:block"
          priority
        />
        <h1 className="text-xl font-bold text-dark dark:text-white">
          Administrator console
        </h1>
      </div>

      <Signin />
    </div>
  );
}
