import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getWorkflowById } from "@/services/workflow.service";
import { getRunsByWorkflow } from "@/services/workflowRun.service";
import { parseWorkflowDefinition } from "@/lib/workflow/definition";
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
  const definition = parseWorkflowDefinition(workflow.definition);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-muted-foreground transition-colors hover:text-foreground"
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

      <section className="flex max-w-2xl flex-col gap-2">
        <h2 className="text-sm font-medium">Prompt</h2>
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground">
          {definition.prompt}
        </p>
        <p className="text-xs text-muted-foreground">
          Saved on this workflow — used every time you run it.
        </p>
      </section>

      {definition.inputFields.length > 0 && (
        <section className="flex max-w-2xl flex-col gap-2">
          <h2 className="text-sm font-medium">Run input fields</h2>
          <ul className="flex flex-col gap-2">
            {definition.inputFields.map((field) => (
              <li
                key={field.key}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm"
              >
                <span>{field.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {field.key}
                  {field.required ? " · required" : " · optional"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <WorkflowRunsPanel
        workflowId={workflowId}
        inputFields={definition.inputFields}
        initialRuns={runs.map((run) => ({
          id: run.id,
          status: run.status,
          createdAt: run.createdAt.toISOString(),
          input: run.input,
          output: run.output,
          error: run.error,
        }))}
      />
    </div>
  );
}
