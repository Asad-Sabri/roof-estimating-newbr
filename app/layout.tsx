import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Smooch_Sans,  } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import ReduxProvider from "@/redux/ReduxProvider";
import ReactQueryProvider from "@/redux/ReactQueryProvider";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const smoochSans = Smooch_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-smooch-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Roof Estimate",
  description: "Roofing estimate calculator and generator",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={smoochSans.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${smoochSans.variable} ${poppins.variable} antialiased`}
      >
        <ReduxProvider>
          <ReactQueryProvider>
            <Suspense
              fallback={
                <div className="w-full h-screen flex justify-center items-center">
                  Loading...
                </div>
              }
            >
              <ClientLayout>{children}</ClientLayout>
              <ToastContainer />{" "}
            </Suspense>
          </ReactQueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
