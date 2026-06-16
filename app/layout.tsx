import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DemoBanner from "@/components/DemoBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MediConnect — Telehealth Platform Demo",
  description:
    "Appointment scheduling, patient portal, doctor dashboard, and WebRTC video consultations. Portfolio demo by DevAxon.",
  openGraph: {
    title: "MediConnect — Telehealth Platform Demo",
    description:
      "Try telehealth as a patient or doctor — book visits, join video consults, manage records.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
