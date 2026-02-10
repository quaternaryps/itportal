import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT Portal - Agentic Management",
  description: "IT Architectural Portal for Agentic Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
