/**
 * Error Message Component
 * Displays error messages in a user-friendly way
 */

interface ErrorMessageProps {
  error: Error | { message?: string; code?: string } | string;
  title?: string;
}

export function ErrorMessage({ error, title = "Error" }: ErrorMessageProps) {
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : error.message || "An error occurred";

  const code =
    typeof error === "object" && "code" in error ? error.code : undefined;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="text-red-800 font-semibold mb-2">{title}</h3>
      <p className="text-red-700">{message}</p>
      {code && (
        <p className="text-sm text-red-600 mt-2">Error Code: {code}</p>
      )}
    </div>
  );
}
