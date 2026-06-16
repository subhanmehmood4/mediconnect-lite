import VideoRoom from "@/components/VideoRoom";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

interface Props {
  params: { appointmentId: string };
}

export default async function ConsultPage({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", params.appointmentId)
    .maybeSingle();

  if (!appointment) notFound();

  if (
    appointment.patient_id !== user.id &&
    appointment.doctor_id !== user.id
  ) {
    redirect(profile?.role === "doctor" ? "/doctor" : "/patient");
  }

  const role = profile?.role === "doctor" ? "doctor" : "patient";
  const redirectPath = role === "doctor" ? "/doctor" : "/patient";

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <VideoRoom
        appointmentId={params.appointmentId}
        role={role}
        redirectPath={redirectPath}
      />
    </div>
  );
}
