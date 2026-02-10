import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      action={{ label: "Go to Dashboard", href: "/dashboard" }}
    />
  );
}
