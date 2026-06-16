import { DEMO_DISCLAIMER } from "@/lib/constants";
import { isDemoMode } from "@/lib/demoMode";

export default function DemoBanner() {
  const offline = isDemoMode();

  return (
    <div className="border-b border-violet-500/20 bg-violet-500/10 px-4 py-2 text-center text-xs text-violet-200">
      {DEMO_DISCLAIMER}
      {offline && (
        <span className="ml-2 text-violet-300/80">
          · Running in offline demo mode (no Supabase).
        </span>
      )}
    </div>
  );
}
