import type { ReactNode } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: "span" | "div" | "p";
}

export function VisuallyHidden({ children, as: Tag = "span" }: VisuallyHiddenProps) {
  return <Tag className="sr-only">{children}</Tag>;
}
