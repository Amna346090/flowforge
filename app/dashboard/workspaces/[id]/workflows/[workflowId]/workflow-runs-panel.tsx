"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Play } from "lucide-react";
import { FormMessage, formatApiError } from "@/components/ui/form-message";
import {
  buildRunInput,
  type WorkflowInputField,
} from "@/lib/workflow/definition";

type WorkflowRun = {
  id: string;
  status: string;
  createdAt: string;
  input: unknown;
  output: unknown;
  error: string | null;
};

const statusStyles: Record<string, string> = {
  QUEUED: "bg-yellow-500/10 text-yellow-600",
  RUNNING: "bg-blue-500/10 text-blue-600",
  SUCCESS: "bg-green-500/10 text-green-600",
  FAILED: "bg-red-500/10 text-red-600",
};

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

function isActiveStatus(status: string) {
  return status === "QUEUED" || status === "RUNNING";
}

function emptyValues(fields: WorkflowInputField[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

function formatRunOutput(output: unknown): string | null {
  if (output === null || output === undefined) return null;

  if (typeof output === "object") {
    const record = output as Record<string, unknown>;
    if (typeof record.message === "string") {
      return record.message;
    }
  }

  return JSON.stringify(output, null, 2);
}

function formatRunInput(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "object" && Object.keys(input as object).length === 0) {
    return null;
  }
  return JSON.stringify(input, null, 2);
}

export function WorkflowRunsPanel({
  workflowId,
  inputFields,
  initialRuns,
}: {
  workflowId: string;
  inputFields: WorkflowInputField[];
  initialRuns: WorkflowRun[];
}) {
  const [runs, setRuns] = useState(initialRuns);
  const [running, setRunning] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>(() =>
    emptyValues(inputFields)
  );

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
    setValues(emptyValues(inputFields));
  }, [inputFields]);

  useEffect(() => {
    if (!hasActiveRuns) return;

    const interval = setInterval(fetchRuns, 2000);
    return () => clearInterval(interval);
  }, [hasActiveRuns, fetchRuns]);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setRunning(true);

    try {
      const input = buildRunInput(inputFields, values);

      const res = await fetch(`/api/workflows/${workflowId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(formatApiError(data.error));
        return;
      }

      setValues(emptyValues(inputFields));
      await fetchRuns();
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleRun}
        className="flex max-w-lg flex-col gap-4 rounded-lg border border-border bg-card p-4"
      >
        <div>
          <h2 className="text-base font-semibold">Run input</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Data for this run only — fields are defined on this workflow.
          </p>
        </div>

        {inputFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This workflow does not require run input.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {inputFields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label htmlFor={`run-${field.key}`} className="text-sm font-medium">
                  {field.label}
                  {!field.required && (
                    <span className="font-normal text-muted-foreground"> (optional)</span>
                  )}
                </label>
                <input
                  id={`run-${field.key}`}
                  type={field.type}
                  required={field.required}
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((current) => ({
                      ...current,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className={inputClassName}
                />
              </div>
            ))}
          </div>
        )}

        <FormMessage variant="error" messages={errors} />

        <div>
          <button
            type="submit"
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
      </form>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            Run history
          </h2>
          {hasActiveRuns && (
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Updating...
            </span>
          )}
        </div>

        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-14 text-center">
            <Play className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No runs yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fill in the run input and trigger a run.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {runs.map((run) => {
              const outputText = formatRunOutput(run.output);
              const inputText = formatRunInput(run.input);

              return (
                <div
                  key={run.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {new Date(run.createdAt).toLocaleString()}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {run.id}
                      </span>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[run.status] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {run.status === "RUNNING" && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      {run.status}
                    </span>
                  </div>

                  {run.status === "SUCCESS" && outputText && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Output
                      </span>
                      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap">
                        {outputText}
                      </p>
                    </div>
                  )}

                  {run.status === "FAILED" && run.error && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-destructive">Error</span>
                      <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {run.error}
                      </p>
                    </div>
                  )}

                  {inputText && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Input used
                      </span>
                      <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
                        {inputText}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
