import type { Metadata, Viewport } from "next";
import "./globals.css";
import { IosCalloutGuard } from "./IosCalloutGuard";

export const metadata: Metadata = {
  title: "Drinks CRM",
  description: "Рабочий терминал для учета остатков, приходов, перемещений, финансов и закрытия дня",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#101216"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="no-ios-callout">
        <IosCalloutGuard />
        {children}
      </body>
    </html>
  );
}
