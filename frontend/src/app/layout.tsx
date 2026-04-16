import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProposalAI — Propostas comerciais com inteligencia artificial",
  description:
    "Crie propostas comerciais profissionais em minutos. Preencha os dados do cliente, a IA gera o texto, voce edita e exporta em PDF. Gratis para freelancers e agencias.",
  openGraph: {
    title: "ProposalAI — Crie propostas comerciais com IA",
    description:
      "Gere propostas comerciais completas em minutos. Preencha os dados, a IA monta o texto, voce ajusta e exporta. Feito para freelancers, profissionais e agencias.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
