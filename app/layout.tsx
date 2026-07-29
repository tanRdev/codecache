import type { Metadata, Viewport } from "next";
import { ReactGrabLoader } from "@/components/react-grab-loader";
import "./globals.css";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl =
  configuredSiteUrl && URL.canParse(configuredSiteUrl)
    ? configuredSiteUrl
    : "http://localhost:3000";
const siteDescription =
  "A local-first code snippet library for your terminal and browser, backed by SQLite and files you control.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl, "http://localhost:3000"),
  applicationName: "Cache",
  title: {
    default: "Cache — Your code library, on your machine",
    template: "%s | Cache",
  },
  description: siteDescription,
  alternates: {
    canonical: siteUrl,
  },
  category: "developer tools",
  keywords: [
    "cache",
    "code snippets",
    "developer tools",
    "sqlite",
    "local-first",
    "self-hosted",
    "cli",
    "next.js",
  ],
  openGraph: {
    title: "Cache — Your code library, on your machine",
    description: siteDescription,
    url: siteUrl,
    siteName: "Cache",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cache — Your code library, on your machine",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0b0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="dark"
    >
      <body
        className="bg-background font-sans text-foreground antialiased"
      >
        {children}
        <ReactGrabLoader />
      </body>
    </html>
  );
}
