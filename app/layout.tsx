import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fieldcraft Technician Training",
  description: "Company field training and technician skill records.",
  other: {
    "codex-preview": "development",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Fieldcraft", statusBarStyle: "default" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
