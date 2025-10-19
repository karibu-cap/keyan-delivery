import { FontOptimizer } from "@/components/ClsOptimization";
import Navbar from "@/components/Navbar";
import { OfflineIndicator, OfflineProvider } from "@/components/OfflineSupport";
import ServiceWorkerRegistration from "@/components/notifications/ServiceWorkerRegistration";
import { Toaster } from "@/components/ui/toaster";
import { routing } from "@/i18n/routing";
import { generateHomeMetadata, generateOrganizationStructuredData } from "@/lib/metadata";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
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
     ...generateHomeMetadata,
     manifest: "/manifest.json",
     appleWebApp: {
          capable: true,
          statusBarStyle: "default",
          title: "Yetu Delivery",
     },
     themeColor: "#10b981",
     viewport: {
          width: "device-width",
          initialScale: 1,
          maximumScale: 1,
          userScalable: false,
          viewportFit: "cover",
     },
};

export default async function RootLayout({
     children,
     params
}: Readonly<{
     children: React.ReactNode;
     params: Promise<{ locale: string }>;
}>) {
     const { locale } = await params;

     if (!hasLocale(routing.locales, locale)) {
          notFound();
     }

     return (
          <html lang={locale}>
               <head>
                    <link rel="manifest" href="/manifest.json" />
                    <meta name="theme-color" content="#10b981" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    <meta name="apple-mobile-web-app-title" content="Yetu Delivery" />
                    <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                    <link rel="icon" href="/favicon.ico" />

                    {/* Organization Structured Data */}
                    <script
                         type="application/ld+json"
                         dangerouslySetInnerHTML={{
                              __html: JSON.stringify(generateOrganizationStructuredData()),
                         }}
                    />

                    {/* Font preloading for CLS prevention */}
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

               </head>
               <body
                    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
               >
                    <ServiceWorkerRegistration />
                    <NextIntlClientProvider>

                         <FontOptimizer>
                              <OfflineProvider>
                                   <Navbar />
                                   {children}
                                   <Toaster />
                                   <OfflineIndicator />
                              </OfflineProvider>
                         </FontOptimizer>
                    </NextIntlClientProvider>

               </body>
          </html>
     );
}
