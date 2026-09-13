import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SysDictionary · Diccionario técnico ISC",
    template: "%s · SysDictionary",
  },
  description:
    "Diccionario técnico especializado en Ingeniería en Sistemas Computacionales. Consulta términos de programación, redes, bases de datos, cloud y ciberseguridad.",
  keywords: [
    "diccionario técnico",
    "ingeniería en sistemas",
    "ISC",
    "programación",
    "bases de datos",
    "redes",
    "ciberseguridad",
    "cloud",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}