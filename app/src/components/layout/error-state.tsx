import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";

const STRINGS = {
  title: "Something went wrong",
  retry: "Try again",
};

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
};

export function describeError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Alert variant="destructive" role="alert" data-testid="error-state">
      <AlertTitle>{STRINGS.title}</AlertTitle>
      <AlertDescription>{describeError(error)}</AlertDescription>
      {onRetry ? (
        <AlertAction>
          <Button size="sm" variant="outline" onClick={onRetry}>
            {STRINGS.retry}
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  );
}
