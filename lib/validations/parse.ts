import { z } from "zod";

export function parseBody<T extends z.ZodType>(
  schema: T,
  body: unknown
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: Record<string, string[] | undefined> } {
  const result = schema.safeParse(body);

  if (!result.success) {
    const flattened = result.error.flatten();
    return {
      success: false,
      error: {
        ...flattened.fieldErrors,
        ...(flattened.formErrors.length > 0
          ? { _errors: flattened.formErrors }
          : {}),
      },
    };
  }

  return { success: true, data: result.data };
}
