import Link from "next/link";
import { Workflow, Zap, GitBranch, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-8 text-center max-w-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Workflow className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight">FlowForge</span>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Automate your workflows
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Build, run, and monitor multi-step workflows across your team —
            with full execution history and role-based access control.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-1.5 rounded-lg border p-4">
            <Zap className="h-5 w-5 text-primary" />
            <span>Fast execution</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-lg border p-4">
            <GitBranch className="h-5 w-5 text-primary" />
            <span>Team workspaces</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-lg border p-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Run history</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-base font-medium transition-colors hover:bg-muted"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
