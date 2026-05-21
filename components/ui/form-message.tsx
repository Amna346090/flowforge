import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FormMessageProps = {
  variant: "error" | "success";
  messages: string[];
  className?: string;
};

export function FormMessage({ variant, messages, className }: FormMessageProps) {
  if (messages.length === 0) return null;

  const isError = variant === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-sm",
        isError
          ? "border-destructive/25 bg-destructive/10 text-destructive"
          : "border-green-600/25 bg-green-500/10 text-green-700 dark:text-green-400",
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      {messages.length === 1 ? (
        <p>{messages[0]}</p>
      ) : (
        <ul className="flex list-disc flex-col gap-1 pl-4">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function formatApiError(error: unknown): string[] {
  if (typeof error === "string") return [error];

  if (error && typeof error === "object") {
    const messages = Object.values(error as Record<string, unknown>)
      .flat()
      .filter((value): value is string => typeof value === "string");

    if (messages.length > 0) return messages;
  }

  return ["Something went wrong."];
}
