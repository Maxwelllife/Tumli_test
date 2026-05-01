import type { ButtonHTMLAttributes } from "react";

import { cn } from "../lib/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  danger: "btn-danger",
  ghost: "text-ink-800 hover:bg-black/[0.04]",
  primary: "btn-primary",
  secondary: "btn-secondary",
};

export function Button({
  className,
  variant = "secondary",
  ...props
}: ButtonProps) {
  return <button className={cn("btn", variantClasses[variant], className)} {...props} />;
}
