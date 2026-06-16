import { DEMO_DISCLAIMER } from "@/lib/constants";

export default function DemoBanner() {
  return (
    <div className="border-b border-violet-500/20 bg-violet-500/10 px-4 py-2 text-center text-xs text-violet-200">
      {DEMO_DISCLAIMER}
    </div>
  );
}
