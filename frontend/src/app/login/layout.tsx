import type { Metadata } from "next";
import { AuroraBackground } from "@/components/landing/motion";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#070D1B] p-4">
      <AuroraBackground />
      <div className="relative z-10 flex w-full justify-center">
        {children}
      </div>
    </div>
  );
}
