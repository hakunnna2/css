import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Club Points Dashboard",
  description: "Manage member attendance, activity performance, and total points.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
          <style>
            {`
              /* Custom scrollbar for better aesthetics */
              ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              ::-webkit-scrollbar-track {
                background: #f1f1f1;
              }
              ::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 4px;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
              .dark ::-webkit-scrollbar-track {
                background: #2d3748;
              }
              .dark ::-webkit-scrollbar-thumb {
                background: #718096;
              }
              .dark ::-webkit-scrollbar-thumb:hover {
                background: #a0aec0;
              }
            `}
          </style>
       </head>
      <body className="bg-gray-100 dark:bg-gray-900">{children}</body>
    </html>
  );
}
