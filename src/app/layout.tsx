import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodLedger - Blockchain Food Memberships",
  description: "Tokenized restaurant membership platform powered by blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
