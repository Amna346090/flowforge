import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getWorkflowById } from "@/services/workflow.service";
import { getRunsByWorkflow } from "@/services/workflowRun.service";
import { ArrowLeft } from "lucide-react";
import { WorkflowRunsPanel } from "./workflow-runs-panel";

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

      <WorkflowRunsPanel
        workflowId={workflowId}
        initialRuns={runs.map((run) => ({
          id: run.id,
          status: run.status,
          createdAt: run.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
