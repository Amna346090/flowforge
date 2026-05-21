"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FormMessage, formatApiError } from "@/components/ui/form-message";
import {
  InputFieldsEditor,
  normalizeInputFieldDrafts,
  validateInputFieldDrafts,
  type InputFieldDraft,
} from "@/components/workflow/input-fields-editor";

export default function NewWorkflowPage() {
  const router = useRouter();
  const { id: workspaceId } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [inputFields, setInputFields] = useState<InputFieldDraft[]>([
    {
      key: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Jane Smith",
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "jane@example.com",
    },
    {
      key: "role",
      label: "Role",
      type: "text",
      required: false,
      placeholder: "Product Designer",
    },
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const fieldError = validateInputFieldDrafts(inputFields);
    if (fieldError) {
      setErrors([fieldError]);
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/workspaces/${workspaceId}/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        definition: {
          prompt: prompt.trim(),
          inputFields: normalizeInputFieldDrafts(inputFields),
        },
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors(formatApiError(data.error));
      return;
    }

    router.push(`/dashboard/workspaces/${workspaceId}/workflows/${data.id}`);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New workflow</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Workflow name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Send welcome email"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            A label for your team — it does not control what runs.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="prompt" className="text-sm font-medium">
            Prompt
          </label>
          <textarea
            id="prompt"
            required
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write a friendly welcome email for a new team member. Use their name and role from the run input."
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            Instructions saved on the workflow — the same every time you run it.
          </p>
        </div>

        <InputFieldsEditor fields={inputFields} onChange={setInputFields} />

        <FormMessage variant="error" messages={errors} />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create workflow
          </button>
          <Link
            href={`/dashboard/workspaces/${workspaceId}`}
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
