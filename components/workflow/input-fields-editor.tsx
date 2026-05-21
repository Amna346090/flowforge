"use client";

import { Plus, Trash2 } from "lucide-react";
import type { WorkflowInputField } from "@/lib/workflow/definition";

export type InputFieldDraft = WorkflowInputField;

type InputFieldsEditorProps = {
  fields: InputFieldDraft[];
  onChange: (fields: InputFieldDraft[]) => void;
};

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

const emptyField = (): InputFieldDraft => ({
  key: "",
  label: "",
  type: "text",
  required: false,
});

export function InputFieldsEditor({ fields, onChange }: InputFieldsEditorProps) {
  function updateField(index: number, patch: Partial<InputFieldDraft>) {
    onChange(fields.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function addField() {
    onChange([...fields, emptyField()]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium">Run input fields</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Define what data each run needs — different workflows can ask for different fields.
        </p>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          No input fields — runs will send empty input.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium">Key</label>
                  <input
                    type="text"
                    required
                    value={field.key}
                    onChange={(e) => updateField(index, { key: e.target.value })}
                    placeholder="name"
                    className={inputClassName}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium">Label</label>
                  <input
                    type="text"
                    required
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="Name"
                    className={inputClassName}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(index, {
                        type: e.target.value as InputFieldDraft["type"],
                      })
                    }
                    className={inputClassName}
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium">Placeholder</label>
                  <input
                    type="text"
                    value={field.placeholder ?? ""}
                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                    placeholder="Jane Smith"
                    className={inputClassName}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(index, { required: e.target.checked })}
                    className="rounded border-input"
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addField}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        <Plus className="h-3.5 w-3.5" />
        Add field
      </button>
    </div>
  );
}

export function validateInputFieldDrafts(fields: InputFieldDraft[]): string | null {
  const keys = new Set<string>();

  for (const field of fields) {
    if (!field.key.trim() || !field.label.trim()) {
      return "Each input field needs a key and label.";
    }

    const key = field.key.trim();
    if (keys.has(key)) {
      return `Duplicate field key: ${key}`;
    }
    keys.add(key);

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
      return `Invalid key "${key}" — use letters, numbers, and underscores.`;
    }
  }

  return null;
}

export function normalizeInputFieldDrafts(fields: InputFieldDraft[]): WorkflowInputField[] {
  return fields.map((field) => ({
    key: field.key.trim(),
    label: field.label.trim(),
    type: field.type,
    required: field.required,
    ...(field.placeholder?.trim()
      ? { placeholder: field.placeholder.trim() }
      : {}),
  }));
}
