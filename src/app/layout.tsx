import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GITA - O'quv Tizimi",
  description: "O'quv kurslari va guruhlar boshqaruvi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
