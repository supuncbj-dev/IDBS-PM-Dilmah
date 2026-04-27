import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Command Center',
  description: 'Enterprise Project Management Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-zinc-950">
        <nav className="fixed top-0 w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
          <div className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-500">Command Center</div>
          <div className="flex gap-4 items-center">
            <span className="p-2 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">🔔</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
          </div>
        </nav>
        <main className="pt-16 pb-16 md:pb-0 px-4 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
