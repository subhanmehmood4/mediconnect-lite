"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

interface AppShellProps {
  role: "patient" | "doctor";
  userEmail?: string | null;
  userName?: string | null;
  navItems: NavItem[];
  children: React.ReactNode;
}

export default function AppShell({
  role,
  userEmail,
  userName,
  navItems,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/80 lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-500/30">
            <span className="font-bold text-violet-400">M</span>
          </div>
          <div>
            <p className="font-semibold text-white">MediConnect</p>
            <p className="text-xs capitalize text-slate-500">{role} portal</p>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-violet-500/15 text-violet-300"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur sm:px-6">
          <div className="lg:hidden">
            <p className="font-semibold text-white">MediConnect</p>
            <p className="text-xs capitalize text-slate-500">{role}</p>
          </div>
          <div className="hidden text-sm text-slate-400 lg:block">
            Signed in as{" "}
            <span className="text-white">{userName ?? userEmail ?? "User"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-xs ${
                    pathname === item.href
                      ? "bg-violet-500/20 text-violet-300"
                      : "text-slate-400"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
