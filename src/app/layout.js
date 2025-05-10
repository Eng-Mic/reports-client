import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ClientLayout from "./ClientLayout";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});

export const metadata = {
  title: "Reports",
  description: "Hourly Reports",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/icon.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/icon.png",
      },
    ]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={cn("font-poppins antialiased", poppins.variable)}
      >
          <Toaster position="top-center" />
          <>
            <ClientLayout>{children}</ClientLayout>
          </>
      </body>
    </html>
  );
}
