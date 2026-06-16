import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/patient", label: "Dashboard" },
  { href: "/patient/book", label: "Book visit" },
  { href: "/patient/records", label: "Records" },
];

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "patient") redirect("/doctor");

  return (
    <AppShell
      role="patient"
      userEmail={user.email}
      userName={profile?.full_name}
      navItems={NAV}
    >
      {children}
    </AppShell>
  );
}
