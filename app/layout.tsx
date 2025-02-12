import { ReactNode } from "react";
import { Lato } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";



const font = Lato({ subsets: ["latin"], weight: ["400", "700"] })

export const viewport: Viewport = {
  // Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme={config.colors.theme} className={font.className}>
      <body>
        <ReactQueryProvider><ThemeProvider >
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </ThemeProvider></ReactQueryProvider>
         
       
      </body>
    </html>
  );
}
