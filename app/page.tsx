import Link from "next/link";
import { Workflow, Zap, GitBranch, BarChart3 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex max-w-xl flex-col items-center gap-8 text-center">
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
          <p className="text-lg leading-relaxed text-muted-foreground">
            Build, run, and monitor multi-step workflows across your team —
            with full execution history and role-based access control.
          </p>
        </div>

        <div className="grid w-full grid-cols-3 gap-4 text-sm text-muted-foreground">
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
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            Sign in
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
