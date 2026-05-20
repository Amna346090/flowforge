import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getWorkflowById } from "@/services/workflow.service";
import { getRunsByWorkflow } from "@/services/workflowRun.service";
import { ArrowLeft, Play } from "lucide-react";
import { RunWorkflowButton } from "./run-button";

const statusStyles: Record<string, string> = {
  QUEUED: "bg-yellow-500/10 text-yellow-600",
  RUNNING: "bg-blue-500/10 text-blue-600",
  SUCCESS: "bg-green-500/10 text-green-600",
  FAILED: "bg-red-500/10 text-red-600",
};

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string; workflowId: string }>;
}) {
  const { id: workspaceId, workflowId } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  let workflow;
  try {
    workflow = await getWorkflowById(userId, workflowId);
  } catch {
    notFound();
  }

  const runs = await getRunsByWorkflow(userId, workflowId);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/workspaces/${workspaceId}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{workflow.name}</h1>
            <p className="text-sm text-muted-foreground">
              {runs.length} run{runs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <RunWorkflowButton workflowId={workflowId} />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Play className="h-4 w-4" />
          Run history
        </h2>

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
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[run.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {run.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
