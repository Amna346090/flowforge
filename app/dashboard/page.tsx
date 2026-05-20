import Link from "next/link";
import { auth } from "@/auth";
import { listUserWorkspaces } from "@/services/workspace.service";
import { Plus, FolderOpen } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const workspaces = await listUserWorkspaces(userId);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Select a workspace to manage workflows and team members.
          </p>
        </div>
        <Link
          href="/dashboard/workspaces/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New workspace
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <FolderOpen className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">No workspaces yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first workspace to get started.
          </p>
          <Link
            href="/dashboard/workspaces/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New workspace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/dashboard/workspaces/${ws.id}`}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-card/80"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary font-semibold text-sm">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{ws.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Created {new Date(ws.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
