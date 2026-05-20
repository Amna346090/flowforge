"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2 } from "lucide-react";

export function RunWorkflowButton({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    await fetch(`/api/workflows/${workflowId}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: {} }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleRun}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      Run workflow
    </button>
  );
}
