import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: "PredictiveRunning",
  description: "PredictiveRunning",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "dark",
          }}
        >
          <div className="relative flex flex-col h-screen">
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
