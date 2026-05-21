"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Play } from "lucide-react";

type WorkflowRun = {
  id: string;
  status: string;
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  QUEUED: "bg-yellow-500/10 text-yellow-600",
  RUNNING: "bg-blue-500/10 text-blue-600",
  SUCCESS: "bg-green-500/10 text-green-600",
  FAILED: "bg-red-500/10 text-red-600",
};

function isActiveStatus(status: string) {
  return status === "QUEUED" || status === "RUNNING";
}

export function WorkflowRunsPanel({
  workflowId,
  initialRuns,
}: {
  workflowId: string;
  initialRuns: WorkflowRun[];
}) {
  const [runs, setRuns] = useState(initialRuns);
  const [running, setRunning] = useState(false);

  const fetchRuns = useCallback(async () => {
    const res = await fetch(`/api/workflows/${workflowId}/runs`);
    if (!res.ok) return;
    const data: WorkflowRun[] = await res.json();
    setRuns(data);
  }, [workflowId]);

  const hasActiveRuns = runs.some((run) => isActiveStatus(run.status));

  useEffect(() => {
    setRuns(initialRuns);
  }, [initialRuns]);

  useEffect(() => {
    if (!hasActiveRuns) return;

    const interval = setInterval(fetchRuns, 2000);
    return () => clearInterval(interval);
  }, [hasActiveRuns, fetchRuns]);

  async function handleRun() {
    setRunning(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: {} }),
      });
      if (res.ok) {
        await fetchRuns();
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Play className="h-4 w-4" />
          Run history
          {hasActiveRuns && (
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Updating...
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run workflow
        </button>
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-14 text-center">
          <Play className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No runs yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Trigger a run to see execution history.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <div
              key={run.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-muted-foreground">{run.id}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(run.createdAt).toLocaleString()}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[run.status] ?? "bg-muted text-muted-foreground"}`}
              >
                {run.status === "RUNNING" && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {run.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
