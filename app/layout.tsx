import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Rajmahal Palace — Where Kings Once Dreamed",
  description: "A cinematic journey through a fictional royal lake palace in Udaipur.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&family=Manrope:wght@300;400;500&display=swap" rel="stylesheet"/></head><body>{children}</body></html>;
}
