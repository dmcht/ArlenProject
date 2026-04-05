import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | Conecta Platino",
  description: "Accede a Conecta Platino",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-200/80 via-sky-100 to-[#dff5eb] px-4 py-10">
      <Link
        href="/"
        className="mb-6 text-sm font-semibold text-sky-800 hover:underline"
      >
        ← Conecta Platino
      </Link>
      <LoginForm />
    </div>
  );
}
