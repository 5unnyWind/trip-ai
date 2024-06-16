import { Providers } from "./providers";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trip-AI",
  description: "旅游攻略智能生成",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} p-12`}>
        <Providers>{children}</Providers>
        <div className="text-3xl font-semibold opacity-20 fixed bottom-4 flex items-center">
          Trip AI
          <a href="https://github.com/5unnyWind/trip-ai">
            <GitHubLogoIcon className=" w-8 h-8 ml-4" />
          </a>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
