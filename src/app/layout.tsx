import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CubeFlux",
  description:
    "CubeFlux is an interactive 3D Rubik's Cube solver with physical move animations.",
  icons: {
    icon: "/cube-icon.png",
    shortcut: "/cube-icon.png",
    apple: "/cube-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}