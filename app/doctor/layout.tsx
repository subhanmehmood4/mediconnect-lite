import AppShell from "@/components/AppShell";
import { getDemoRoleFromCookies, isDemoMode } from "@/lib/demoMode";
import { DEMO_DOCTOR } from "@/lib/demoStore";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV = [{ href: "/doctor", label: "Schedule" }];

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isDemoMode()) {
    const role = await getDemoRoleFromCookies();
    if (role !== "doctor") redirect("/login");

    return (
      <AppShell
        role="doctor"
        userEmail="doctor@mediconnect.demo"
        userName={DEMO_DOCTOR.full_name}
        navItems={NAV}
        demoMode
      >
        {children}
      </AppShell>
    );
  }

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

  if (profile?.role !== "doctor") redirect("/patient");

  return (
    <AppShell
      role="doctor"
      userEmail={user.email}
      userName={profile?.full_name}
      navItems={NAV}
    >
      {children}
    </AppShell>
  );
}
