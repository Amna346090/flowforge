import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getWorkspaceById } from "@/services/workspace.service";
import { getWorkflowsByWorkspace } from "@/services/workflow.service";
import { getMembersByWorkspace } from "@/services/membership.service";
import { ArrowLeft, Plus, Play, Users, Workflow } from "lucide-react";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  let workspace;
  try {
    workspace = await getWorkspaceById(userId, id);
  } catch {
    notFound();
  }

  const [workflows, members] = await Promise.all([
    getWorkflowsByWorkspace(userId, id),
    getMembersByWorkspace(userId, id),
  ]);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{workspace.name}</h1>
          <p className="text-sm text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""} · {workflows.length} workflow{workflows.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Workflow className="h-4 w-4" />
              Workflows
            </h2>
            <Link
              href={`/dashboard/workspaces/${id}/workflows/new`}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              New workflow
            </Link>
          </div>

          {workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-14 text-center">
              <Workflow className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No workflows yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first workflow to start automating.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{wf.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Updated {new Date(wf.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/workspaces/${id}/workflows/${wf.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <Play className="h-3 w-3" />
                    Open
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4 w-4" />
            Members
          </h2>
          <div className="flex flex-col gap-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {m.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{m.user.name}</span>
                    <span className="text-xs text-muted-foreground">{m.user.email}</span>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                  {m.role.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
