import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Geist, Geist_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: 'Admin Dashboard | CareerQuest',
  description: 'Administrative dashboard for CareerQuest',
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has admin role
  if (!session || (session.user as { role?: string })?.role !== 'Admin') {
    redirect('/login');
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
              <div className="container flex h-16 items-center justify-between py-4 px-12">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">CareerQuest Admin</h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Could add logout button or user info here */}
                  <a 
                    href="/api/auth/signout"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </a>
                </div>
              </div>
            </header>
            <div className="flex flex-1"><aside className=" px-12 w-64 bg-muted/40 hidden md:block p-6 pt-8 border-r">
                <div className="flex items-center mb-8">
                  <h2 className="text-xl font-bold">Admin Panel</h2>
                </div>
                <nav className="space-y-1">
                  <a 
                    href="/admin/dashboard" 
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <rect width="7" height="9" x="3" y="3" rx="1" />
                      <rect width="7" height="5" x="14" y="3" rx="1" />
                      <rect width="7" height="9" x="14" y="12" rx="1" />
                      <rect width="7" height="5" x="3" y="16" rx="1" />
                    </svg>
                    <span>Dashboard</span>
                  </a>
                  <a 
                    href="/admin/users" 
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>User Management</span>
                  </a>
                </nav>
              </aside>
              <main className="flex-1 overflow-auto">
                <div className="container py-6 md:py-8">
                  {children}
                </div>              </main>
            </div>
          </div>
      </body>
    </html>
  );
}
